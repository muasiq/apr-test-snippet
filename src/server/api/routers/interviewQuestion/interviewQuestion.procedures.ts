import { createTRPCRouter, permissionProtectedProcedure } from '~/server/api/trpc';
import { UserActionPermissions } from '../../../../common/utils/permissions';
import * as interviewQuestionInputs from './interviewQuestion.inputs';
import * as interviewQuestionService from './interviewQuestion.service';

export const interviewQuestionRouter = createTRPCRouter({
	saveInterviewQuestion: permissionProtectedProcedure(
		UserActionPermissions.START_RESUME_SOC_ASSESSMENT_BUTTON_VISIBLE,
	)
		.input(interviewQuestionInputs.saveInterviewQuestionSchema)
		.mutation(({ input, ctx }) => {
			return interviewQuestionService.saveInterviewQuestion(input, ctx);
		}),
	saveInterviewTranscribedAudio: permissionProtectedProcedure(
		UserActionPermissions.START_RESUME_SOC_ASSESSMENT_BUTTON_VISIBLE,
	)
		.input(interviewQuestionInputs.saveInterviewTranscribedAudioSchema)
		.mutation(({ input, ctx }) => {
			return interviewQuestionService.saveInterviewTranscribedAudio(input, ctx);
		}),
	failedToSyncInterviewItem: permissionProtectedProcedure(
		UserActionPermissions.START_RESUME_SOC_ASSESSMENT_BUTTON_VISIBLE,
	)
		.input(interviewQuestionInputs.failedToSyncInterviewItem)
		.mutation(({ input, ctx }) => {
			return interviewQuestionService.failedToSyncInterviewItem(input, ctx);
		}),
	saveNurseInterviewSOCQuestion: permissionProtectedProcedure(
		UserActionPermissions.START_RESUME_SOC_ASSESSMENT_BUTTON_VISIBLE,
	)
		.input(interviewQuestionInputs.saveNurseInterviewSOCQuestionSchema)
		.mutation(({ input, ctx }) => {
			return interviewQuestionService.saveNurseInterviewSOCQuestion(input, ctx);
		}),

	updateNurseInterviewSummary: permissionProtectedProcedure(
		UserActionPermissions.START_RESUME_SOC_ASSESSMENT_BUTTON_VISIBLE,
	)
		.input(interviewQuestionInputs.updateNurseInterviewSummarySchema)
		.mutation(({ input, ctx }) => {
			return interviewQuestionService.updateNurseInterviewSummary(input, ctx);
		}),

	submitForQA: permissionProtectedProcedure(UserActionPermissions.START_RESUME_SOC_ASSESSMENT_BUTTON_VISIBLE)
		.input(interviewQuestionInputs.submitForQASchema)
		.mutation(({ input, ctx }) => {
			return interviewQuestionService.submitForQA(input, ctx);
		}),

	shouldDisplayLowConfidenceTranscribedText: permissionProtectedProcedure(
		UserActionPermissions.START_RESUME_SOC_ASSESSMENT_BUTTON_VISIBLE,
	)
		.input(interviewQuestionInputs.shouldDisplayLowConfidenceTranscribedText)
		.query(({ input, ctx }) => {
			return interviewQuestionService.shouldDisplayLowConfidenceTranscribedText(input, ctx);
		}),
});
