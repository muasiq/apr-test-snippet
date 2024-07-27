import { NextApiRequest, NextApiResponse } from 'next';
import { createOpenApiNextHandler } from 'trpc-openapi';
import { rpaAppRouter } from '~/server/rpa/root';
import { createRpaTRPCContext } from '~/server/rpa/trpc';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	return createOpenApiNextHandler({
		router: rpaAppRouter,
		createContext: createRpaTRPCContext,
		onError: ({ path, error }) => {
			console.error(`❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`, error);
		},
	})(req, res);
};

export default handler;

export const config = {
	api: {
		responseLimit: '16mb',
	},
};
