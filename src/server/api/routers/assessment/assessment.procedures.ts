import { createTRPCRouter, permissionProtectedProcedure } from '~/server/api/trpc';
import { UserActionPermissions } from '../../../../common/utils/permissions';
import * as assessmentInputs from './assessment.inputs';
import * as assessmentService from './assessment.service';

export const assessmentRouter = createTRPCRouter({
	assessmentCheck: permissionProtectedProcedure(UserActionPermissions.ANSWER_ASSESSMENT_QUESTION)
		.input(assessmentInputs.assessmentCheckSchema)
		.mutation(({ input, ctx }) => {
			return assessmentService.assessmentCheck(input, ctx);
		}),
	unicornButton: permissionProtectedProcedure(UserActionPermissions.AUTOFILL_ALL_DOCUMENTATION_ITEMS)
		.input(assessmentInputs.unicornButton)
		.mutation(({ input, ctx }) => {
			return assessmentService.unicornButtonMutation(input, ctx);
		}),
	verifyMedicationInteractionsAssessment: permissionProtectedProcedure(
		UserActionPermissions.VERIFY_MEDICATION_INTERACTIONS,
	)
		.input(assessmentInputs.verifyMedicationInteractionsAssessmentSchema)
		.mutation(({ input, ctx }) => {
			return assessmentService.verifyMedicationInteractionsAssessment(input, ctx);
		}),
	getAllAssessmentQuestionsForPatient: permissionProtectedProcedure(UserActionPermissions.VIEW_PATIENT_PROFILE)
		.input(assessmentInputs.getAllAssessmentQuestionsForPatientSchema)
		.query(({ input, ctx }) => {
			return assessmentService.getAllAssessmentQuestionsForPatient(input, ctx);
		}),

	getAssessmentQuestionForPatient: permissionProtectedProcedure(UserActionPermissions.VIEW_PATIENT_PROFILE)
		.input(assessmentInputs.getAssessmentQuestionForPatient)
		.query(({ input, ctx }) => {
			return assessmentService.getAssessmentQuestionForPatient(input, ctx);
		}),

	generateAssessmentAnswer: permissionProtectedProcedure(UserActionPermissions.GENERATE_SUGGESTION)
		.input(assessmentInputs.generateAssessmentAnswer)
		.mutation(({ input, ctx }) => {
			return assessmentService.generateAssessmentAnswer(input, ctx);
		}),
	generateAllAssessmentSuggestionsForPatient: permissionProtectedProcedure(UserActionPermissions.QA_TAB_VISIBLE)
		.input(assessmentInputs.generateAllAssessmentSuggestionsForPatient)
		.mutation(({ input, ctx }) => {
			return assessmentService.generateAllAssessmentSuggestionsForPatient(input, ctx);
		}),
});
