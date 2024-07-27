import { AssessmentAnswer, AssessmentAnswerSuggestionStatus, PatientAuditLogAction, Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { subHours } from 'date-fns';
import { chunk, difference, isEqual } from 'lodash';
import { CustomAssessmentNumber } from '~/assessments/apricot/custom';
import { allRelevantQuestionIdsForPatient } from '~/assessments/util/assessmentStateUtils';
import { getListedMedicationIds } from '~/common/constants/medication';
import { unicornButton } from '~/common/testUtils/generateFakeAnswers';
import logger from '~/common/utils/logger';
import { env } from '~/env.mjs';
import { QuestionSource } from '../../../../assessments/types';
import {
	extractTopLevelQuestionsThatShouldHaveSuggestionsGenerated,
	lookupQuestion,
} from '../../../../assessments/util/lookupQuestionUtil';
import { questionTypeSwitch } from '../../common/anthropic/generateSuggestion';
import * as fdb from '../../common/fdb';
import { type PermissionedTRPCContext } from '../../trpc';
import * as auditLogService from '../auditLog/auditLog.service';
import { configurationService } from '../configuration/configuration.service';
import * as patientService from '../patient/patient.service';
import { PatientWithAssessmentContext, PatientWithJoins, PatientWithJoinsInclude } from '../patient/patient.types';
import {
	AssessmentMedicationSchema,
	CheckedResponseUnion,
	GenerateAllAssessmentSuggestionsForPatientInput,
	GenerateAssessmentAnswerInput,
	GetAllAssessmentQuestionsForPatientInput,
	GetAssessmentQuestionForPatientInput,
	GetAssessmentQuestionForPatientsInput,
	UnicornButtonInput,
	VerifyMedicationInteractionsAssessmentInput,
	type AssessmentCheckInput,
} from './assessment.inputs';
import { assessmentRepo } from './assessment.repo';

const BATCH_SIZE = 10;
const HOURS_BEFORE_RETRY = 4;

export async function assessmentCheck(input: AssessmentCheckInput, ctx: PermissionedTRPCContext) {
	const checkedById = ctx.session.user.id;
	const { patientId, assessmentNumber, skipGeneratedGuess } = input;

	const checkedResponse = await preprocessAssessmentResponse(
		{ patientId, assessmentNumber, checkedResponse: input.checkedResponse },
		ctx,
	);

	let generatedResponseAccepted = false;
	if (!skipGeneratedGuess) {
		generatedResponseAccepted = await isGeneratedGuessAccepted(
			{ patientId, assessmentNumber, checkedResponse },
			ctx,
		);
	}

	void auditLogService.createAuditLog(
		{ patientId, payload: input, action: PatientAuditLogAction.UPDATE_PATIENT },
		ctx,
	);

	try {
		const result = await assessmentRepo.upsert(ctx, {
			where: {
				patientId_assessmentNumber: {
					patientId,
					assessmentNumber,
				},
			},
			create: {
				patientId,
				assessmentNumber,
				generatedResponseAccepted,
				checkedResponse,
				checkedById,
			},
			update: {
				generatedResponseAccepted,
				checkedResponse,
				checkedById,
				deleted: false,
			},
		});
		return result;
	} catch (e) {
		logger.error(`Error checking assessment answer for patient ${patientId} and question ${assessmentNumber}`, e);
	}
}

export async function verifyMedicationInteractionsAssessment(
	input: VerifyMedicationInteractionsAssessmentInput,
	ctx: PermissionedTRPCContext,
) {
	const { patientId } = input;
	const assessmentNumber = CustomAssessmentNumber.MEDICATIONS;

	const existingAnswer = await assessmentRepo.findFirst(ctx, {
		where: { patientId, assessmentNumber },
	});

	if (!existingAnswer) {
		throw new TRPCError({ code: 'NOT_FOUND', message: `Medications assessment answer not found` });
	}

	const checkedResponse = existingAnswer.checkedResponse as AssessmentMedicationSchema;
	if (!checkedResponse?.interactions) {
		throw new TRPCError({ code: 'BAD_REQUEST', message: `No interactions for medications` });
	}

	checkedResponse.interactions = {
		...checkedResponse.interactions,
		verified: true,
		verifiedAt: new Date(),
		verifiedBy: ctx.session.user.name,
	};

	const result = await assessmentRepo.update(ctx, {
		where: { patientId_assessmentNumber: { patientId, assessmentNumber } },
		data: { checkedResponse },
	});

	return result;
}

async function isGeneratedGuessAccepted(
	{
		patientId,
		assessmentNumber,
		checkedResponse,
	}: { patientId: number; assessmentNumber: string; checkedResponse: CheckedResponseUnion },
	ctx: PermissionedTRPCContext,
) {
	const existingAnswer = await assessmentRepo.findFirst(ctx, {
		where: {
			patientId: patientId,
			assessmentNumber: assessmentNumber,
		},
	});

	if (existingAnswer) {
		return isEqual((existingAnswer.generatedResponse as CheckedResponseUnion)?.choice, checkedResponse?.choice);
	}

	return false;
}

async function preprocessAssessmentResponse(
	{
		patientId,
		assessmentNumber,
		checkedResponse,
	}: { patientId: number; assessmentNumber: string; checkedResponse: CheckedResponseUnion },
	ctx: PermissionedTRPCContext,
): Promise<CheckedResponseUnion> {
	try {
		// generate interactions when the medication list changes
		if (assessmentNumber === CustomAssessmentNumber.MEDICATIONS.toString()) {
			const response = checkedResponse as AssessmentMedicationSchema;
			const medications = response.choice.medications;
			const medicationIds = getListedMedicationIds(medications);

			const existingAnswer = (
				await assessmentRepo.findFirst(ctx, {
					where: { patientId, assessmentNumber },
				})
			)?.checkedResponse as AssessmentMedicationSchema | null;
			const hasInteractions = !!existingAnswer?.interactions;
			const previousMedications = existingAnswer?.choice?.medications ?? [];
			const prevIds = getListedMedicationIds(previousMedications);

			if (isEqual(prevIds, medicationIds) && hasInteractions) {
				// don't allow modification of interactions
				return { ...existingAnswer, choice: checkedResponse.choice } as AssessmentMedicationSchema;
			}

			const interactions = await fdb.getInteractions(medicationIds);
			return {
				...checkedResponse,
				interactions: { data: interactions, verified: false },
			};
		}

		return checkedResponse;
	} catch (error) {
		logger.error(`Error preprocessing assessment answer`, {
			assessmentNumber,
			patientId,
			error,
		});

		return checkedResponse;
	}
}

export async function unicornButtonMutation(input: UnicornButtonInput, ctx: PermissionedTRPCContext) {
	if (env.APRICOT_ENV === 'production') {
		throw new TRPCError({ code: 'FORBIDDEN', message: 'Unicorn button is disabled in production' });
	}
	return unicornButton(ctx.session.user.id, input.patientId);
}

export const getAllAssessmentQuestionsForPatient = (
	input: GetAllAssessmentQuestionsForPatientInput,
	ctx: PermissionedTRPCContext,
) => {
	const { patientId, assessmentNumbers } = input;
	return assessmentRepo.findMany(ctx, {
		where: {
			patientId,
			...(assessmentNumbers ? { assessmentNumber: { in: input.assessmentNumbers } } : {}),
		},
	});
};

export const getAssessmentQuestionForPatients = (
	input: GetAssessmentQuestionForPatientsInput,
	ctx: PermissionedTRPCContext,
) => {
	const { patientIds, assessmentNumber } = input;
	return assessmentRepo.findMany(ctx, {
		where: {
			patientId: {
				in: patientIds,
			},
			assessmentNumber,
		},
	});
};

export const getAssessmentQuestionForPatient = (
	input: GetAssessmentQuestionForPatientInput,
	ctx: PermissionedTRPCContext,
) => {
	const { patientId, assessmentNumber } = input;
	return assessmentRepo.findFirst(ctx, {
		where: {
			patientId,
			assessmentNumber,
		},
	});
};

export const generateAllAssessmentSuggestionsForPatient = async (
	input: GenerateAllAssessmentSuggestionsForPatientInput,
	ctx: PermissionedTRPCContext,
) => {
	const { patientId } = input;
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

	const configuration = await configurationService.getConfigurationForPatient(ctx, { patientId });

	const allQuestions = extractTopLevelQuestionsThatShouldHaveSuggestionsGenerated(
		configuration,
		patient as PatientWithJoins,
	);
	await markAllAssessmentQuestionsAsQueued(allQuestions, patientId, ctx);
	const questionBatches = chunk(allQuestions, BATCH_SIZE);
	for (const batch of questionBatches) {
		await runGenerateBatch(batch, patientId, ctx, patient);
	}
};

export const generateAssessmentAnswer = async (
	input: GenerateAssessmentAnswerInput,
	ctx: PermissionedTRPCContext,
	cachedPatient?: PatientWithAssessmentContext,
): Promise<AssessmentAnswer> => {
	const { patientId: id, assessmentNumber, retry } = input;
	const existingAssessmentAnswer = await assessmentRepo.findFirst(ctx, {
		where: {
			patientId: id,
			assessmentNumber: assessmentNumber,
		},
	});
	if (!shouldGenerateAnswer(existingAssessmentAnswer, retry)) {
		return existingAssessmentAnswer!;
	} else {
		await assessmentRepo.upsert(ctx, {
			where: {
				patientId_assessmentNumber: {
					patientId: id,
					assessmentNumber,
				},
			},
			create: {
				patientId: id,
				assessmentNumber,
				deleted: false,
			},
			update: {
				patientId: id,
				assessmentNumber,
				status: AssessmentAnswerSuggestionStatus.InProgress,
				deleted: false,
			},
		});
	}
	const patient =
		cachedPatient ??
		(await patientService.getPatientById(id, ctx, {
			InterviewQuestion: true,
			NurseInterview: { include: { NurseInterviewThemeSummaries: { include: { QuestionItems: true } } } },
			PatientArtifacts: {
				include: {
					patientDocumentArtifact: {
						include: { paragraphs: true },
					},
				},
			},
		}));

	try {
		const configuration = await configurationService.getConfigurationForPatient(ctx, { patientId: id });
		const assessmentQuestion = lookupQuestion(assessmentNumber, configuration);

		const suggestionFunctionToCall = questionTypeSwitch(assessmentQuestion);
		const record = await suggestionFunctionToCall({
			assessmentQuestion,
			patient: patient,
			configuration,
			retry,
		});
		const assessmentAnswer = await insertSuggestion(id, assessmentNumber, record, ctx);

		return assessmentAnswer;
	} catch (e) {
		logger.error(`Error generating assessment answer for patient ${id} and question ${assessmentNumber}`, e);
		await markAsErrored(id, assessmentNumber, ctx);
		throw e;
	}
};

export async function QACheckAllAssessmentAnswers(ctx: PermissionedTRPCContext, patientId: number) {
	const patient = await patientService.getPatientById(patientId, ctx, PatientWithJoinsInclude);
	const allAssessmentAnswers = await getAllAssessmentQuestionsForPatient({ patientId }, ctx);
	const allAssessmentAnswerIds = allAssessmentAnswers.map((a) => a.assessmentNumber);
	const configuration = await configurationService.getConfigurationForPatient(ctx, { patientId });
	const allRelevantQuestionIds = allRelevantQuestionIdsForPatient({
		configuration,
		patient,
		answers: allAssessmentAnswers,
	});
	const toDelete = difference(allAssessmentAnswerIds, allRelevantQuestionIds);
	await deleteAssessmentAnswersByNumber(patientId, toDelete, ctx);
}

const insertSuggestion = async (
	patientId: number,
	assessmentNumber: string,
	answer: object,
	ctx: PermissionedTRPCContext,
) => {
	const assessmentAnswer = await assessmentRepo.upsert(ctx, {
		where: {
			patientId_assessmentNumber: {
				patientId,
				assessmentNumber,
			},
		},
		create: {
			patientId,
			assessmentNumber,
			generatedResponse: answer,
			status: AssessmentAnswerSuggestionStatus.Completed,
		},
		update: {
			generatedResponse: answer,
			status: AssessmentAnswerSuggestionStatus.Completed,
		},
	});
	return assessmentAnswer;
};

const markAsErrored = async (patientId: number, assessmentNumber: string, ctx: PermissionedTRPCContext) => {
	const assessmentAnswer = await assessmentRepo.update(ctx, {
		where: {
			patientId_assessmentNumber: {
				patientId,
				assessmentNumber,
			},
		},
		data: {
			status: AssessmentAnswerSuggestionStatus.Failed,
		},
	});
	return assessmentAnswer;
};

const deleteAssessmentAnswersByNumber = async (
	patientId: number,
	assessmentNumbers: string[],
	ctx: PermissionedTRPCContext,
) => {
	return assessmentRepo.updateMany(ctx, {
		where: {
			patientId,
			assessmentNumber: { in: assessmentNumbers },
		},
		data: {
			deleted: true,
			checkedResponse: Prisma.DbNull,
			generatedResponse: Prisma.DbNull,
			generatedResponseAccepted: null,
		},
	});
};

const shouldGenerateAnswer = (existingAssessmentAnswer?: AssessmentAnswer | null, retry = false): boolean => {
	if (!existingAssessmentAnswer) {
		return true;
	}
	if (existingAssessmentAnswer.status === AssessmentAnswerSuggestionStatus.Failed) {
		return true;
	}
	if (existingAssessmentAnswer.status === AssessmentAnswerSuggestionStatus.Completed) {
		return retry;
	}
	if (existingAssessmentAnswer.status === AssessmentAnswerSuggestionStatus.InProgress) {
		if (existingAssessmentAnswer?.updatedAt < subHours(new Date(), HOURS_BEFORE_RETRY)) {
			return true;
		}
		return false;
	}
	return true;
};

const markAllAssessmentQuestionsAsQueued = async (
	questions: QuestionSource[],
	patientId: number,
	ctx: PermissionedTRPCContext,
) => {
	for (const question of questions) {
		await assessmentRepo.upsert(ctx, {
			where: {
				patientId_assessmentNumber: {
					patientId,
					assessmentNumber: question.id!,
				},
			},
			create: {
				patientId,
				assessmentNumber: question.id!,
				status: AssessmentAnswerSuggestionStatus.Queued,
			},
			update: {},
		});
	}
};

async function runGenerateBatch(
	batch: QuestionSource[],
	patientId: number,
	ctx: PermissionedTRPCContext,
	patient: PatientWithAssessmentContext,
) {
	const batchResultsPromise = batch.map(async (question) => {
		try {
			const answer = await generateAssessmentAnswer({ patientId, assessmentNumber: question.id! }, ctx, patient);
			return answer;
		} catch (e) {
			logger.error(`Error generating assessment answer for patient ${patientId} and question ${question.id}`, e);
			await markAsErrored(patientId, question.id!, ctx);
			return Promise.resolve();
		}
	});
	return await Promise.all(batchResultsPromise);
}
