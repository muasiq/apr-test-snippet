import { expect, it } from '@jest/globals';
import { ConfigurationType, PatientStatus } from '@prisma/client';
import { woundInterviewContext } from '../../../../assessments/apricot/util';
import { Configuration, getLocalConfiguration } from '../../../../assessments/configurations';
import { ShortLabels, lookupQuestionByShortLabel } from '../../../../assessments/nurse-interview/questions';
import { lookupQuestion } from '../../../../assessments/util/lookupQuestionUtil';
import { prisma } from '../../../prisma';
import { PatientWithAssessmentContext } from '../../routers/patient/patient.types';
import { questionTypeSwitch } from './generateSuggestion';

let patientToUse: PatientWithAssessmentContext;
let configuration: Configuration;

beforeAll(async () => {
	const patient = await prisma.patient.findFirstOrThrow({
		where: {
			status: PatientStatus.WithQA,
			configurationType: ConfigurationType.HomeCareHomeBase,
			PatientArtifacts: { some: { tagName: 'Wounds' } },
			Organization: { name: 'Accentra' },
		},
		include: {
			NurseInterview: { include: { NurseInterviewThemeSummaries: { include: { QuestionItems: true } } } },
			InterviewQuestion: true,
			PatientArtifacts: { include: { patientDocumentArtifact: { include: { paragraphs: true } } } },
			Organization: true,
		},
	});
	configuration = getLocalConfiguration(patient.Organization.name);
	patientToUse = patient;
});

describe('generateSuggestion', () => {
	it('create correct prompt and context for question', async () => {
		const questionLookup = configuration.allQuestions.find((q) => q.id === 'A1005');
		if (!questionLookup) throw new Error('Question not found');
		const assessmentQuestion = lookupQuestion(questionLookup.id, configuration);

		const suggestionFunctionToCall = questionTypeSwitch(assessmentQuestion);
		await prisma.promptAuditLog.deleteMany({});
		await suggestionFunctionToCall({
			assessmentQuestion,
			patient: patientToUse,
			configuration,
			retry: false,
		});
		const auditLog = await prisma.promptAuditLog.findFirst({
			where: {
				patientId: patientToUse.id,
				promptName: questionLookup.id,
			},
		});
		expect(auditLog).toBeDefined();
		if (!auditLog) return;
		expect(auditLog.prompt).toEqual(expect.stringContaining('<Share details about your recent patient visit.>'));
		expect(auditLog.prompt).toEqual(expect.stringContaining("<Describe the patient's skin.>"));
		expect(auditLog.prompt).toEqual(expect.stringContaining('<documents>'));
		expect(auditLog.prompt).toEqual(expect.stringContaining('<referral-document-1>This is a test document'));
	});
	it('create correct prompt and limited context for question', async () => {
		const questionLookup = configuration.allQuestions.find((q) => q.id === 'MQ6BB554AY');
		if (!questionLookup) throw new Error('Question not found');
		const assessmentQuestion = lookupQuestion(questionLookup.id, configuration);
		const withMultiple = { ...assessmentQuestion, id: `${assessmentQuestion.id}-#1` };

		const suggestionFunctionToCall = questionTypeSwitch(withMultiple);
		await prisma.promptAuditLog.deleteMany({});
		await suggestionFunctionToCall({
			assessmentQuestion: withMultiple,
			patient: patientToUse,
			configuration,
			retry: false,
		});
		const auditLog = await prisma.promptAuditLog.findFirst({
			where: {
				patientId: patientToUse.id,
			},
		});

		expect(auditLog).toBeDefined();
		if (!auditLog) return;
		const relevantShortLabels = woundInterviewContext;
		const irrelevantShortLabels = Object.values(ShortLabels)
			.filter((label) => !relevantShortLabels.includes(label))
			.filter((label) => label !== ShortLabels.Wounds);
		expect(auditLog.prompt).toEqual(expect.stringContaining('<Describe wound #1>'));
		for (const shortLabel of relevantShortLabels) {
			const question = lookupQuestionByShortLabel(shortLabel);
			if (!question) throw new Error('Question not found');
			expect(auditLog.prompt).toEqual(expect.stringContaining(`<${question.question}>`));
		}
		for (const shortLabel of irrelevantShortLabels) {
			const question = lookupQuestionByShortLabel(shortLabel);
			if (!question) throw new Error('Question not found');
			expect(auditLog.prompt).toEqual(expect.not.stringContaining(`<${question.question}>`));
		}
		expect(auditLog.prompt).toEqual(expect.not.stringContaining('<Describe wound #2>'));
	});
	it('create correct prompt and limited context for question multiple levels deep', async () => {
		await prisma.promptAuditLog.deleteMany({});
		const questionLookup = configuration.allQuestions.find((q) => q.id === 'W1002');
		if (!questionLookup) throw new Error('Question not found');
		const assessmentQuestion = lookupQuestion(questionLookup.id, configuration);
		const withMultiple = { ...assessmentQuestion, id: `${assessmentQuestion.id}-#1` };

		const suggestionFunctionToCall = questionTypeSwitch(withMultiple);
		await suggestionFunctionToCall({
			assessmentQuestion: withMultiple,
			patient: patientToUse,
			configuration,
			retry: false,
		});
		const auditLog = await prisma.promptAuditLog.findFirst({
			where: {
				patientId: patientToUse.id,
			},
		});

		expect(auditLog).toBeDefined();
		if (!auditLog) return;
		const relevantShortLabels = woundInterviewContext;
		const irrelevantShortLabels = Object.values(ShortLabels)
			.filter((label) => !relevantShortLabels.includes(label))
			.filter((label) => label !== ShortLabels.Wounds);
		expect(auditLog.prompt).toEqual(expect.stringContaining('<Describe wound #1>'));
		for (const shortLabel of relevantShortLabels) {
			const question = lookupQuestionByShortLabel(shortLabel);
			if (!question) throw new Error('Question not found');
			expect(auditLog.prompt).toEqual(expect.stringContaining(`<${question.question}>`));
		}
		for (const shortLabel of irrelevantShortLabels) {
			const question = lookupQuestionByShortLabel(shortLabel);
			if (!question) throw new Error('Question not found');
			expect(auditLog.prompt).toEqual(expect.not.stringContaining(`<${question.question}>`));
		}
		expect(auditLog.prompt).toEqual(expect.not.stringContaining('<Describe wound #2>'));
	});
});
