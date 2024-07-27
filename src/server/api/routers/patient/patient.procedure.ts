import { createTRPCRouter, permissionProtectedProcedure } from '~/server/api/trpc';
import { UserActionPermissions } from '../../../../common/utils/permissions';
import * as patientInputs from './patient.inputs';
import * as patientService from './patient.service';
import { PatientWithJoinsIncludeType } from './patient.types';

export const patientRouter = createTRPCRouter({
	create: permissionProtectedProcedure(UserActionPermissions.CREATE_PATIENT)
		.input(patientInputs.createPatientSchema)
		.mutation(({ input, ctx }) => {
			return patientService.createPatient(input, ctx);
		}),

	update: permissionProtectedProcedure(UserActionPermissions.ABLE_TO_EDIT_PATIENT_INFO_TAB)
		.input(patientInputs.updatePatientSchema)
		.mutation(({ input, ctx }) => {
			return patientService.updatePatient(input, ctx);
		}),

	delete: permissionProtectedProcedure(UserActionPermissions.ARCHIVE_PATIENT_RECORD)
		.input(patientInputs.deleteByIdSchema)
		.mutation(({ input, ctx }) => {
			return patientService.deletePatient(input, ctx);
		}),

	getScheduleView: permissionProtectedProcedure(UserActionPermissions.VIEW_PATIENTS).query(({ ctx }) => {
		return patientService.getScheduleViewPatients(ctx);
	}),

	getInfinite: permissionProtectedProcedure(UserActionPermissions.VIEW_PATIENTS)
		.input(patientInputs.getInfiniteSchema)
		.query(({ input, ctx }) => {
			return patientService.getInfinitePatients(input, ctx);
		}),

	getPatientsByStatus: permissionProtectedProcedure(UserActionPermissions.VIEW_PROMPT_ITERATION_SCREEN)
		.input(patientInputs.getPatientsByStatusSchema)
		.query(({ input, ctx }) => {
			return patientService.getPatientsByStatus(input, ctx);
		}),

	getById: permissionProtectedProcedure(UserActionPermissions.VIEW_PATIENT_PROFILE)
		.input(patientInputs.getByIdSchema)
		.query(async ({ input, ctx }) => {
			const { id, includes } = input;
			const result = await patientService.getPatientById(id, ctx, includes as PatientWithJoinsIncludeType);
			return result;
		}),

	updatePatientStatus: permissionProtectedProcedure(UserActionPermissions.UPDATE_PATIENT_STATUS)
		.input(patientInputs.updatePatientStatus)
		.mutation(({ input, ctx }) => {
			return patientService.updatePatientStatus(input, ctx);
		}),

	manuallyChangePatientStatus: permissionProtectedProcedure(
		UserActionPermissions.MANUALLY_CHANGE_STATUS_OF_PATIENT_RECORD,
	)
		.input(patientInputs.updatePatientStatus)
		.mutation(({ input, ctx }) => {
			return patientService.updatePatientStatus(input, ctx);
		}),
	setPatientStatusAsComplete: permissionProtectedProcedure(
		UserActionPermissions.MANUALLY_SET_PATIENT_RECORD_AS_COMPLETE,
	)
		.input(patientInputs.setPatientStatusAsCompleteSchema)
		.mutation(({ input, ctx }) => {
			return patientService.setPatientStatusAsComplete(input, ctx);
		}),
	setPatientStatusAsNonAdmit: permissionProtectedProcedure(
		UserActionPermissions.MANUALLY_SET_PATIENT_RECORD_AS_NON_ADMIT,
	)
		.input(patientInputs.setPatientStatusAsNonAdmitSchema)
		.mutation(({ input, ctx }) => {
			return patientService.setPatientStatusAsNonAdmit(input, ctx);
		}),
	setPatientStatusAsNewPatient: permissionProtectedProcedure(
		UserActionPermissions.MANUALLY_SET_PATIENT_RECORD_AS_NEW_PATIENT,
	)
		.input(patientInputs.setPatientStatusAsNewPatientSchema)
		.mutation(({ input, ctx }) => {
			return patientService.setPatientStatusAsNewPatient(input, ctx);
		}),
	confirmAssessmentSectionByPatientId: permissionProtectedProcedure(UserActionPermissions.SIGN_OFF_BUTTON_VISIBLE)
		.input(patientInputs.confirmAssessmentSectionByPatientIdSchema)
		.mutation(({ input, ctx }) => {
			return patientService.confirmAssessmentSectionByPatientId(input, ctx);
		}),
	assignQaUserToPatient: permissionProtectedProcedure(UserActionPermissions.MANAGE_QA)
		.input(patientInputs.assignQAUserToPatientSchema)
		.mutation(({ input, ctx }) => {
			return patientService.assignQAUserToPatient(input, ctx);
		}),
	assignDataEntryUserToPatient: permissionProtectedProcedure(UserActionPermissions.MANAGE_DATAENTRY)
		.input(patientInputs.assignDataEntryUserToPatientSchema)
		.mutation(({ input, ctx }) => {
			return patientService.assignDataEntryUserToPatient(input, ctx);
		}),
	resetPatient: permissionProtectedProcedure(UserActionPermissions.RESET_PATIENT)
		.input(patientInputs.resetPatientSchema)
		.mutation(({ input, ctx }) => {
			return patientService.resetPatient(input, ctx);
		}),
	getVisitNoteSignedUrls: permissionProtectedProcedure(UserActionPermissions.DOWNLOAD_VISIT_NOTE)
		.input(patientInputs.downloadVisitNoteSchema)
		.query(({ input, ctx }) => {
			return patientService.getVisitNoteSignedUrls(input, ctx);
		}),

	generateTestPatientData: permissionProtectedProcedure(UserActionPermissions.GENERATE_TEST_DATA)
		.input(patientInputs.generateTestPatientDataSchema)
		.mutation(({ input, ctx }) => {
			return patientService.generateTestPatientData(input, ctx);
		}),
});
