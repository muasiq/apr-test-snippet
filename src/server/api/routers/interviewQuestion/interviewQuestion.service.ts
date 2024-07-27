import {
	AudioTranscriptionStatus,
	NurseInterviewQuestionItem,
	PatientAuditLogAction,
	PatientStatus,
} from '@prisma/client';
import { TRPCError } from '@trpc/server';
import logger from '~/common/utils/logger';
import { allQuestionsForTheme, physicalAssessmentThemes } from '../../../../assessments/nurse-interview/questions';
import { DataAccessPermissions } from '../../../../common/utils/permissions';
import { Prisma } from '../../../prisma';
import { summarizeText } from '../../common/anthropic/summarizeText';
import { cloudSpeech } from '../../common/gcp/cloudSpeech';
import { cloudStorage } from '../../common/gcp/cloudStorage';
import { PermissionedTRPCContext, ProtectedTRPCContext } from '../../trpc';
import * as assessmentService from '../assessment/assessment.service';
import { createAuditLog } from '../auditLog/auditLog.service';
import { patientRepo } from '../patient/patient.repo';
import * as patientService from '../patient/patient.service';
import * as interviewInputs from './interviewQuestion.inputs';
import { interviewQuestionRepo } from './interviewQuestion.repo';
import { nurseInterviewRepo } from './nurseInterview.repo';
import { nurseInterviewQuestionItemRepo } from './nurseInterviewQuestionItem.repo';
import { nurseInterviewThemeSummariesRepo } from './nurseInterviewThemeSummaries.repo';

const MAX_AUDIO_TRANSCRIPTION_ATTEMPTS = 3;

export const saveInterviewQuestion = async (
	input: interviewInputs.SaveInterviewQuestionInput,
	ctx: PermissionedTRPCContext,
) => {
	const { hasAudioResponse, interviewQuestionShortLabel, patientId, interviewQuestionTheme, ...rest } = input;
	const patient = await patientService.getPatientById(patientId, ctx, { Organization: true });

	const cloudStorageAudioFileLocation = hasAudioResponse
		? `interview-audio/${patient.Organization.name}/${patientId}/${interviewQuestionShortLabel}`
		: null;
	const audioTranscriptionStatus = hasAudioResponse ? AudioTranscriptionStatus.NotStarted : null;

	const questionRecord = await upsertInterviewQuestion(
		{
			...rest,
			interviewQuestionTheme,
			interviewQuestionShortLabel,
			patientId,
			audioTranscriptionStatus,
			cloudStorageAudioFileLocation,
		},
		ctx,
	);

	if (patient.status === PatientStatus.NewPatient) {
		await patientService.updatePatientStatus({ status: PatientStatus.Incomplete, patientId }, ctx);
	}

	void createAuditLog(
		{
			patientId,
			payload: input,
			action: PatientAuditLogAction.UPDATE_PATIENT,
		},
		ctx,
	);

	if (questionRecord.cloudStorageAudioFileLocation) {
		const { signedUrl } = await cloudStorage.createSignedURL(questionRecord.cloudStorageAudioFileLocation, 'write');
		return { question: questionRecord, signedUrl, patientId };
	}

	if (!questionRecord.textResponse) {
		throw new TRPCError({
			code: 'INTERNAL_SERVER_ERROR',
			message: `Cannot summarize questions for a patient ${patientId} because there is no response for this question.`,
		});
	}

	void createInterviewQuestionSummary({
		ctx,
		interviewQuestionTheme,
		patientId,
		question: questionRecord.question,
		textResponse: questionRecord.textResponse,
	});
	return { question: questionRecord };
};

type UpsertInterviewQuestionData = {
	patientId: number;
	interviewQuestionShortLabel: string;
	interviewQuestionTheme: string;
	cloudStorageAudioFileLocation: string | null;
	question: string;
	audioTranscriptionStatus: AudioTranscriptionStatus | null;
	textResponse: string | null;
};
const upsertInterviewQuestion = async (input: UpsertInterviewQuestionData, ctx: PermissionedTRPCContext) => {
	const {
		patientId,
		interviewQuestionShortLabel,
		interviewQuestionTheme,
		textResponse,
		cloudStorageAudioFileLocation,
		audioTranscriptionStatus,
		question,
	} = input;
	const existingInterviewQuestion = await interviewQuestionRepo.findUnique(ctx, {
		where: {
			patientId_interviewQuestionShortLabel: {
				patientId,
				interviewQuestionShortLabel,
			},
		},
	});

	const interviewQuestion = await interviewQuestionRepo.upsert(ctx, {
		where: {
			patientId_interviewQuestionShortLabel: {
				patientId,
				interviewQuestionShortLabel,
			},
		},
		create: {
			interviewQuestionShortLabel,
			interviewQuestionTheme,
			patientId,
			textResponse,
			cloudStorageAudioFileLocation,
			audioTranscriptionStatus,
			question,
			userId: ctx.session.user.id,
		},
		update: {
			textResponse,
			cloudStorageAudioFileLocation,
			audioTranscriptionStatus,
			transcribedText: null,
		},
	});

	void createAuditLog(
		{
			patientId,
			payload: input,
			action: PatientAuditLogAction.UPDATE_PATIENT,
		},
		ctx,
	);

	if (existingInterviewQuestion) {
		await removeNurseInterviewQuestionItem(patientId, interviewQuestionTheme, question, ctx);
	}

	return interviewQuestion;
};

const removeNurseInterviewQuestionItem = async (
	patientId: number,
	interviewQuestionTheme: string,
	question: string,
	ctx: PermissionedTRPCContext,
) => {
	const nurseInterview = await nurseInterviewRepo.findUnique(ctx, {
		where: { patientId },
	});

	if (nurseInterview) {
		const themeSummary = await nurseInterviewThemeSummariesRepo.findUnique(ctx, {
			where: {
				nurseInterviewId_theme: {
					nurseInterviewId: nurseInterview.id,
					theme: interviewQuestionTheme,
				},
			},

			include: {
				QuestionItems: true,
			},
		});

		if (themeSummary) {
			const existingQuestionItem = themeSummary.QuestionItems.find((item) => item.question === question);
			if (existingQuestionItem) {
				logger.info(`Removing theme summary question item for patient ${patientId} and question ${question}`);
				await nurseInterviewQuestionItemRepo.delete(patientId, ctx, {
					where: {
						id: existingQuestionItem.id,
					},
				});
				void createAuditLog(
					{
						patientId,
						payload: { patientId, interviewQuestionTheme, question },
						action: PatientAuditLogAction.UPDATE_PATIENT,
					},
					ctx,
				);
			}
		}
	}
};

type CreateInterviewQuestionSummary = {
	textResponse: string;
	question: string;
	interviewQuestionTheme: string;
	patientId: number;
	ctx: PermissionedTRPCContext;
	sendToLLMSummarizer?: boolean;
};
const createInterviewQuestionSummary = async ({
	ctx,
	interviewQuestionTheme,
	patientId,
	question,
	textResponse,
	sendToLLMSummarizer = false,
}: CreateInterviewQuestionSummary) => {
	logger.info(`Creating theme summary question item for patient ${patientId} and question ${question}`);
	const summarizedTextResponse = await (sendToLLMSummarizer
		? summarizeText(textResponse, patientId)
		: Promise.resolve([]));

	const nurseInterview = await nurseInterviewRepo.upsert(ctx, {
		where: { patientId },
		create: { patientId, userId: ctx.session.user.id },
		update: {},
	});

	const themeSummary = await nurseInterviewThemeSummariesRepo.upsert(patientId, ctx, {
		where: {
			nurseInterviewId_theme: {
				nurseInterviewId: nurseInterview.id,
				theme: interviewQuestionTheme,
			},
		},
		create: {
			theme: interviewQuestionTheme,
			NurseInterview: {
				connect: { id: nurseInterview.id },
			},
			QuestionItems: {
				create: {
					question: question,
					LLMSummarizedText: summarizedTextResponse,
				},
			},
		},
		update: {},
		include: {
			QuestionItems: true,
		},
	});

	const existingQuestionItem = themeSummary.QuestionItems.find((item) => item.question === question);

	if (existingQuestionItem) {
		await nurseInterviewQuestionItemRepo.update(patientId, ctx, {
			where: {
				id: existingQuestionItem.id,
			},
			data: {
				LLMSummarizedText: summarizedTextResponse,
			},
		});
	} else {
		await nurseInterviewQuestionItemRepo.create(patientId, ctx, {
			data: {
				NurseInterviewThemeSummaryId: themeSummary.id,
				question: question,
				LLMSummarizedText: summarizedTextResponse,
			},
		});
	}
};

export const failedToSyncInterviewItem = async (
	{
		interviewQuestionShortLabel,
		interviewQuestionTheme,
		question,
		patientId,
	}: interviewInputs.FailedToSyncInterviewItem,
	ctx: PermissionedTRPCContext,
) => {
	const questionRecord = await upsertInterviewQuestion(
		{
			patientId,
			interviewQuestionShortLabel,
			question,
			interviewQuestionTheme,
			audioTranscriptionStatus: AudioTranscriptionStatus.Failed,
			textResponse: null,
			cloudStorageAudioFileLocation: null,
		},
		ctx,
	);
	void createInterviewQuestionSummary({
		ctx,
		interviewQuestionTheme,
		patientId,
		question: questionRecord.question,
		textResponse: '',
	});
	void createAuditLog(
		{
			patientId,
			payload: { interviewQuestionShortLabel, interviewQuestionTheme, question, patientId },
			action: PatientAuditLogAction.UPDATE_PATIENT,
		},
		ctx,
	);
	return questionRecord;
};

export const saveInterviewTranscribedAudio = async (
	{
		audioURL,
		interviewQuestionShortLabel,
		patientId,
		contentType,
	}: interviewInputs.SaveInterviewTranscribedAudioInput,
	ctx: PermissionedTRPCContext,
) => {
	logger.info(`Start transcribing audio for patient ${patientId} and question ${interviewQuestionShortLabel}`);

	await interviewQuestionRepo.update(ctx, {
		where: {
			patientId_interviewQuestionShortLabel: {
				patientId,
				interviewQuestionShortLabel,
			},
		},
		data: {
			audioTranscriptionStatus: AudioTranscriptionStatus.InProgress,
			audioContentType: contentType,
		},
	});

	void createAuditLog(
		{
			patientId,
			payload: { audioURL, interviewQuestionShortLabel, patientId, contentType },
			action: PatientAuditLogAction.UPDATE_PATIENT,
		},
		ctx,
	);
	void transcribeAndSaveResult(ctx, audioURL, interviewQuestionShortLabel, patientId, contentType);

	return { patientId };
};

export const saveNurseInterviewSOCQuestion = async (
	{
		patientId,
		SOCVisitDate,
		SOCVisitTime,
		hasCompletedMedicationPhotoUpload,
		...rest
	}: interviewInputs.SaveNurseInterviewSOCQuestionInput,
	ctx: PermissionedTRPCContext,
) => {
	if (SOCVisitDate ?? SOCVisitTime) {
		await patientRepo.update(ctx, {
			where: { id: patientId },
			data: {
				SOCVisitDate: SOCVisitDate ?? undefined,
				SOCVisitTime: SOCVisitTime ?? undefined,
			},
		});
		void createAuditLog(
			{
				patientId,
				payload: { patientId, SOCVisitDate, SOCVisitTime },
				action: PatientAuditLogAction.UPDATE_PATIENT,
			},
			ctx,
		);
	}
	if (hasCompletedMedicationPhotoUpload) {
		await nurseInterviewRepo.upsert(
			ctx,
			{
				where: {
					patientId,
				},
				create: {
					patientId,
					userId: ctx.session.user.id,
					hasCompletedMedicationPhotoUpload,
				},
				update: {
					hasCompletedMedicationPhotoUpload,
				},
			},
			{ allowNonAssignedUserToUpdate: true },
		);
		void createAuditLog(
			{
				patientId,
				payload: { patientId, hasCompletedMedicationPhotoUpload },
				action: PatientAuditLogAction.UPDATE_PATIENT,
			},
			ctx,
		);
	}
	const res = await nurseInterviewRepo.upsert(ctx, {
		where: {
			patientId,
		},
		create: {
			patientId,
			userId: ctx.session.user.id,
			...rest,
		},
		update: {
			...rest,
		},
	});
	void createAuditLog(
		{
			patientId,
			payload: { patientId, ...rest },
			action: PatientAuditLogAction.UPDATE_PATIENT,
		},
		ctx,
	);
	return res;
};

export const retryFailedTranscriptions = async (prisma: Prisma) => {
	const results = await prisma.interviewQuestion.findMany({
		where: {
			audioTranscriptionStatus: AudioTranscriptionStatus.Failed,
			retryAttempts: {
				lte: MAX_AUDIO_TRANSCRIPTION_ATTEMPTS,
			},
			cloudStorageAudioFileLocation: { not: null },
			audioContentType: { not: null },
		},
		take: 5,
	});

	if (results.length) {
		logger.info('retrying', results.length, 'failed transcriptions');
		for (const result of results) {
			const ctx = {
				dataAccessLevel: DataAccessPermissions.MINE,
				session: { user: { id: result.userId } },
				db: prisma,
			} as PermissionedTRPCContext;
			if (!result.cloudStorageAudioFileLocation || !result.audioContentType) {
				logger.info('Missing audio file location or content type', result);
				continue;
			}
			logger.info(
				`Retrying transcription for patient ${result.patientId} and question ${result.interviewQuestionShortLabel}`,
			);
			await interviewQuestionRepo.update(ctx, {
				where: {
					patientId_interviewQuestionShortLabel: {
						patientId: result.patientId,
						interviewQuestionShortLabel: result.interviewQuestionShortLabel,
					},
				},
				data: {
					audioTranscriptionStatus: AudioTranscriptionStatus.InProgress,
					retryAttempts: {
						increment: 1,
					},
				},
			});

			void transcribeAndSaveResult(
				ctx,
				result.cloudStorageAudioFileLocation,
				result.interviewQuestionShortLabel,
				result.patientId,
				result.audioContentType,
			);
		}
	}
};

const transcribeAndSaveResult = async (
	ctx: PermissionedTRPCContext,
	audioURL: string,
	interviewQuestionShortLabel: string,
	patientId: number,
	contentType: string,
) => {
	try {
		const { transcription, transcriptionConfidence } = await cloudSpeech.transcribeAudio(audioURL, contentType);

		logger.info(`Transcription completed for patient ${patientId} and question ${interviewQuestionShortLabel}`);

		const { question, interviewQuestionTheme } = await interviewQuestionRepo.update(ctx, {
			where: {
				patientId_interviewQuestionShortLabel: {
					patientId,
					interviewQuestionShortLabel,
				},
			},
			data: {
				transcribedText: transcription,
				transcribedTextConfidence: transcriptionConfidence,
				audioTranscriptionStatus: AudioTranscriptionStatus.Completed,
			},
		});

		void createInterviewQuestionSummary({
			ctx,
			interviewQuestionTheme,
			patientId,
			question,
			textResponse: transcription,
			sendToLLMSummarizer: true,
		});
	} catch (error) {
		logger.error(
			`Transcription failed for patient ${patientId} and question ${interviewQuestionShortLabel}`,
			error,
		);
		const isError = error instanceof Error;
		const isNoAudioError = isError && error.message.includes('No transcription data found');
		const audioTranscriptionStatus = (
			isNoAudioError ? AudioTranscriptionStatus.NoResults : AudioTranscriptionStatus.Failed
		) as AudioTranscriptionStatus;
		await interviewQuestionRepo.update(ctx, {
			where: {
				patientId_interviewQuestionShortLabel: {
					patientId,
					interviewQuestionShortLabel,
				},
			},
			data: {
				transcribedText: '',
				audioTranscriptionStatus,
			},
		});

		throw new TRPCError({
			code: 'INTERNAL_SERVER_ERROR',
			message: 'Failed to transcribe audio',
		});
	}
};

const getNurseInterviewQuestionsByPatientId = async (patientId: number, ctx: PermissionedTRPCContext) => {
	return await nurseInterviewQuestionItemRepo.findMany(ctx, {
		where: {
			NurseInterviewThemeSummaries: {
				NurseInterview: {
					patientId,
				},
			},
		},
	});
};

export const updateNurseInterviewSummary = async (
	{ patientId, changedAnswerData }: interviewInputs.UpdateNurseInterviewSummary,
	ctx: PermissionedTRPCContext,
) => {
	const existingNurseInterviewQuestions = await getNurseInterviewQuestionsByPatientId(patientId, ctx);

	const nurseInterview = await getNurseInterviewByPatientId(patientId, ctx);
	if (!nurseInterview) {
		throw new TRPCError({
			code: 'INTERNAL_SERVER_ERROR',
			message: `Cannot find nurse interview for patient ${patientId}`,
		});
	}

	const themeSummariesMap = new Map<string, number>();

	const existingNurseInterviewThemeSummaries = await getExistingNurseInterviewThemeSummariesByNurseInterviewId(
		nurseInterview.id,
		ctx,
	);

	existingNurseInterviewThemeSummaries.forEach((summary) => themeSummariesMap.set(summary.theme, summary.id));

	const updateAndCreateNurseInterviewQuestionPromises = [changedAnswerData].map(async (changedAnswer) => {
		return await handleQuestionUpdateOrCreate(
			patientId,
			changedAnswer,
			existingNurseInterviewQuestions,
			themeSummariesMap,
			nurseInterview,
			ctx,
		);
	});

	return await Promise.all(updateAndCreateNurseInterviewQuestionPromises);
};

export const submitForQA = async ({ patientId }: interviewInputs.SubmitForQA, ctx: PermissionedTRPCContext) => {
	await addWithinNormalLimitsQuestions(patientId, ctx);
	await patientService.updatePatientStatus({ status: PatientStatus.WithQA, patientId }, ctx);

	void assessmentService.generateAllAssessmentSuggestionsForPatient({ patientId }, ctx);

	return true;
};

async function addWithinNormalLimitsQuestions(patientId: number, ctx: PermissionedTRPCContext) {
	const patient = await patientService.getPatientById(patientId, ctx, {
		NurseInterview: {
			include: {
				NurseInterviewThemeSummaries: { include: { QuestionItems: true } },
			},
		},
	});
	if (!patient.NurseInterview) throw new Error('No nurse interview found');
	const reportedOnThemes = patient.NurseInterview.selectedThemesToReportOn;
	const withinNormalLimitsThemes = physicalAssessmentThemes.filter((theme) => !reportedOnThemes.includes(theme));
	const withinNormalLimitsQuestions = withinNormalLimitsThemes.flatMap((t) => allQuestionsForTheme(t));
	const questionAnsweredAlready = patient.NurseInterview.NurseInterviewThemeSummaries.flatMap((s) => s.QuestionItems);
	const needsWNLSummaryCreated = withinNormalLimitsQuestions.filter(
		(q) => !questionAnsweredAlready.some((qa) => qa.question === q.question),
	);
	for (const question of needsWNLSummaryCreated) {
		const input: interviewInputs.UpdateNurseInterviewSummary = {
			patientId,
			changedAnswerData: {
				questionId: null,
				themeName: question.theme,
				humanConfirmedSummarizedText: question.defaultResponse ?? 'Within Normal Limits',
				questionText: question.question,
			},
		};
		await updateNurseInterviewSummary(input, ctx);
	}
}

const handleQuestionUpdateOrCreate = async (
	patientId: number,
	changedAnswer: interviewInputs.ChangedAnswerData,
	existingNurseInterviewQuestions: NurseInterviewQuestionItem[],
	themeSummariesMap: Map<string, number>,
	nurseInterview: { id: number },
	ctx: PermissionedTRPCContext,
) => {
	const shouldUpdateQuestion = changedAnswer.questionId;

	if (shouldUpdateQuestion) {
		return await handleNurseInterviewQuestionUpdating(
			patientId,
			changedAnswer,
			existingNurseInterviewQuestions,
			ctx,
		);
	} else {
		return await handleNurseInterviewQuestionCreation(
			patientId,
			changedAnswer,
			themeSummariesMap,
			nurseInterview,
			ctx,
		);
	}
};

const handleNurseInterviewQuestionCreation = async (
	patientId: number,
	changedAnswer: interviewInputs.ChangedAnswerData,
	themeSummariesMap: Map<string, number>,
	nurseInterview: { id: number },
	ctx: PermissionedTRPCContext,
) => {
	const themeSummaryId = await getOrCreateThemeSummaryId(
		patientId,
		changedAnswer.themeName,
		nurseInterview.id,
		themeSummariesMap,
		ctx,
	);

	return await insertNurseInterviewQuestion(
		patientId,
		themeSummaryId,
		changedAnswer.questionText,
		changedAnswer.humanConfirmedSummarizedText,
		ctx,
	);
};

const getOrCreateThemeSummaryId = async (
	patientId: number,
	themeName: string,
	nurseInterviewId: number,
	themeSummariesMap: Map<string, number>,
	ctx: PermissionedTRPCContext,
): Promise<number> => {
	let themeSummaryId = themeSummariesMap.get(themeName);

	if (!themeSummaryId) {
		const createdThemeSummary = await createNurseInterviewThemeSummary(patientId, nurseInterviewId, themeName, ctx);
		themeSummaryId = createdThemeSummary.id;
		themeSummariesMap.set(themeName, themeSummaryId);
	}

	return themeSummaryId;
};

const insertNurseInterviewQuestion = async (
	patientId: number,
	themeSummaryId: number,
	questionText: string,
	humanConfirmedSummarizedText: string,
	ctx: PermissionedTRPCContext,
) => {
	return await nurseInterviewQuestionItemRepo.create(patientId, ctx, {
		data: {
			NurseInterviewThemeSummaryId: themeSummaryId,
			question: questionText,
			humanConfirmedSummarizedText: humanConfirmedSummarizedText,
		},
	});
};

const handleNurseInterviewQuestionUpdating = async (
	patientId: number,
	changedAnswer: interviewInputs.ChangedAnswerData,
	existingNurseInterviewQuestions: NurseInterviewQuestionItem[],
	ctx: PermissionedTRPCContext,
) => {
	const existingQuestion = existingNurseInterviewQuestions.find(
		(question) => question.id === changedAnswer.questionId,
	);

	if (existingQuestion) {
		return await setNurseInterviewQuestionHumanConfirmedSummarizedText(
			patientId,
			existingQuestion.id,
			changedAnswer.humanConfirmedSummarizedText,
			ctx,
		);
	} else {
		throw new TRPCError({
			code: 'INTERNAL_SERVER_ERROR',
			message: `Cannot find existing question with ID ${changedAnswer.questionId}`,
		});
	}
};

const getExistingNurseInterviewThemeSummariesByNurseInterviewId = async (
	nurseInterviewId: number,
	ctx: PermissionedTRPCContext,
): Promise<{ id: number; theme: string }[]> => {
	return await nurseInterviewThemeSummariesRepo.findMany(ctx, {
		where: { nurseInterviewId },
		select: { id: true, theme: true },
	});
};

const getNurseInterviewByPatientId = async (
	patientId: number,
	ctx: PermissionedTRPCContext,
): Promise<{ id: number } | null> => {
	return await nurseInterviewRepo.findUnique(ctx, {
		where: {
			patientId,
		},
		select: {
			id: true,
		},
	});
};

const createNurseInterviewThemeSummary = async (
	patientId: number,
	nurseInterviewId: number,
	theme: string,
	ctx: PermissionedTRPCContext,
) => {
	return await nurseInterviewThemeSummariesRepo.create(patientId, ctx, {
		data: {
			nurseInterviewId: nurseInterviewId,
			theme: theme,
		},
	});
};

const setNurseInterviewQuestionHumanConfirmedSummarizedText = async (
	patientId: number,
	id: number,
	humanConfirmedSummarizedText: string,
	ctx: PermissionedTRPCContext,
) => {
	return await nurseInterviewQuestionItemRepo.update(patientId, ctx, {
		where: { id },
		data: { humanConfirmedSummarizedText },
	});
};

const LOW_CONFIDENCE_TRANSCRIPTION_THRESHOLD = 0.5;
export const shouldDisplayLowConfidenceTranscribedText = async (
	input: interviewInputs.ShouldDisplayLowConfidenceTranscribedText,
	ctx: ProtectedTRPCContext,
) => {
	const acknowledgedLowConfidenceQuestions = await ctx.db.interviewQuestion.findMany({
		where: {
			AND: [
				{ patientId: input.patientId },
				{ transcribedTextConfidence: { lt: LOW_CONFIDENCE_TRANSCRIPTION_THRESHOLD } },
				{ NOT: [{ lowConfidenceAcknowledged: null }] },
			],
		},
	});

	if (acknowledgedLowConfidenceQuestions.length) {
		return {
			acknowledged: true,
			shouldShowWarning: false,
		};
	}

	const unacknowledgedLowConfidenceQuestions = await ctx.db.interviewQuestion.findMany({
		where: {
			AND: [
				{ patientId: input.patientId },
				{ transcribedTextConfidence: { lt: LOW_CONFIDENCE_TRANSCRIPTION_THRESHOLD } },
				{ lowConfidenceAcknowledged: null },
			],
		},
	});

	if (unacknowledgedLowConfidenceQuestions.length) {
		await acknowledgeLowConfidenceTranscribedText(input, ctx);
	}

	return {
		acknowledged: false,
		shouldShowWarning: !!unacknowledgedLowConfidenceQuestions.length,
	};
};

const acknowledgeLowConfidenceTranscribedText = async (
	input: interviewInputs.ShouldDisplayLowConfidenceTranscribedText,
	ctx: ProtectedTRPCContext,
) => {
	return await ctx.db.interviewQuestion.updateMany({
		where: {
			AND: [
				{ patientId: input.patientId },
				{ transcribedTextConfidence: { lt: LOW_CONFIDENCE_TRANSCRIPTION_THRESHOLD } },
				{ lowConfidenceAcknowledged: null },
			],
		},
		data: {
			lowConfidenceAcknowledged: new Date(),
		},
	});
};
