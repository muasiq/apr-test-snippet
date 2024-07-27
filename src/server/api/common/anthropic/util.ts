import { NurseInterviewQuestionItem, PatientArtifactTag } from '@prisma/client';
import { ParserOptions } from 'xml2js';
import { ZodRawShape, z } from 'zod';
import {
	NurseInterviewQuestion,
	ShortLabels,
	lookupQuestionByShortLabel,
} from '../../../../assessments/nurse-interview/questions';
import { interviewResponseLookup } from '../../../../common/utils/interviewResponseLookup';
import { PatientWithAssessmentContext } from '../../routers/patient/patient.types';
import { PatientArtifactWithParagraphs } from '../../routers/patientArtifact/patientArtifact.types';
import { generateCompletion } from './claude';
import { schemaBasedCompletionParser } from './xmlParser';

type AllNotesPrompt<A extends ZodRawShape, B> = {
	patient: PatientWithAssessmentContext;
	getSystemPrompt: (notes: string) => string;
	humanPrompt: string;
	schema: z.ZodObject<A>;
	backupResult: B;
	trimToTag?: string;
	promptName: string;
};
export async function allNotesPrompt<A extends ZodRawShape, B>({
	patient,
	getSystemPrompt,
	humanPrompt,
	backupResult,
	promptName,
	schema,
	trimToTag = '<findings>',
}: AllNotesPrompt<A, B>) {
	const notes = allInterviewItems(patient)?.join('\n') ?? '';

	const result = await generateCompletion({
		systemPrompt: getSystemPrompt(notes),
		humanPrompt,
		patientId: patient.id,
		promptName,
	});

	return schemaBasedCompletionParser(result, schema, backupResult, trimToTag);
}

type LimitedNotesAndArtifactsPrompt<A extends ZodRawShape, B> = {
	patient: PatientWithAssessmentContext;
	relevantInterviewQuestions?: ShortLabels[];
	getSystemPrompt: (notes: string, artifacts: string) => string;
	humanPrompt: string;
	artifactTags: PatientArtifactTag[];
	trimToTag?: string;
	promptName: string;
	schema: z.ZodObject<A>;
	backupResult: B;
	parseOptions?: ParserOptions;
};
export async function limitedNotesAndArtifactPrompt<A extends ZodRawShape, B>({
	patient,
	relevantInterviewQuestions,
	getSystemPrompt,
	humanPrompt,
	artifactTags,
	backupResult,
	promptName,
	schema,
	trimToTag = '<findings>',
	parseOptions,
}: LimitedNotesAndArtifactsPrompt<A, B>) {
	const notesList = relevantInterviewQuestions
		? getResponsesForRelevantInterviewQuestion(patient, relevantInterviewQuestions).map((q) =>
				formatQuestionItem(q, patient),
			)
		: allInterviewItems(patient) ?? [];
	const notes = notesList.join('\n') ?? '';

	const artifacts = patient.PatientArtifacts.filter((a) => artifactTags.includes(a.tagName));
	const docContent = artifacts
		.map((d) => {
			return { fileName: d.fileName, text: documentTextForRelevantPages(d) };
		})
		.filter((d) => d.text.length > 0);
	const docItems = docContent.map((doc) => `<${doc.fileName}>${doc.text}</${doc.fileName}>`);

	const result = await generateCompletion({
		systemPrompt: getSystemPrompt(notes, docItems.join('\n')),
		humanPrompt,
		patientId: patient.id,
		promptName,
	});

	return schemaBasedCompletionParser(result, schema, backupResult, trimToTag, parseOptions);
}

type LimitedNotesPrompt<A extends ZodRawShape, B> = {
	patient: PatientWithAssessmentContext;
	relevantInterviewQuestions: ShortLabels[];
	getSystemPrompt: (notes: string) => string;
	humanPrompt: string;
	promptName: string;
	schema: z.ZodObject<A>;
	backupResult: B;
	trimToTag?: string;
	parseOptions?: ParserOptions;
};
export async function limitedNotesPrompt<A extends ZodRawShape, B>({
	patient,
	relevantInterviewQuestions,
	getSystemPrompt,
	humanPrompt,
	backupResult,
	promptName,
	schema,
	trimToTag = '<findings>',
	parseOptions,
}: LimitedNotesPrompt<A, B>) {
	const notes =
		getResponsesForRelevantInterviewQuestion(patient, relevantInterviewQuestions)
			.map((q) => formatQuestionItem(q, patient))
			.join('\n') ?? '';

	const result = await generateCompletion({
		systemPrompt: getSystemPrompt(notes),
		humanPrompt,
		patientId: patient.id,
		promptName,
	});

	return schemaBasedCompletionParser(result, schema, backupResult, trimToTag, parseOptions);
}

export const documentTextForRelevantPages = (
	doc: PatientArtifactWithParagraphs,
	defaultPagesToInclude = [1, 2, 3, 4, 5],
	relevantPagesLookup = (doc: PatientArtifactWithParagraphs) => doc.patientDocumentArtifact?.relevantPages,
): string => {
	const { patientDocumentArtifact } = doc;
	if (!patientDocumentArtifact || !patientDocumentArtifact.paragraphs.length) return '';
	const { paragraphs, documentRawText } = patientDocumentArtifact;
	const relevantPages = relevantPagesLookup(doc) ?? [];
	if (!documentRawText) return '';
	const relevantPagesOrDefault = relevantPages.length ? relevantPages : defaultPagesToInclude;
	const orderedParagraphs = paragraphs
		.filter((p) => relevantPagesOrDefault.includes(p.page))
		.sort((a, b) => a.startIndex - b.startIndex);
	return orderedParagraphs.map((p) => documentRawText.slice(p.startIndex, p.endIndex)).join('\n');
};

export function allInterviewItems(patient: PatientWithAssessmentContext) {
	const interviewItems = patient.NurseInterview?.NurseInterviewThemeSummaries.flatMap((themeSummaries) => {
		return themeSummaries.QuestionItems.map((questionItem) => {
			return formatQuestionItem(questionItem, patient);
		});
	});
	return interviewItems;
}

export function formatQuestionItem(questionItem: NurseInterviewQuestionItem, patient: PatientWithAssessmentContext) {
	return `
		<${questionItem.question}>
			${interviewResponseLookup(questionItem, patient)}
		</${questionItem.question}>
	`;
}

export function getResponsesForRelevantInterviewQuestion(
	patient: PatientWithAssessmentContext,
	relevantInterviewQuestions: ShortLabels[],
) {
	if (!patient.NurseInterview) return [];
	const allQuestionItems = patient.NurseInterview?.NurseInterviewThemeSummaries.flatMap((s) => {
		return s.QuestionItems;
	});
	const lookedUpRelevantQuestions = relevantInterviewQuestions
		.map((shortLabel) => lookupQuestionByShortLabel(shortLabel))
		.filter((q) => q) as NurseInterviewQuestion[];
	const lookedUpResponses = lookedUpRelevantQuestions
		.map((rq) => allQuestionItems.find((qi) => qi.question === rq.question))
		.filter((lur) => lur) as NurseInterviewQuestionItem[];
	return lookedUpResponses;
}

export function validatedStringList(originalList: string[], suggestedList: string[]) {
	return originalList.filter((o) => suggestedList.find((s) => s.trim().toLowerCase() === o.trim().toLowerCase()));
}

export function validatedString(originalList: string[], suggested: string) {
	return originalList.find((o) => suggested.trim().toLowerCase() === o.trim().toLowerCase());
}

export function stringifyList(arr: readonly string[]) {
	if (!arr?.length) return '';
	return `["${arr.join('", "')}"]`;
}

export const validXML = `
	For your xml to be valid you will need to escape special characters if the text contains them. The special characters and their corresponding escape are:
	<special-characters>
		<special-character>
			<character>"</character>
			<escape>&quot;</escape>
		</special-character>
		<special-character>
			<character>'</character>
			<escape>&apos;</escape>
		</special-character>
		<special-character>
			<character><</character>
			<escape>&lt;</escape>
		</special-character>
		<special-character>
			<character>></character>
			<escape>&gt;</escape>
		</special-character>
		<special-character>
			<character>&</character>
			<escape>&amp;</escape>
		</special-character>
	</special-characters>
	example of bad: <text>Here is some text with a "special" character</text>
	example of good: <text>Here is some text with a &quot;special&quot; character</text>
`;
