import { AssessmentAnswerIntegrationStatus, PatientArtifactIntegrationStatus } from '@prisma/client';
import { z } from 'zod';

export const getPatientByIdSchema = z.object({
	patientId: z.number(),
});

export type GetPatientByIdInput = z.infer<typeof getPatientByIdSchema>;

export const updateRpaPatientAssessmentAnswerSchema = z.object({
	patientId: z.number(),
	assessmentNumber: z.string(),
	message: z.string().nullish().default(null),
	status: z.nativeEnum(AssessmentAnswerIntegrationStatus),
});

export type UpdateRpaPatientAssessmentAnswerInput = z.infer<typeof updateRpaPatientAssessmentAnswerSchema>;

export const markPatientAsInProgress = z.object({
	patientId: z.number(),
});

export type MarkPatientAsInProgress = z.infer<typeof markPatientAsInProgress>;

export const markPatientAsCompleteSchema = z.object({
	patientId: z.number(),
});

export type MarkPatientAsCompleteInput = z.infer<typeof markPatientAsCompleteSchema>;

export const getAssessmentScreenshotUploadUrlSchema = z.object({
	patientId: z.number(),
	assessmentNumber: z.string(),
});

export type GetAssessmentScreenshotUploadUrlInput = z.infer<typeof getAssessmentScreenshotUploadUrlSchema>;

export const requestLoginSchema = z.object({
	patientId: z.number(),
});

export type RequestLoginInput = z.infer<typeof requestLoginSchema>;

export const requestMainLoginSchema = z.object({
	orgId: z.number(),
});

export type RequestMainLoginInput = z.infer<typeof requestMainLoginSchema>;

export const requestMainLogoutSchema = z.object({
	loginId: z.number(),
});

export type RequestMainLogoutInput = z.infer<typeof requestMainLogoutSchema>;

export const updateRpaPatientArtifactSchema = z.object({
	patientId: z.number(),
	artifactId: z.number(),
	integrationStatus: z.enum([PatientArtifactIntegrationStatus.Completed, PatientArtifactIntegrationStatus.Failed]),
	integrationMessage: z.string().nullable().default(null),
});

export type UpdateRpaPatientArtifactInput = z.infer<typeof updateRpaPatientArtifactSchema>;
