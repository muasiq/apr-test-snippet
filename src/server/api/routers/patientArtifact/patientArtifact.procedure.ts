import { createTRPCRouter, permissionProtectedProcedure } from '~/server/api/trpc';
import { UserActionPermissions } from '../../../../common/utils/permissions';
import * as patientArtifactInputs from './patientArtifact.inputs';
import * as patientArtifactService from './patientArtifact.service';

export const patientArtifactRouter = createTRPCRouter({
	deleteArtifact: permissionProtectedProcedure(UserActionPermissions.DELETE_ARTIFACTS)
		.input(patientArtifactInputs.deleteArtifactSchema)
		.mutation(({ input, ctx }) => {
			return patientArtifactService.deleteArtifact(input, ctx);
		}),
	getAllSignedImageUrlsByIdAndTagname: permissionProtectedProcedure(UserActionPermissions.VIEW_PATIENT_PROFILE)
		.input(patientArtifactInputs.getAllSignedImageUrlsByIdAndTagnameSchema)
		.query(({ input, ctx }) => {
			return patientArtifactService.getAllSignedImageUrlsByPatientId(input, ctx);
		}),
	getSignedImageUrlId: permissionProtectedProcedure(UserActionPermissions.VIEW_PATIENT_PROFILE)
		.input(patientArtifactInputs.getSignedImageUrlById)
		.mutation(({ input, ctx }) => {
			return patientArtifactService.getSignedImageUrlById(input, ctx);
		}),

	createArtifactAndGenerateSignedUrl: permissionProtectedProcedure(UserActionPermissions.CREATE_PATIENT_ARTIFACTS)
		.input(patientArtifactInputs.createArtifactAndGenerateSignedUrlSchema)
		.mutation(({ input, ctx }) => {
			return patientArtifactService.createPatientArtifactAndGenerateSignedUrl(input, ctx);
		}),

	finalizeArtifactUpload: permissionProtectedProcedure(UserActionPermissions.CREATE_PATIENT_ARTIFACTS)
		.input(patientArtifactInputs.finalizeArtifactUploadSchema)
		.mutation(({ input, ctx }) => {
			return patientArtifactService.finalizeArtifactUpload(input, ctx);
		}),

	saveArtifactRelevantPages: permissionProtectedProcedure(UserActionPermissions.CREATE_PATIENT_ARTIFACTS)
		.input(patientArtifactInputs.saveArtifactRelevantPagesSchema)
		.mutation(({ input, ctx }) => {
			return patientArtifactService.saveArtifactRelevantPages(input, ctx);
		}),

	saveArtifactRelevantMedPages: permissionProtectedProcedure(UserActionPermissions.CREATE_PATIENT_ARTIFACTS)
		.input(patientArtifactInputs.saveArtifactRelevantMedPagesSchema)
		.mutation(({ input, ctx }) => {
			return patientArtifactService.saveArtifactRelevantMedPages(input, ctx);
		}),
	updateArtifact: permissionProtectedProcedure(UserActionPermissions.CREATE_PATIENT_ARTIFACTS)
		.input(patientArtifactInputs.patientArtifactUpdateSchema)
		.mutation(({ input, ctx }) => {
			return patientArtifactService.updateArtifact(input, ctx);
		}),
});
