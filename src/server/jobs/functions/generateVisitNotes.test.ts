import { it } from '@jest/globals';
import { Organization, PatientArtifactTag, UserRole } from '@prisma/client';
import { createCompletePatient, createNewPatient } from '~/common/testUtils/seedPatients';
import { prisma } from '~/server/prisma';
import { TestUser, createTestData } from '../../../../test/util';

import { expect } from '@jest/globals';
import { EVENT } from '../events';
import { handler } from './generateVisitNotes';

jest.mock('~/server/jobs');
jest.mock('~/assessments/apricot/visit-note', () => ({
	getVisitNotePdfBuffer: () => Buffer.from('test'),
}));

describe('generateVisitNote', () => {
	let user: TestUser;
	let organization: Organization;

	beforeAll(async () => {
		user = await createTestData([UserRole.Nurse]);
		organization = await prisma.organization.findUniqueOrThrow({ where: { id: user.organizationId } });
	});

	it('should save pdf files and set patientArtifacts when patient is set to ready for emr', async () => {
		const patient = await createCompletePatient({
			userId: user.id,
			organization,
			locationId: user.locationId ?? 0,
			dataEntryAssignedUserId: user.id,
		});

		let visitNoteArtifacts = await prisma.patientArtifact.findMany({
			where: { patientId: patient.id, tagName: PatientArtifactTag.VisitNote },
		});
		expect(visitNoteArtifacts.length).toEqual(0);

		const res = await handler({
			event: {
				name: EVENT.patientReadyForEMR,
				data: { patientId: patient.id },
			},
		} as never);

		expect(res.status).toEqual('success');

		visitNoteArtifacts = await prisma.patientArtifact.findMany({
			where: { patientId: patient.id, tagName: PatientArtifactTag.VisitNote },
		});
		expect(visitNoteArtifacts.length).toEqual(2);
	});

	it('should throw if patient status is not past signoff', async () => {
		const patient = await createNewPatient({
			userId: user.id,
			organization,
			locationId: user.locationId ?? 0,
		});

		await expect(
			handler({
				event: {
					name: EVENT.patientVisitNoteRequested,
					data: { patientId: patient.id },
				},
			} as never),
		).rejects.toThrow();
	});
});
