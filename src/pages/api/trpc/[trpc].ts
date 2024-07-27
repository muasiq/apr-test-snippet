import * as Sentry from '@sentry/node';
import { createNextApiHandler } from '@trpc/server/adapters/next';
import logger from '~/common/utils/logger';
import { appRouter } from '~/server/api/root';
import { createTRPCContext } from '~/server/api/trpc';

// export API handler
export default createNextApiHandler({
	router: appRouter,
	createContext: createTRPCContext,
	onError: ({ path, error }) => {
		logger.error(`❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`, error);
		Sentry.captureException({ path, error });
	},
});

export const config = {
	api: {
		responseLimit: '16mb',
	},
};
