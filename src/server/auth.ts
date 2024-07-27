import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient, UserRole } from '@prisma/client';
import * as Sentry from '@sentry/nextjs';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';
import { type GetServerSidePropsContext } from 'next';
import { getServerSession, type DefaultSession, type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { Pages } from '../common/utils/showNavBars';
import { AuthErrorCode } from './authErrorCodes';
import { prisma } from './prisma';

declare module 'next-auth' {
	interface Session extends DefaultSession {
		user: DefaultSession['user'] & {
			id: string;
			email: string;
			organizationId: number;
			name: string;
			roles: UserRole[];
		};
	}

	interface User {
		id: string;
		email: string;
		organizationId: number;
		name: string;
		roles: UserRole[];
	}
}

export const authorizeFn = async (credentials: Record<'email' | 'password' | 'deviceId', string> | undefined) => {
	// eslint-disable-next-line @typescript-eslint/prefer-optional-chain
	if (!credentials || !credentials.email.includes('@')) return null;
	credentials.email = credentials.email.toLowerCase();

	const fetchedUser = await prisma.user.findUnique({
		where: {
			email: credentials.email,
		},
		include: {
			devices: { select: { id: true } },
		},
	});

	if (!fetchedUser) {
		throw new TRPCError({
			code: 'FORBIDDEN',
			message: AuthErrorCode.CREDENTIALS_MISMATCH,
		});
	}

	const { devices, ...user } = fetchedUser;

	const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);

	if (!isPasswordCorrect) {
		throw new TRPCError({
			code: 'FORBIDDEN',
			message: AuthErrorCode.CREDENTIALS_MISMATCH,
		});
	}

	const verifiedDevice = devices.find((device) => device.id === credentials.deviceId);

	if (!verifiedDevice) {
		throw new TRPCError({
			code: 'FORBIDDEN',
			message: AuthErrorCode.DEVICE_NOT_VERIFIED,
		});
	}

	return user;
};

export const authOptions: NextAuthOptions = {
	session: {
		strategy: 'jwt',
	},
	callbacks: {
		async session({ session, token }) {
			if (!token.sub) return session;

			const user = await getUser(token.sub);

			if (!user) return session;

			return {
				...session,
				user: {
					id: user.id,
					organizationId: user.organizationId,
					email: user.email,
					name: user.name,
					roles: user.roles,
				},
			};
		},
	},

	adapter: PrismaAdapter(prisma as PrismaClient),
	providers: [
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				email: { label: 'Email', type: 'text', placeholder: 'nurse@apricothealth.ai' },
				password: { label: 'Password', type: 'password' },
				deviceId: { label: 'Device Id', type: 'text' },
			},
			authorize: authorizeFn,
		}),
	],
	pages: {
		signIn: Pages.SIGN_IN,
	},
	events: {
		signIn({ user }) {
			Sentry.setUser({
				id: user.id,
				email: user.email,
			});
		},
		signOut() {
			Sentry.setUser(null);
		},
	},
};

export const getServerAuthSession = (ctx: {
	req: GetServerSidePropsContext['req'];
	res: GetServerSidePropsContext['res'];
}) => {
	return getServerSession(ctx.req, ctx.res, authOptions);
};

const getUser = async (sub: string) => {
	return await prisma.user.findUnique({
		where: {
			id: sub,
		},
	});
};
