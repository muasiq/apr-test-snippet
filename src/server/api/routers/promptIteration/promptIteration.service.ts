import { AssessmentAnswer, PatientStatus } from '@prisma/client';
import { AssessmentQuestion } from '../../../../assessments/types';
import { lookupQuestionOrNull } from '../../../../assessments/util/lookupQuestionUtil';
import { GeneratedResponse } from '../../../../common/types/AssessmentSuggestionAndChoice';
import { questionTypeSwitch } from '../../common/anthropic/generateSuggestion';
import { PermissionedTRPCContext } from '../../trpc';
import * as assessmentService from '../assessment/assessment.service';
import { ensureSuggestionChoiceIsValid } from '../assessment/assessment.util';
import { configurationService } from '../configuration/configuration.service';
import { patientRepo } from '../patient/patient.repo';
import * as patientService from '../patient/patient.service';
import * as promptIterationInputs from './promptIteration.inputs';
import { PromptIterationTestMode } from './promptIteration.inputs';

export const runBackTestForSuggestions = async (
	input: promptIterationInputs.RunBackTestForSuggestionsInput,
	ctx: PermissionedTRPCContext,
) => {
	const { assessmentNumber, sampleSize, templateOverrides } = input;
	const patientIds = await getPromptIterationPatientIds(input.testMode, sampleSize, input.patientTestIds, ctx);

	const existingAssessmentAnswers = await assessmentService.getAssessmentQuestionForPatients(
		{ assessmentNumber, patientIds: patientIds },
		ctx,
	);
	const configuration = await configurationService.getCurrentConfigurationForOrg(ctx);
	const suggestionResultPromises = patientIds.map(async (patientId) => {
		const lookedUpQuestion = lookupQuestionOrNull(assessmentNumber, configuration);
		if (!lookedUpQuestion) return null;
		const modifiedQuestion = { ...lookedUpQuestion, ...templateOverrides };
		return getSuggestionAndExistingAnswerForPatientId(patientId, modifiedQuestion, existingAssessmentAnswers, ctx);
	});
	const suggestionResults = await Promise.all(suggestionResultPromises);
	return suggestionResults;
};

const getSuggestionAndExistingAnswerForPatientId = async (
	patientId: number,
	question: AssessmentQuestion,
	existingAssessmentAnswers: AssessmentAnswer[],
	ctx: PermissionedTRPCContext,
) => {
	const patient = await patientService.getPatientById(patientId, ctx, {
		InterviewQuestion: true,
		NurseInterview: { include: { NurseInterviewThemeSummaries: { include: { QuestionItems: true } } } },
		PatientArtifacts: {
			include: {
				patientDocumentArtifact: {
					include: { paragraphs: true },
				},
			},
		},
	});
	const suggestionFunctionToCall = questionTypeSwitch(question);
	const configuration = await configurationService.getConfigurationForPatient(ctx, { patientId });
	const suggestion = (await suggestionFunctionToCall({
		assessmentQuestion: question,
		configuration,
		patient,
	})) as GeneratedResponse['generatedResponse'];

	const validChoice = ensureSuggestionChoiceIsValid(suggestion.choice, question);

	const existingAnswer = existingAssessmentAnswers.find((answer) => answer.patientId === patientId);
	return {
		suggestion: {
			...suggestion,
			choice: validChoice,
		},
		existingAnswer,
	};
};

const getPromptIterationPatientIds = async (
	testMode: PromptIterationTestMode,
	sampleSize: number,
	patientIds: number[],
	ctx: PermissionedTRPCContext,
) => {
	switch (testMode) {
		case PromptIterationTestMode.PATIENT_SELECT:
			return patientIds ?? [];
		case PromptIterationTestMode.NUMBER_SELECT:
			const latestSampleOfPatients = await patientRepo.findMany(ctx, {
				orderBy: { createdAt: 'desc' },
				where: { status: PatientStatus.Complete },
				take: sampleSize,
			});
			return latestSampleOfPatients.map((patient) => patient.id);
		default:
			return [];
	}
};
