import { faker } from '@faker-js/faker';
import { ConfigurationType, PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { defaultConfig } from './defaultOrgProfileSettings';

const prisma = new PrismaClient();

export const seedPassword = 'a pillow for troy';

export async function newLocation(name: string, organizationId: number) {
	const existingLocation = await prisma.location.findFirst({
		where: { name, organizationId },
	});

	if (existingLocation) {
		return existingLocation;
	}

	return prisma.location.create({
		data: {
			name,
			organizationId,
		},
	});
}

export async function createTestUser(
	organizationId: number,
	roles: UserRole[],
	email = 'test@apricothealth.ai',
	name = 'Test User',
	locationId?: number,
) {
	const existingTestUser = await prisma.user.findFirst({
		where: { email },
	});

	if (existingTestUser) return existingTestUser;

	const password = await bcrypt.hash(seedPassword, 10);
	return prisma.user.create({
		data: {
			name,
			organizationId,
			email,
			password,
			emailVerified: new Date(),
			roles,
			Locations: { connect: locationId ? [{ id: locationId }] : [] },
		},
		include: { Locations: true },
	});
}

export async function newOrganization(
	name: string,
	emailDomains: string[],
	configurationType: ConfigurationType = ConfigurationType.HomeCareHomeBase,
) {
	const existingOrg = await prisma.organization.findFirst({
		where: { name, emailDomains: { hasEvery: emailDomains } },
	});

	if (existingOrg) {
		return existingOrg;
	}

	const physicians = new Set(Array.from({ length: 10 }).map(() => faker.person.fullName()));

	return prisma.organization.create({
		data: {
			name,
			emailDomains,
			configurationType,
			AssociatedPhysicians: {
				createMany: {
					data: Array.from(physicians).map((name) => ({ name })),
				},
			},
			additionalDropdownConfiguration: defaultConfig,
		},
	});
}
