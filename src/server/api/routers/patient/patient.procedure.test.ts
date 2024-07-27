import { faker } from '@faker-js/faker';
import { expect, it } from '@jest/globals';
import { PatientStatus, ProviderType, ReferringPhysician, UserRole } from '@prisma/client';
import { generateFakePatient } from '~/common/testUtils/generateFakePatient';
import { createCompletePatient, createNewPatient, createWithQAPatient } from '~/common/testUtils/seedPatients';
import { prisma } from '~/server/prisma';
import { createTestUser } from '../../../../../prisma/util';
import { TestUser, createTestContext, createTestData } from '../../../../../test/util';
import { createCaller } from '../../root';
import { UpdatePatientInput } from './patient.inputs';

jest.mock('~/server/jobs');

describe('patientRouter', () => {
	let user: TestUser;

	beforeAll(async () => {
		user = await createTestData([UserRole.Nurse]);
	});

	it('should create a patient', async () => {
		const input = generateFakePatient(user.locationId ?? 0);
		const ctx = createTestContext({ user, roles: [UserRole.SuperAdmin] });

		const api = createCaller(ctx);

		const result = await api.patient.create(input);

		expect(result).toBeDefined();
		expect(result.id).toBeDefined();
		expect(result.firstName).toBe(input.firstName);
		expect(result.middleName).toBe(input.middleName);
		expect(result.lastName).toBe(input.lastName);
		expect(result.suffix).toBe(input.suffix);
		expect(result.address1).toBe(input.address1);
		expect(result.city).toBe(input.city);
		expect(result.state).toBe(input.state);
		expect(result.zip).toBe(input.zip);
		expect(result.phoneNumber).toBe(input.phoneNumber);
		expect(result.locationId).toBe(input.locationId);
		expect(result.serviceLocationType).toBe(input.serviceLocationType);
		expect(result.dateOfBirth).toEqual(input.dateOfBirth);
	});

	it('should update a patient', async () => {
		const input = generateFakePatient(user.locationId ?? 0);
		const ctx = createTestContext({ user, roles: [UserRole.SuperAdmin] });

		const api = createCaller(ctx);

		const createResult = await api.patient.create(input);

		const updateInput: UpdatePatientInput = {
			...createResult,
			id: createResult.id,
			firstName: 'Updated First Name',
			checkedResponse: {
				choice: {
					diagnoses: [
						{
							diagnosisCode: faker.lorem.word(),
							diagnosisDescription: faker.lorem.sentence(),
						},
					],
				},
			},
			PatientReferralSource: {
				facilityName: 'Updated Facility Name',
				facilityType: 'Clinic',
			},
			PatientAssociatedPhysicians: [
				{
					name: 'Updated First Name',
					phone: '1234567890',
					providerType: ProviderType.PrimaryCareProvider,
					referringPhysician: ReferringPhysician.NO,
				},
			],
		} as UpdatePatientInput;

		const updateResult = await api.patient.update(updateInput);

		expect(updateResult).toBeDefined();
		expect(updateResult.id).toBe(createResult.id);
		expect(updateResult.firstName).toBe(updateInput.firstName);
		expect(updateResult.primaryDiagnosisId).toBeDefined();
		expect(updateResult.patientReferralSourceId).toBeDefined();
	});

	it('should update a patient as QA User', async () => {
		const userOrg = await prisma.organization.findUniqueOrThrow({ where: { id: user.organizationId } });

		const qaUser = await createTestData([UserRole.QA]);
		const testPatient = await createWithQAPatient(user.id, userOrg, user.locationId ?? 0, qaUser.id);

		const updateInput: UpdatePatientInput = {
			...testPatient,
			id: testPatient.id,
			firstName: 'Updated First Name',
			checkedResponse: {
				choice: {
					diagnoses: [
						{
							diagnosisCode: faker.lorem.word(),
							diagnosisDescription: faker.lorem.sentence(),
						},
					],
				},
			},
			PatientReferralSource: {
				facilityName: 'Updated Facility Name',
				facilityType: 'Clinic',
			},
			PatientAssociatedPhysicians: [
				{
					name: 'Updated  Name',
					phone: '1234567890',
					providerType: ProviderType.PrimaryCareProvider,
					referringPhysician: ReferringPhysician.YES,
				},
			],
		} as UpdatePatientInput;

		const ctx = createTestContext({ user: qaUser, roles: [UserRole.QA] });
		const api = createCaller(ctx);

		const updateResult = await api.patient.update(updateInput);

		expect(updateResult).toBeDefined();
		expect(updateResult.id).toBe(testPatient.id);
		expect(updateResult.firstName).toBe(updateInput.firstName);
		expect(updateResult.primaryDiagnosisId).toBeDefined();
		expect(updateResult.patientReferralSourceId).toBeDefined();
	});

	it('should delete a patient', async () => {
		const input = generateFakePatient(user.locationId ?? 0);
		const ctx = createTestContext({ user, roles: [UserRole.SuperAdmin] });

		const api = createCaller(ctx);

		const createResult = await api.patient.create(input);

		const deleteResult = await api.patient.delete({ id: createResult.id });

		expect(deleteResult.id).toBe(createResult.id);

		await expect(api.patient.getById({ id: createResult.id, includes: { Location: true } })).rejects.toThrow();
	});

	it('should get schedule view', async () => {
		const ctx = createTestContext({ user, roles: [UserRole.SuperAdmin] });
		const api = createCaller(ctx);

		const org = await prisma.organization.findUnique({ where: { id: user.organizationId } });
		if (!org) throw new Error('Organization not found');

		const testPatients = await Promise.all(
			Array.from({ length: 5 }, () =>
				createNewPatient({
					userId: user.id,
					organization: org,
					locationId: user.locationId ?? 0,
					status: PatientStatus.NewPatient,
				}),
			),
		);

		const patients = await api.patient.getScheduleView();
		expect(patients).toBeDefined();
		expect(patients.length).toBeGreaterThan(0);
		expect(patients.every((patient) => patient.id)).toBe(true);
		expect(
			patients.every(
				({ status }) =>
					status === PatientStatus.NewPatient ||
					status === PatientStatus.SignoffNeeded ||
					status === PatientStatus.Incomplete,
			),
		).toBe(true);
		expect(patients.some((patient) => testPatients.some((testPatient) => testPatient.id === patient.id))).toBe(
			true,
		);
		expect(patients.every((patient) => patient.locationId === user.locationId)).toBe(true);
		expect(patients.every((patient) => patient.organizationId === user.organizationId)).toBe(true);
	});

	describe('infinite patients', () => {
		it('should get infinite patients', async () => {
			const ctx = createTestContext({ user, roles: [UserRole.SuperAdmin] });
			const api = createCaller(ctx);

			const org = await prisma.organization.findUnique({ where: { id: user.organizationId } });
			if (!org) throw new Error('Organization not found');

			const testPatients = await Promise.all(
				Array.from({ length: 5 }, () =>
					createNewPatient({
						userId: user.id,
						organization: org,
						locationId: user.locationId ?? 0,
						status: PatientStatus.NewPatient,
					}),
				),
			);

			const result = await api.patient.getInfinite({
				cursor: null,
			});
			const patients = result.items;
			expect(patients).toBeDefined();
			expect(patients).toBeInstanceOf(Array);
			expect(patients.length).toBeLessThanOrEqual(10);
			expect(patients.every((patient) => patient.id)).toBe(true);
			expect(patients.every((patient) => patient.locationId === user.locationId)).toBe(true);
			expect(patients.every((patient) => patient.organizationId === user.organizationId)).toBe(true);
		});

		it('should filter infinite patients by status', async () => {
			const ctx = createTestContext({ user, roles: [UserRole.SuperAdmin] });
			const api = createCaller(ctx);

			const org = await prisma.organization.findUnique({ where: { id: user.organizationId } });
			if (!org) throw new Error('Organization not found');

			const testPatients = await Promise.all(
				Array.from({ length: 5 }, () =>
					createCompletePatient({
						userId: user.id,
						organization: org,
						locationId: user.locationId ?? 0,
						dataEntryAssignedUserId: user.id,
					}),
				),
			);

			const result = await api.patient.getInfinite({
				cursor: null,
				filters: {
					ReadyForEMR: true,
				},
			});
			const patients = result.items;
			expect(patients).toBeDefined();
			expect(patients).toBeInstanceOf(Array);
			expect(patients.every((patient) => patient.status === PatientStatus.ReadyForEMR)).toBe(true);
			expect(patients.every((patient) => patient.locationId === user.locationId)).toBe(true);
			expect(patients.every((patient) => patient.organizationId === user.organizationId)).toBe(true);
		});

		it('should use limit', async () => {
			const ctx = createTestContext({ user, roles: [UserRole.SuperAdmin] });
			const api = createCaller(ctx);

			const org = await prisma.organization.findUnique({ where: { id: user.organizationId } });
			if (!org) throw new Error('Organization not found');

			const result = await api.patient.getInfinite({
				limit: 3,
				cursor: null,
			});

			expect(result.items.length).toBeLessThanOrEqual(3);
		});
	});

	it('should get patients by status', async () => {
		const ctx = createTestContext({ user, roles: [UserRole.SuperAdmin] });
		const api = createCaller(ctx);

		const org = await prisma.organization.findUnique({ where: { id: user.organizationId } });
		if (!org) throw new Error('Organization not found');

		const testPatients = await Promise.all(
			Array.from({ length: 5 }, () =>
				createCompletePatient({
					userId: user.id,
					organization: org,
					locationId: user.locationId ?? 0,
					dataEntryAssignedUserId: user.id,
				}),
			),
		);

		const result = await api.patient.getPatientsByStatus({
			status: PatientStatus.ReadyForEMR,
		});
		expect(result).toBeDefined();
		expect(result).toBeInstanceOf(Array);
		expect(result.length).toBeGreaterThan(0);
		expect(result.every((patient) => patient.status === PatientStatus.ReadyForEMR)).toBe(true);
		expect(result.every((patient) => patient.locationId === user.locationId)).toBe(true);
		expect(result.every((patient) => patient.organizationId === user.organizationId)).toBe(true);
		expect(result.some((patient) => testPatients.some((testPatient) => testPatient.id === patient.id))).toBe(true);
	});

	it('should get a patient by id', async () => {
		const ctx = createTestContext({ user, roles: [UserRole.SuperAdmin] });
		const api = createCaller(ctx);

		const org = await prisma.organization.findUnique({ where: { id: user.organizationId } });
		if (!org) throw new Error('Organization not found');

		const testPatient = await createNewPatient({
			userId: user.id,
			organization: org,
			locationId: user.locationId ?? 0,
			status: PatientStatus.NewPatient,
		});

		const result = await api.patient.getById({
			id: testPatient.id,
			includes: {
				Organization: true,
				PatientArtifacts: true,
				InterviewQuestion: true,
				NurseInterview: true,
				Location: true,
			},
		});
		expect(result).toBeDefined();
		expect(result.id).toBe(testPatient.id);
		expect(result.organizationId).toBe(testPatient.organizationId);
		expect(result.locationId).toBe(testPatient.locationId);
		expect(result.PatientArtifacts).toBeDefined();
		expect(result.InterviewQuestion).toBeDefined();
		expect(result.NurseInterview).toBeDefined();
		expect(result.Location).toBeDefined();
	});

	describe('update patient status', () => {
		it('should update patient status when status allows for it', async () => {
			const ctx = createTestContext({ user, roles: [UserRole.QaManager] });
			const api = createCaller(ctx);

			const org = await prisma.organization.findFirstOrThrow({ where: { id: { not: user.organizationId } } });

			const testPatient = await createNewPatient({
				userId: user.id,
				organization: org,
				locationId: user.locationId ?? 0,
				status: PatientStatus.WithQA,
			});

			const result = await api.patient.updatePatientStatus({
				patientId: testPatient.id,
				status: PatientStatus.ReadyForEMR,
				nurseSignOffName: user.name,
			});
			expect(result).toBeDefined();
			expect(result.id).toBe(testPatient.id);
			expect(result.status).toBe(PatientStatus.ReadyForEMR);
		});

		it('should fail to update patient status when status does not allow for it', async () => {
			const ctx = createTestContext({ user, roles: [UserRole.QaManager] });
			const api = createCaller(ctx);

			const org = await prisma.organization.findFirstOrThrow({ where: { id: { not: user.organizationId } } });

			const testPatient = await createNewPatient({
				userId: user.id,
				organization: org,
				locationId: user.locationId ?? 0,
				status: PatientStatus.NewPatient,
			});

			await expect(
				api.patient.updatePatientStatus({
					patientId: testPatient.id,
					status: PatientStatus.ReadyForEMR,
					nurseSignOffName: user.name,
				}),
			).rejects.toThrowError();
		});
	});
	it('should manually change patient status', async () => {
		const ctx = createTestContext({ user, roles: [UserRole.SuperAdmin] });
		const api = createCaller(ctx);

		const org = await prisma.organization.findUnique({ where: { id: user.organizationId } });
		if (!org) throw new Error('Organization not found');

		const testPatient = await createNewPatient({
			userId: user.id,
			organization: org,
			locationId: user.locationId ?? 0,
			status: PatientStatus.NewPatient,
		});

		const result = await api.patient.manuallyChangePatientStatus({
			patientId: testPatient.id,
			status: PatientStatus.ReadyForEMR,
			nurseSignOffName: user.name,
		});
		expect(result).toBeDefined();
		expect(result.id).toBe(testPatient.id);
		expect(result.status).toBe(PatientStatus.ReadyForEMR);
	});

	describe('update patient status to complete', () => {
		it('should update patient status to complete if in allowed status', async () => {
			const ctx = createTestContext({ user, roles: [UserRole.DataEntryManager] });
			const api = createCaller(ctx);
			const org = await prisma.organization.findFirstOrThrow({ where: { id: { not: user.organizationId } } });
			const testPatient = await createNewPatient({
				userId: user.id,
				organization: org,
				locationId: user.locationId ?? 0,
				status: PatientStatus.ReadyForEMR,
			});

			const result = await api.patient.setPatientStatusAsComplete({
				patientId: testPatient.id,
			});
			expect(result).toBeDefined();
			expect(result.id).toBe(testPatient.id);
			expect(result.status).toBe(PatientStatus.Complete);
		});

		it('should fail to update patient status to complete if not in allowed status', async () => {
			const ctx = createTestContext({ user, roles: [UserRole.DataEntryManager] });
			const api = createCaller(ctx);
			const org = await prisma.organization.findFirstOrThrow({ where: { id: { not: user.organizationId } } });
			const testPatient = await createNewPatient({
				userId: user.id,
				organization: org,
				locationId: user.locationId ?? 0,
				status: PatientStatus.NewPatient,
			});

			await expect(
				api.patient.setPatientStatusAsComplete({
					patientId: testPatient.id,
				}),
			).rejects.toThrowError();
		});
	});

	it('should set patient status to NonAdmit', async () => {
		const ctx = createTestContext({ user, roles: [UserRole.Nurse] });
		const api = createCaller(ctx);

		const org = await prisma.organization.findUnique({ where: { id: user.organizationId } });
		if (!org) throw new Error('Organization not found');

		const testPatient = await createNewPatient({
			userId: user.id,
			organization: org,
			locationId: user.locationId ?? 0,
			status: PatientStatus.NewPatient,
		});

		const result = await api.patient.setPatientStatusAsNonAdmit({
			patientId: testPatient.id,
		});

		expect(result).toBeDefined();
		expect(result.id).toBe(testPatient.id);
		expect(result.status).toBe(PatientStatus.NonAdmit);
	});

	it('should confirmAssessmentSectionByPatientId', async () => {
		const ctx = createTestContext({ user, roles: [UserRole.Nurse] });
		const api = createCaller(ctx);

		const org = await prisma.organization.findUnique({ where: { id: user.organizationId } });
		if (!org) throw new Error('Organization not found');

		const testPatient = await createNewPatient({
			userId: user.id,
			organization: org,
			locationId: user.locationId ?? 0,
			status: PatientStatus.NewPatient,
		});

		const result = await api.patient.confirmAssessmentSectionByPatientId({
			patientId: testPatient.id,
			section: 'section',
		});

		expect(result).toBeDefined();
		expect(result?.id).toBeDefined();
		expect(result?.patientId).toBe(testPatient.id);
		expect(result?.section).toBe('section');
	});

	it('can assign QAUser to patient', async () => {
		const ctx = createTestContext({ user, roles: [UserRole.QaManager] });
		const api = createCaller(ctx);

		const org = await prisma.organization.findUnique({ where: { id: user.organizationId } });
		if (!org) throw new Error('Organization not found');

		// const qaUser = await createTestData([UserRole.QA]);
		const qaUserInfo = {
			organizationId: 1,
			email: faker.internet.userName().toLowerCase() + '@apricothealth.ai',
			name: faker.person.fullName(),
			roles: [UserRole.QA],
		};
		const qaUser = await createTestUser(
			user.organizationId,
			qaUserInfo.roles,
			qaUserInfo.email,
			qaUserInfo.name,
			user.locationId,
		);

		const testPatient = await createCompletePatient({
			userId: user.id,
			organization: org,
			locationId: user.locationId ?? 0,
			dataEntryAssignedUserId: user.id,
		});

		const result = await api.patient.assignQaUserToPatient({
			patientId: testPatient.id,
			userId: qaUser.id,
		});

		expect(result).toBeDefined();
		expect(result.id).toBe(testPatient.id);
		expect(result.qaAssignedUserId).toBe(qaUser.id);
	});

	it('can assign DataEntryUser to patient', async () => {
		const ctx = createTestContext({ user, roles: [UserRole.DataEntryManager] });
		const api = createCaller(ctx);

		const org = await prisma.organization.findUnique({ where: { id: user.organizationId } });
		if (!org) throw new Error('Organization not found');

		const dataEntryUserInfo = {
			organizationId: 1,
			email: faker.internet.userName().toLowerCase() + '@apricothealth.ai',
			name: faker.person.fullName(),
			roles: [UserRole.DataEntry],
		};
		const dataEntryUser = await createTestUser(
			user.organizationId,
			dataEntryUserInfo.roles,
			dataEntryUserInfo.email,
			dataEntryUserInfo.name,
			user.locationId,
		);

		const testPatient = await createCompletePatient({
			userId: user.id,
			organization: org,
			locationId: user.locationId ?? 0,
			dataEntryAssignedUserId: user.id,
		});

		const result = await api.patient.assignDataEntryUserToPatient({
			patientId: testPatient.id,
			userId: dataEntryUser.id,
		});

		expect(result).toBeDefined();
		expect(result.id).toBe(testPatient.id);
		expect(result.dataEntryAssignedUserId).toBe(dataEntryUser.id);
	});

	it('can reset patient', async () => {
		const ctx = createTestContext({ user, roles: [UserRole.SuperAdmin] });
		const api = createCaller(ctx);

		const org = await prisma.organization.findUnique({ where: { id: user.organizationId } });
		if (!org) throw new Error('Organization not found');

		const testPatient = await createCompletePatient({
			userId: user.id,
			organization: org,
			locationId: user.locationId ?? 0,
			dataEntryAssignedUserId: user.id,
		});

		const result = await api.patient.resetPatient({
			patientId: testPatient.id,
		});

		expect(result).toBeDefined();
		expect(result?.id).toBe(testPatient.id);
		expect(result?.status).toBe(PatientStatus.NewPatient);
	});
});
