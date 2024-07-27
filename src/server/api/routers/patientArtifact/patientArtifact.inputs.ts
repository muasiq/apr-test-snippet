import { PatientArtifactTag } from '@prisma/client';
import { z } from 'zod';

export const deleteArtifactSchema = z.object({
	artifactId: z.number(),
});
export type DeleteArtifact = z.infer<typeof deleteArtifactSchema>;

export const createPatientArtifactSchema = z.object({
	fileName: z.string().min(1),
	patientId: z.number(),
	tagName: z.nativeEnum(PatientArtifactTag),
	fileType: z.string().min(1),
});
export type CreatePatientArtifactInput = z.infer<typeof createPatientArtifactSchema>;

export const createArtifactAndGenerateSignedUrlSchema = z.object({
	fileName: z.string().min(1),
	patientId: z.number(),
	action: z.enum(['read', 'write']),
	tagName: z.nativeEnum(PatientArtifactTag),
	fileType: z.string().min(1),
});
export type CreateArtifactAndGenerateSignedUrlInput = z.infer<typeof createArtifactAndGenerateSignedUrlSchema>;

export const finalizeArtifactUploadSchema = z.object({
	artifactId: z.number(),
});
export type FinalizeArtifactUploadInput = z.infer<typeof finalizeArtifactUploadSchema>;

export const saveArtifactRelevantPagesSchema = z.object({
	relevantPages: z.array(z.number()),
	artifactId: z.number(),
});
export type SaveArtifactRelevantPagesInput = z.infer<typeof saveArtifactRelevantPagesSchema>;

export const saveArtifactRelevantMedPagesSchema = z.object({
	relevantMedPages: z.array(z.number()),
	artifactId: z.number(),
});
export type SaveArtifactRelevantMedPagesInput = z.infer<typeof saveArtifactRelevantMedPagesSchema>;

export const getAllSignedImageUrlsByIdAndTagnameSchema = z.object({
	patientId: z.number(),
	tagName: z.nativeEnum(PatientArtifactTag),
	viewOnly: z.boolean().optional(),
});
export type GetAllSignedImageUrlsByIdAndTagnameInput = z.infer<typeof getAllSignedImageUrlsByIdAndTagnameSchema>;

export const getSignedImageUrlById = z.object({
	id: z.number(),
	viewOnly: z.boolean().optional(),
});
export type GetSignedImageUrlByIdInput = z.infer<typeof getSignedImageUrlById>;

export const patientArtifactUpdateSchema = z.object({
	artifactId: z.number(),
	attachmentTypeId: z.number().nullish(),
	fileName: z.string().trim().min(1),
});
export type PatientArtifactUpdateInput = z.infer<typeof patientArtifactUpdateSchema>;
