import { PatientArtifactTag } from '@prisma/client';
import { customSuggestors } from '../../../../assessments/apricot/customSuggesters';
import { Configuration } from '../../../../assessments/configurations';
import { lookupQuestionByShortLabel } from '../../../../assessments/nurse-interview/questions';
import { AssessmentQuestion, AssessmentQuestionType, QuestionSource, SubGroup } from '../../../../assessments/types';
import {
	findTopLevelParentQuestionFromFollowup,
	getQuestionMetadata,
	getQuestionSubGroupForMultipleTypeQuestion,
} from '../../../../assessments/util/lookupQuestionUtil';
import { resolveIdAndMultipleIndex } from '../../../../common/utils/resolveIdAndMultipleIndex';
import { ensureSuggestionChoiceIsValid } from '../../routers/assessment/assessment.util';
import {
	NurseInterviewThemeSummaryWithQuestions,
	PatientWithAssessmentContext,
	PatientWithJoins,
} from '../../routers/patient/patient.types';
import { PatientArtifactWithParagraphs } from '../../routers/patientArtifact/patientArtifact.types';
import { parseCompletion } from './assessmentCompletionParser';
import { Models, generateCompletion, generateSecondPassCompletion } from './claude';
import { allInterviewItems, documentTextForRelevantPages, validXML } from './util';

const RETRY_TEMPERATURE = 0.25;

export type GenerateSuggestionParams = {
	assessmentQuestion: AssessmentQuestion;
	configuration: Configuration;
	patient: PatientWithAssessmentContext;
	retry?: boolean;
	model?: Models;
};

export const questionTypeSwitch = (assessmentQuestion: AssessmentQuestion) => {
	if (assessmentQuestion.suggestionGenerator) {
		return customSuggestors[assessmentQuestion.suggestionGenerator];
	}
	switch (assessmentQuestion.mappedType) {
		case AssessmentQuestionType.SelectAllThatApply:
			return generateAssessmentSelectAllThatApply;
		case AssessmentQuestionType.SelectOne:
			return generateAssessmentSelectOne;
		case AssessmentQuestionType.FreeForm:
			return generateAssessmentFreeForm;
		case AssessmentQuestionType.Date:
			return generateAssessmentDate;
		case AssessmentQuestionType.FreeFormNumber:
			return generateAssessmentNumber;
		case AssessmentQuestionType.LongText:
			return generateAssessmentLongText;
		default:
			throw new Error(`Unknown question type ${assessmentQuestion.questionType}`);
	}
};

const generateAssessmentSelectAllThatApply = async ({
	assessmentQuestion,
	configuration,
	patient,
}: GenerateSuggestionParams) => {
	const response = await sendPrompt({
		templatePrefix: 'Select the option(s) you think best matches the question',
		patient,
		assessmentQuestion,
		configuration,
		typeOfQuestion: "This is a 'select all that apply' question.",
		formatInstructions: `
		<choice>
			<value>[your choice here]</value>
			[...additional values]
		</choice>
		<explanation>
			[your explanation here]
		</explanation>
		`,
		options: assessmentQuestion.responses?.map((o) => o.text),
		allowArrayForChoice: true,
	});
	const verifiedResponses = {
		...response,
		choice: ensureSuggestionChoiceIsValid(response.choice, assessmentQuestion),
	};
	return verifiedResponses;
};

const generateAssessmentSelectOne = async ({
	assessmentQuestion,
	patient,
	configuration,
}: GenerateSuggestionParams) => {
	const response = await sendPrompt({
		templatePrefix: 'Select the option you think best matches the question',
		patient,
		assessmentQuestion,
		configuration,
		typeOfQuestion: "This is a 'select one' question.",
		formatInstructions: `
		<choice>
			[your choice here]
		</choice>
		<explanation>
			[your explanation here]
		</explanation>
		`,
		options: assessmentQuestion.responses?.map((o) => o.text),
	});
	const verifiedResponses = {
		...response,
		choice: ensureSuggestionChoiceIsValid(response.choice, assessmentQuestion),
	};
	return verifiedResponses;
};

const generateAssessmentFreeForm = async ({
	assessmentQuestion,
	patient,
	configuration,
	retry = false,
}: GenerateSuggestionParams) => {
	return sendPrompt({
		templatePrefix: "Answer the user's question as best you can",
		patient,
		assessmentQuestion,
		configuration,
		typeOfQuestion: "This is a 'free form' question.",
		formatInstructions: `
		<choice>
			[your choice here]
		</choice>
		<explanation>
			[your explanation here]
		</explanation>
		`,
		retry,
	});
};

const generateAssessmentNumber = async ({
	assessmentQuestion,
	patient,
	configuration,
	retry = false,
}: GenerateSuggestionParams) => {
	return sendPrompt({
		templatePrefix: "Answer the user's question as best you can",
		patient,
		assessmentQuestion,
		configuration,
		typeOfQuestion: "This is a 'number' question.",
		formatInstructions: `
		<choice>
			[valid number here, e.g 1.5, 40, 1000.5, etc.]
		</choice>
		<explanation>
			[your explanation here]
		</explanation>
		`,
		retry,
	});
};

const generateAssessmentDate = async ({
	assessmentQuestion,
	patient,
	configuration,
	retry = false,
}: GenerateSuggestionParams) => {
	return sendPrompt({
		templatePrefix: "Answer the user's question as best you can",
		patient,
		assessmentQuestion,
		configuration,
		typeOfQuestion: "This is a 'date' question.",
		formatInstructions: `
		<choice>
			[valid date here, e.g 2021-01-01, 2023-04-22, etc.]
		</choice>
		<explanation>
			[your explanation here]
		</explanation>
		`,
		retry,
	});
};

const generateAssessmentLongText = async ({
	assessmentQuestion,
	patient,
	configuration,
	retry = false,
}: GenerateSuggestionParams) => {
	return sendPrompt({
		templatePrefix: "Answer the user's question as best you can",
		patient,
		assessmentQuestion,
		configuration,
		typeOfQuestion: "This is a 'note' question.",
		formatInstructions: `
		<choice>
			[your note here]
		</choice>
		`,
		retry,
	});
};

type SendPromptInput = {
	templatePrefix: string;
	patient: PatientWithAssessmentContext;
	assessmentQuestion: AssessmentQuestion;
	configuration: Configuration;
	typeOfQuestion: string;
	formatInstructions: string;
	options?: string[];
	retry?: boolean;
	allowArrayForChoice?: boolean;
};
const sendPrompt = async ({
	templatePrefix,
	patient,
	assessmentQuestion,
	configuration,
	typeOfQuestion,
	formatInstructions,
	options,
	retry = false,
	allowArrayForChoice = false,
}: SendPromptInput) => {
	const { query, updatedTypeOfQuestion } = getQueryAndTypeOfQuestion(assessmentQuestion, typeOfQuestion);

	const documents = formatDocumentsAndInterviewNotes(patient, assessmentQuestion, configuration).join('\n');
	const { hints, examples } = assessmentQuestion;

	const systemPrompt = `${templatePrefix} and explain your reasoning in the explanation tag using the provided documents. Best guesses are okay. If you are totally unsure because the documents have no details on the question at all, respond with null as your choice and explain your reasoning in the explanation tag.
			<documents>
				${documents}
			</documents
			You ALWAYS follow these guidelines when writing your response:
			<guidelines>
				- You don't have access to functions. Therefore, don't refer to them.
				<instructions>
					<questionType>
						${updatedTypeOfQuestion}
					</questionType>
					${options ? `<options>${options.map((o) => `<option>${o}</option>`).join('\n')}</options>` : ''}
				</instructions>
				${hints ? `<hints>${hints}</hints>` : ''}
				${examples ? `<examples>${examples}</examples>` : ''}
				<output-format>
					ONLY RESPOND with valid xml following this format:
					<response>
						${formatInstructions}
					</response>
					${validXML}
					DO NOT PUT ANY OTHER TEXT BEFORE OR AFTER THE RESPONSE TAG
				</output-format>
			</guidelines>

		`;
	const humanPrompt = query;

	const result = await generateCompletion({
		systemPrompt,
		humanPrompt,
		patientId: patient.id,
		promptName: assessmentQuestion.id,
		...(retry ? { temperature: RETRY_TEMPERATURE } : {}),
	});
	try {
		return await parseCompletion(result, { allowArrayForChoice });
	} catch (error) {
		const secondPassResult = await generateSecondPassCompletion({
			result,
			error,
			patientId: patient.id,
			promptName: assessmentQuestion.id,
			...(retry ? { temperature: RETRY_TEMPERATURE } : {}),
		});
		return await parseCompletion(secondPassResult, { allowArrayForChoice });
	}
};

const getQueryAndTypeOfQuestion = (assessmentQuestion: AssessmentQuestion, typeOfQuestion: string) => {
	const queryBase = assessmentQuestion.alternateQuestionText?.length
		? assessmentQuestion.alternateQuestionText
		: assessmentQuestion.text;

	if (assessmentQuestion.template) {
		return {
			query: queryBase,
			updatedTypeOfQuestion: `This is a template question. ${assessmentQuestion.codingInstructions} Here is the template: ${assessmentQuestion.template}`,
		};
	}

	return {
		query: assessmentQuestion.codingInstructions
			? `${queryBase}\n${assessmentQuestion.codingInstructions}`
			: queryBase,
		updatedTypeOfQuestion: typeOfQuestion,
	};
};

const formatDocumentsAndInterviewNotes = (
	patient: PatientWithAssessmentContext,
	assessmentQuestion: AssessmentQuestion,
	configuration: Configuration,
) => {
	if (!patient.NurseInterview) {
		throw new Error(`Patient ${patient.id} does not have a nurse interview`);
	}
	const { updatedThemeSummaries, updatedPatientArtifacts } = limitContext(patient, assessmentQuestion, configuration);
	const limitedPatientContext = {
		...patient,
		PatientArtifacts: updatedPatientArtifacts,
		NurseInterview: { ...patient.NurseInterview, NurseInterviewThemeSummaries: updatedThemeSummaries },
	};
	const relevantReferralDocs = limitedPatientContext.PatientArtifacts.filter((a) => {
		return a.tagName === PatientArtifactTag.ReferralDocument || a.tagName === PatientArtifactTag.Medication;
	});
	const docContent = relevantReferralDocs.map((d) => documentTextForRelevantPages(d)).filter((d) => d.length > 0);
	const docItems = docContent.map((d, i) => `<referral-document-${i + 1}>${d}</referral-document-${i + 1}>`);
	const interviewItems = allInterviewItems(limitedPatientContext) ?? [];
	return [...interviewItems, ...docItems];
};

type LimitContextReturn = {
	updatedPatientArtifacts: PatientArtifactWithParagraphs[];
	updatedThemeSummaries: NurseInterviewThemeSummaryWithQuestions[];
};

function removeMultipleIndex(assessmentQuestion: AssessmentQuestion) {
	const { resolvedQuestionId } = resolveIdAndMultipleIndex(assessmentQuestion.id);
	return { ...assessmentQuestion, id: resolvedQuestionId };
}

const limitContext = (
	patient: PatientWithAssessmentContext,
	assessmentQuestion: AssessmentQuestion,
	configuration: Configuration,
): LimitContextReturn => {
	const { resolvedQuestionId, index } = resolveIdAndMultipleIndex(assessmentQuestion.id);
	const topLevelQuestion = findTopLevelParentQuestionFromFollowup(resolvedQuestionId, configuration);
	const multipleTypeSubGroup = getQuestionSubGroupForMultipleTypeQuestion(
		removeMultipleIndex(topLevelQuestion),
		configuration,
	);

	const metadata = getQuestionMetadata(assessmentQuestion, configuration, patient as PatientWithJoins);
	const { updatedPatientArtifacts, updatedThemeSummaries } =
		multipleTypeSubGroup && index
			? limitMultipleTypeContext(multipleTypeSubGroup, index, patient, metadata)
			: limitGenericContext(patient, metadata);

	return {
		updatedPatientArtifacts,
		updatedThemeSummaries,
	};
};

const limitMultipleTypeContext = (
	subGroup: SubGroup,
	numberIndex: number,
	patient: PatientWithAssessmentContext,
	metadata: QuestionSource,
): LimitContextReturn => {
	if (!subGroup.multiple) {
		throw new Error('Subgroup does not have a multiple type');
	}
	const relevantTheme = patient.NurseInterview?.NurseInterviewThemeSummaries.find(
		(item) => item.theme === subGroup.multiple!.theme.toString(),
	);
	if (!relevantTheme) {
		return {
			updatedPatientArtifacts: [],
			updatedThemeSummaries: [],
		};
	}
	const numberSpecificQuestions = relevantTheme?.QuestionItems.filter((item) =>
		item.question.endsWith(`#${numberIndex}`),
	);
	const updatedThemeSummary = { ...relevantTheme, QuestionItems: numberSpecificQuestions };
	const updatedThemeSummaries =
		mapThemeSummaries(patient, metadata)?.filter((summary) => summary.theme !== relevantTheme.theme) ?? [];
	const updatedWithMultiple = [...updatedThemeSummaries, updatedThemeSummary];

	const updatedPatientArtifacts = limitArtifactContext(patient, metadata);

	return {
		updatedPatientArtifacts,
		updatedThemeSummaries: updatedWithMultiple,
	};
};

function mapThemeSummaries(patient: PatientWithAssessmentContext, metadata: QuestionSource) {
	return patient.NurseInterview?.NurseInterviewThemeSummaries?.map((item) => {
		if (!metadata.interviewContext?.length) {
			return item;
		}
		const questions = metadata.interviewContext.map((question) => lookupQuestionByShortLabel(question)?.question);
		const newItems = item.QuestionItems.filter((qi) => questions.includes(qi.question));
		return { ...item, QuestionItems: newItems };
	});
}

function limitArtifactContext(
	patient: PatientWithAssessmentContext,
	metadata: QuestionSource,
): PatientArtifactWithParagraphs[] {
	return patient.PatientArtifacts.filter((artifact) => {
		if (!metadata.artifactContext?.length) {
			return false;
		}
		return metadata.artifactContext.includes(artifact.tagName);
	});
}

const limitGenericContext = (patient: PatientWithAssessmentContext, metadata: QuestionSource): LimitContextReturn => {
	const updatedThemeSummaries = mapThemeSummaries(patient, metadata);
	const updatedPatientArtifacts = limitArtifactContext(patient, metadata);

	return {
		updatedThemeSummaries: updatedThemeSummaries as NurseInterviewThemeSummaryWithQuestions[],
		updatedPatientArtifacts,
	};
};
