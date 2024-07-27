import { expect, it } from '@jest/globals';
import { UserRole } from '@prisma/client';
import { TestUser, createTestContext, createTestDataForExistingUser } from '../../../../../test/util';
import { prisma } from '../../../prisma';
import { createCaller } from '../../root';

describe('Configuration Router', () => {
	let user: TestUser;

	beforeAll(async () => {
		const existingUser = await prisma.user.findFirst({
			where: {
				CaseManagedPatients: { some: {} },
				Locations: { some: {} },
			},
			include: { Locations: true },
		});
		const locationId = existingUser?.Locations[0]?.id;
		if (!locationId) throw new Error('No existing user found');
		user = await createTestDataForExistingUser(existingUser, locationId);
	});

	describe('getConfigurationForPatient', () => {
		it('should return the configuration for the requested patient id', async () => {
			const ctx = createTestContext({ user, roles: [UserRole.OrgAdmin] });
			const api = createCaller(ctx);

			const testPatient = await prisma.patient.findFirst({ where: { organizationId: user.organizationId } });

			if (!testPatient) throw new Error('No test patient found');

			const configuration = await api.configuration.getConfigurationForPatient({ patientId: testPatient.id });
			expect(configuration).toBeInstanceOf(Object);
			expect(configuration.allQuestions.length).toBeGreaterThan(0);
			expect(configuration.qaConfig.length).toBeGreaterThan(0);
			expect(configuration.backOfficeCompletedConfig.length).toBeGreaterThan(0);
		});
	});
});
