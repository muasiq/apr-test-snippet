import { UserRole } from '@prisma/client';
import * as Sentry from '@sentry/nextjs';
import { TRPCError, initTRPC, type inferAsyncReturnType } from '@trpc/server';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import { type Session } from 'next-auth';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { getServerAuthSession } from '~/server/auth';
import {
	DataAccessPermissions,
	UserActionPermissions,
	getDataAccessLevelForPermission,
	hasActionPermission,
} from '../../common/utils/permissions';
import { prisma } from '../prisma';

/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */

interface CreateContextOptions {
	session: Session | null;
	rawActiveOrganizationId: string | undefined;
}

/**
 * This helper generates the "internals" for a tRPC context. If you need to use it, you can export
 * it from here.
 *
 * Examples of things you may need it for:
 * - testing, so we don't have to mock Next.js' req/res
 * - tRPC's `createSSGHelpers`, where we don't have req/res
 *
 * @see https://create.t3.gg/en/usage/trpc#-serverapitrpcts
 */
export const createInnerTRPCContext = (opts: CreateContextOptions) => {
	return {
		session: opts.session,
		db: prisma,
		rawActiveOrganizationId: opts.rawActiveOrganizationId,
	};
};

/**
 * This is the actual context you will use in your router. It will be used to process every request
 * that goes through your tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */
export const createTRPCContext = async (opts: CreateNextContextOptions) => {
	const { req, res } = opts;

	const rawActiveOrganizationId = req.headers['active-organization-id'] as string | undefined;

	const session = await getServerAuthSession({ req, res });

	return createInnerTRPCContext({
		session,
		rawActiveOrganizationId,
	});
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */

const t = initTRPC.context<typeof createTRPCContext>().create({
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

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

export const createCallerFactory = t.createCallerFactory;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure;
export type TRPCContext = inferAsyncReturnType<typeof createTRPCContext>;

/** Reusable middleware that enforces users are logged in before running the procedure. */
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
	if (!ctx.session?.user) {
		throw new TRPCError({ code: 'UNAUTHORIZED' });
	}

	Sentry.setUser({ id: ctx.session.user.id, email: ctx.session.user.email });

	return next({
		ctx: {
			// infers the `session` as non-nullable
			session: { ...ctx.session, user: ctx.session.user },
		},
	});
});

const sentryMiddleware = t.middleware(
	Sentry.trpcMiddleware({
		attachRpcInput: true,
	}),
);

const middlewareWithSentry = sentryMiddleware.unstable_pipe(enforceUserIsAuthed);

export type ProtectedTRPCContext = TRPCContext & {
	session: NonNullable<TRPCContext['session']>;
};

export type PermissionedTRPCContext = ProtectedTRPCContext & {
	dataAccessLevel: DataAccessPermissions;
	activeOrganizationId: number;
};

const protectedProcedure = t.procedure.use(middlewareWithSentry);

export const permissionProtectedProcedure = (userActionPermission: UserActionPermissions) => {
	return protectedProcedure.use(({ ctx, next }) => {
		const user = ctx.session?.user;
		const userRoles = user?.roles;
		const accessLevel = getDataAccessLevelForPermission(userActionPermission, userRoles);
		if (!accessLevel) {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: `Requires ${userActionPermission} permission to access this endpoint`,
			});
		}

		const activeOrganizationId = resolveActiveOrganizationId(
			userRoles,
			ctx.rawActiveOrganizationId,
			user.organizationId,
		);
		return next({ ctx: { ...ctx, dataAccessLevel: accessLevel, activeOrganizationId } });
	});
};

function resolveActiveOrganizationId(
	userRoles: UserRole[],
	rawActiveOrganizationId: string | undefined,
	userOrgId: number,
): number {
	const canSetActiveOrganizationId = hasActionPermission(UserActionPermissions.SET_ACTIVE_ORG_ID, userRoles);

	if (canSetActiveOrganizationId) {
		const parsed = parseInt(rawActiveOrganizationId ?? '');
		if (!isNaN(parsed)) {
			return parsed;
		}
		return userOrgId;
	}

	return userOrgId;
}
