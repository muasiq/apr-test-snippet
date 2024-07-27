import { rpaRouter } from '~/server/rpa/routers/rpa.procedure';
import { createRpaTRPCRouter } from '~/server/rpa/trpc';

export const rpaAppRouter = createRpaTRPCRouter({
	rpa: rpaRouter,
});
