import * as Sentry from '@sentry/nextjs';
import { TRPCError, initTRPC, type inferAsyncReturnType } from '@trpc/server';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import superjson from 'superjson';
import { OpenApiMeta } from 'trpc-openapi';
import { ZodError } from 'zod';
import { env } from '~/env.mjs';
import { prisma } from '../prisma';

interface CreateContextOptions {
	accessKey?: string;
	secretKey?: string;
}

function createInnerTRPCContext(opts: CreateContextOptions) {
	return {
		accessKey: opts.accessKey,
		secretKey: opts.secretKey,
		db: prisma,
	};
}

export function createRpaTRPCContext(opts: CreateNextContextOptions) {
	const { req } = opts;

	const accessKey = req.headers['access-key'] as string | undefined;
	const secretKey = req.headers['secret-key'] as string | undefined;

	return createInnerTRPCContext({
		accessKey,
		secretKey,
	});
}

const t = initTRPC
	.context<typeof createRpaTRPCContext>()
	.meta<OpenApiMeta>()
	.create({
		transformer: superjson,
		errorFormatter({ shape, error }) {
			return {
				...shape,
				data: {
					...shape.data,
					zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
				},
			};
		},
	});

export const createRpaTRPCRouter = t.router;

export const createRpaCallerFactory = t.createCallerFactory;

const publicProcedure = t.procedure;
export type RpaTRPCContext = inferAsyncReturnType<typeof createRpaTRPCContext>;

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
	if (ctx.accessKey !== env.RPA_ACCESS_KEY || ctx.secretKey !== env.RPA_SECRET_KEY) {
		throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Unauthorized' });
	}

	return next();
});

const sentryMiddleware = t.middleware(
	Sentry.trpcMiddleware({
		attachRpcInput: true,
	}),
);

const middlewareWithSentry = sentryMiddleware.unstable_pipe(enforceUserIsAuthed);

export const rpaProcedure = publicProcedure.use(middlewareWithSentry);
