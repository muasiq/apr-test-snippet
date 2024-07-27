import { env } from '../env.mjs';
import { retryFailedTranscriptions } from './api/routers/interviewQuestion/interviewQuestion.service';
import { processQueuedArtifacts } from './api/routers/patientArtifact/patientArtifact.service';
import { prisma } from './prisma';

const LOCAL_DEV_JOB_INTERVAL = 1000 * 5;

export const runQueueJobs = () => {
	void processQueuedArtifacts(prisma);
};

export const runFailedJobs = () => {
	void retryFailedTranscriptions(prisma);
};

export const startJobsForLocalDev = () => {
	if (env.NODE_ENV !== 'production' && env.NODE_ENV !== 'test') {
		console.info('Running jobs in local dev mode');
		setInterval(runQueueJobs, LOCAL_DEV_JOB_INTERVAL);
	}
};
