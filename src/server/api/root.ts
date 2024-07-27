import { assessmentRouter } from '~/server/api/routers/assessment/assessment.procedures';
import { interviewQuestionRouter } from '~/server/api/routers/interviewQuestion/interviewQuestion.procedures';
import { organizationRouter } from '~/server/api/routers/organization/organization.procedures';
import { userRouter } from '~/server/api/routers/user/user.procedure';
import { createCallerFactory, createTRPCRouter } from '~/server/api/trpc';
import { startJobsForLocalDev } from '../cron-jobs';
import { configurationRouter } from './routers/configuration/configuration.procedures';
import { medicationRouter } from './routers/medication/medication.procedure';
import { patientRouter } from './routers/patient/patient.procedure';
import { patientArtifactRouter } from './routers/patientArtifact/patientArtifact.procedure';
import { promptIterationRouter } from './routers/promptIteration/promptIteration.procedure';
import { statsRouter } from './routers/stats/stats.procedure';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	assessment: assessmentRouter,
	configuration: configurationRouter,
	interviewQuestion: interviewQuestionRouter,
	organization: organizationRouter,
	patient: patientRouter,
	patientArtifact: patientArtifactRouter,
	promptIteration: promptIterationRouter,
	stats: statsRouter,
	user: userRouter,
	medication: medicationRouter,
});

export const createCaller = createCallerFactory(appRouter);

// export type definition of API
export type AppRouter = typeof appRouter;

startJobsForLocalDev();
