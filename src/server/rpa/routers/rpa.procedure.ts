import { z } from 'zod';
import * as rpaInputs from '~/server/rpa/routers/rpa.inputs';
import { rpaService } from '~/server/rpa/routers/rpa.service';
import { createRpaTRPCRouter, rpaProcedure } from '~/server/rpa/trpc';

export const rpaRouter = createRpaTRPCRouter({
	requestLogin: rpaProcedure
		.meta({ openapi: { method: 'POST', path: '/patients/{patientId}/emr/request-login' } })
		.input(rpaInputs.requestLoginSchema)
		.output(z.any())
		.mutation(({ ctx, input }) => {
			return rpaService.requestLogin(ctx, input);
		}),

	requestMainLogin: rpaProcedure
		.meta({ openapi: { method: 'POST', path: '/emr/request-main-login' } })
		.input(rpaInputs.requestMainLoginSchema)
		.output(z.any())
		.mutation(({ ctx, input }) => {
			return rpaService.requestMainLogin(ctx, input);
		}),

	requestMainLogout: rpaProcedure
		.meta({ openapi: { method: 'POST', path: '/emr/request-main-logout' } })
		.input(rpaInputs.requestMainLogoutSchema)
		.output(z.any())
		.mutation(({ ctx, input }) => {
			return rpaService.requestMainLogout(ctx, input);
		}),

	getRpaPatients: rpaProcedure
		.meta({ openapi: { method: 'GET', path: '/patients' } })
		.input(z.void())
		.output(z.any())
		.query(({ ctx }) => {
			return rpaService.getRpaPatients(ctx);
		}),

	getRpaPatient: rpaProcedure
		.meta({ openapi: { method: 'GET', path: '/patients/{patientId}' } })
		.input(rpaInputs.getPatientByIdSchema)
		.output(z.any())
		.query(({ ctx, input }) => {
			return rpaService.getRpaPatient(ctx, input);
		}),

	updateRpaPatientAssessmentNumber: rpaProcedure
		.meta({ openapi: { method: 'POST', path: '/patients/{patientId}/{assessmentNumber}' } })
		.input(rpaInputs.updateRpaPatientAssessmentAnswerSchema)
		.output(z.any())
		.mutation(({ ctx, input }) => {
			return rpaService.updateRpaPatientAssessmentAnswer(ctx, input);
		}),

	updateRpaPatientArtifact: rpaProcedure
		.meta({ openapi: { method: 'POST', path: '/patients/{patientId}/artifacts/{artifactId}' } })
		.input(rpaInputs.updateRpaPatientArtifactSchema)
		.output(z.any())
		.mutation(({ ctx, input }) => {
			return rpaService.updateRpaPatientArtifact(ctx, input);
		}),

	getAssessmentScreenshotUploadUrl: rpaProcedure
		.meta({ openapi: { method: 'GET', path: '/patients/{patientId}/{assessmentNumber}' } })
		.input(rpaInputs.getAssessmentScreenshotUploadUrlSchema)
		.output(z.any())
		.query(({ ctx, input }) => {
			return rpaService.getAssessmentScreenshotUploadUrl(ctx, input);
		}),
});
