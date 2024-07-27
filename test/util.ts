import { faker } from '@faker-js/faker';
import { User, UserRole } from '@prisma/client';
import { type Session } from 'next-auth';
import { createInnerTRPCContext } from '~/server/api/trpc';
import { prisma } from '~/server/prisma';
import { createTestUser, newLocation, newOrganization } from '../prisma/util';
import { addConfigurationToDBForOrgId } from '../src/assessments/scripts/addConfigurationToDB';

export type TestUser = {
	id: string;
	organizationId: number;
	email: string;
	name: string;
	roles: UserRole[];
	tokenInfo?: { token: string; expires: string };
	locationId?: number;
};

export const createTestData = async (roles: UserRole[]) => {
	const dbOrganization = await newOrganization(faker.company.name(), ['apricothealth.ai']);
	await addConfigurationToDBForOrgId(dbOrganization.id);
	const dbLocation = await newLocation('Test Location', dbOrganization.id);

	const userInfo = {
		organizationId: 1,
		email: faker.internet.userName().toLowerCase() + '@apricothealth.ai',
		name: faker.person.fullName(),
		roles,
	};
	const dbUser = await createTestUser(dbOrganization.id, roles, userInfo.email, userInfo.name, dbLocation.id);

	const { token, expires } = await createToken(userInfo.email);

	const { id, organizationId, email, name } = dbUser;
	return { id, organizationId, email, name, roles, locationId: dbLocation.id, tokenInfo: { token, expires } };
};

export const createTestDataForExistingUser = async (user: User, locationId: number) => {
	const { token, expires } = await createToken(user.email);

	const { id, organizationId, email, name } = user;
	return { id, organizationId, email, name, roles: user.roles, locationId, tokenInfo: { token, expires } };
};

export const createToken = async (email: string) => {
	const tokenData = {
		identifier: email,
		token: faker.string.alphanumeric(10),
		expires: faker.date.soon({ days: 1 }),
	};
	const { token, expires } = await prisma.verificationToken.upsert({
		create: tokenData,
		update: tokenData,
		where: { identifier: tokenData.identifier },
	});

	return { token, expires: expires.toISOString() };
};

export const createTestContext = ({
	user,
	roles,
	activeOrgIdOverride,
}: {
	user: {
		id: string;
		organizationId: number;
		email: string;
		name: string;
		roles: UserRole[];
		tokenInfo?: { token: string; expires: string };
	};
	roles?: UserRole[];
	activeOrgIdOverride?: string;
}) => {
	const session: Session = {
		user: {
			...user,
			roles: roles ?? [UserRole.Nurse],
		},
		expires: user.tokenInfo?.expires ?? new Date().toISOString(),
	};

	return createInnerTRPCContext({
		session,
		rawActiveOrganizationId: activeOrgIdOverride ?? user.organizationId.toString(),
	});
};
