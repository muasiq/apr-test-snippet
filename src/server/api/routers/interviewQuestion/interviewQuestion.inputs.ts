import { z } from 'zod';
import {
	NurseInterviewBaselineThemes,
	NurseInterviewPhysicalAssessmentThemes,
} from '../../../../assessments/nurse-interview/questions';

export const saveInterviewQuestionSchema = z.object({
	interviewQuestionShortLabel: z.string(),
	interviewQuestionTheme: z.string(),
	question: z.string(),
	textResponse: z.string().nullable(),
	hasAudioResponse: z.boolean(),
	patientId: z.number(),
});
export type SaveInterviewQuestionInput = z.infer<typeof saveInterviewQuestionSchema>;

export const saveInterviewTranscribedAudioSchema = z.object({
	interviewQuestionShortLabel: z.string(),
	patientId: z.number(),
	audioURL: z.string(),
	contentType: z.string(),
});
export type SaveInterviewTranscribedAudioInput = z.infer<typeof saveInterviewTranscribedAudioSchema>;

export const failedToSyncInterviewItem = z.object({
	interviewQuestionShortLabel: z.string(),
	interviewQuestionTheme: z.string(),
	question: z.string(),
	patientId: z.number(),
});
export type FailedToSyncInterviewItem = z.infer<typeof failedToSyncInterviewItem>;

export const saveNurseInterviewSOCQuestionSchema = z.object({
	SOCVisitDate: z.date().nullish(),
	SOCVisitTime: z.date().nullish(),
	distanceTraveled: z.number().optional(),
	minutesSpentWithPatient: z.number().optional(),
	minutesSpentDriving: z.number().optional(),
	totalWounds: z.number().optional(),
	hasCompletedWoundPhotoUpload: z.boolean().optional(),
	hasCompletedMedicationPhotoUpload: z.boolean().optional(),
	hasCompletedDocumentsUpload: z.boolean().optional(),
	hasCompletedOtherPhotoUpload: z.boolean().optional(),
	hasConfirmedThemesWithinNormalLimits: z.boolean().optional(),
	selectedThemesToReportOn: z.array(z.string()).optional(),
	patientId: z.number(),
});
export type SaveNurseInterviewSOCQuestionInput = z.infer<typeof saveNurseInterviewSOCQuestionSchema>;

export const updateInterviewPhotoSectionCompletedStatusSchema = z.object({
	patientId: z.number(),
});
export type UpdateInterviewPhotoSectionCompletedStatusInput = z.infer<
	typeof updateInterviewPhotoSectionCompletedStatusSchema
>;

const changedAnswerDataSchema = z.object({
	themeName: z.union([
		z.nativeEnum(NurseInterviewBaselineThemes),
		z.nativeEnum(NurseInterviewPhysicalAssessmentThemes),
	]),
	questionId: z.number().nullable(),
	humanConfirmedSummarizedText: z.string().min(1),
	questionText: z.string().min(1),
});

export const updateNurseInterviewSummarySchema = z.object({
	patientId: z.number(),
	changedAnswerData: changedAnswerDataSchema,
});
export type UpdateNurseInterviewSummary = z.infer<typeof updateNurseInterviewSummarySchema>;

export const submitForQASchema = z.object({
	patientId: z.number(),
});
export type SubmitForQA = z.infer<typeof submitForQASchema>;

export type ChangedAnswerData = z.infer<typeof changedAnswerDataSchema>;

export const shouldDisplayLowConfidenceTranscribedText = z.object({
	patientId: z.number(),
});
export type ShouldDisplayLowConfidenceTranscribedText = z.infer<typeof shouldDisplayLowConfidenceTranscribedText>;
