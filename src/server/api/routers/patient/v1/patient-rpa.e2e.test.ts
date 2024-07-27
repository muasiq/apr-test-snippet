import { faker } from '@faker-js/faker';
import { expect, it } from '@jest/globals';
import {
	AssessmentAnswer,
	AssessmentAnswerIntegrationStatus,
	LoginProfile,
	Patient,
	PatientArtifact,
	PatientStatus,
	UserRole,
} from '@prisma/client';
import { sample } from 'lodash';
import request from 'supertest';
import { testSkilledNursingVisitFrequency } from '~/common/testUtils/generateFakeAnswers';
import { createCompletePatient } from '~/common/testUtils/seedPatients';
import { env } from '~/env.mjs';
import { prisma } from '~/server/prisma';
import { RPAArtifact, RPAPatient } from '~/server/rpa/routers/rpa.service';
import { TestUser, createTestData } from '../../../../../../test/util';
import { CustomAssessmentNumber } from '../../../../../assessments/apricot/custom';
import { AssessmentSkilledNursingVisitFrequencies, CheckedResponseUnion } from '../../assessment/assessment.inputs';
import { RPASkilledNursingVisitFrequencyResponse } from './custom-form-responses/skilledNursingVisitFrequency';
import { getGeneratedBlankAnswers } from './patient-rpa.utils';

type PatientWithAssessments = Patient & { AssessmentAnswer: AssessmentAnswer[] };
type PatientWithArtifacts = Patient & { PatientArtifacts: PatientArtifact[]; AssessmentAnswer: AssessmentAnswer[] };

jest.setTimeout(10_000);

export async function createTestEMRPatients({ user, count = 1 }: { user: TestUser; count?: number }) {
	const org = await prisma.organization.findUnique({ where: { id: user.organizationId } });
	if (!org) throw new Error('Organization not found');
	await prisma.loginProfile.create({
		data: {
			firstName: faker.person.firstName(),
			lastName: faker.person.lastName(),
			hchbUsername: faker.internet.userName(),
			hchbPassword: faker.internet.password(),
			pointcareUserId: faker.number.int().toString(),
			pointcarePassword: faker.internet.password(),
			organizationId: org.id,
		},
	});
	await prisma.loginProfile.create({
		data: {
			firstName: faker.person.firstName(),
			lastName: faker.person.lastName(),
			hchbUsername: faker.internet.userName(),
			hchbPassword: faker.internet.password(),
			pointcareUserId: faker.number.int().toString(),
			pointcarePassword: faker.internet.password(),
			organizationId: org.id,
			mainLogin: true,
		},
	});
	const existingAssessment = await prisma.assessmentAnswer.findFirst({});
	if (!existingAssessment) throw new Error('Assessment not found');
	try {
		const testPatients = await Promise.all(
			Array.from({ length: count }).map(async () => {
				const testPatient = await createCompletePatient({
					userId: user.id,
					organization: org,
					locationId: user.locationId ?? 0,
					dataEntryAssignedUserId: user.id,
				});

				const { id, ...rest } = existingAssessment;

				const assessmentClone = {
					...rest,
					patientId: testPatient.id,
					checkedById: user.id,
				} as AssessmentAnswer;

				const dbAssessment = await prisma.assessmentAnswer.upsert({
					where: {
						patientId_assessmentNumber: {
							patientId: testPatient.id,
							assessmentNumber: assessmentClone.assessmentNumber,
						},
					},
					create: {
						...assessmentClone,
						generatedResponse: assessmentClone.generatedResponse ?? faker.lorem.sentence(),
						checkedResponse: assessmentClone.checkedResponse ?? faker.lorem.sentence(),
					},
					update: {
						...assessmentClone,
						generatedResponse: assessmentClone.generatedResponse ?? faker.lorem.sentence(),
						checkedResponse: assessmentClone.checkedResponse ?? faker.lorem.sentence(),
					},
				});

				return { ...testPatient, AssessmentAnswer: [dbAssessment] };
			}),
		);
		return testPatients;
	} catch (e) {
		console.error('Error creating test patients', e);
		throw e;
	}
}

export const createTestEMRData = async () => {
	const user = await createTestData([UserRole.Nurse]);
	const testPatients = await createTestEMRPatients({ user });
	return { testPatients, user };
};

const baseUrl = env.NEXTAUTH_URL;

describe('Patient RPA', () => {
	describe('GET /api/v2/patient/rpa', () => {
		let testPatients: PatientWithAssessments[];
		beforeAll(async () => {
			const { RPA_ACCESS_KEY, RPA_SECRET_KEY } = env;
			expect(RPA_ACCESS_KEY).toBeDefined();
			expect(RPA_SECRET_KEY).toBeDefined();
			({ testPatients } = await createTestEMRData());
		});

		it('should return HTTP 200 OK, with array of ReadyForEMR patients', async () => {
			const response = await request(baseUrl)
				.get('/api/v2/patients')
				.set('access-key', `${env.RPA_ACCESS_KEY}`)
				.set('secret-key', `${env.RPA_SECRET_KEY}`)
				.expect(200);

			const patients: RPAPatient[] = response.body as RPAPatient[];
			expect(patients).toBeInstanceOf(Array);
			expect(patients.length).toBeGreaterThanOrEqual(2);
			expect(patients.every((p) => p.status === PatientStatus.ReadyForEMR)).toBe(true);
			expect(patients.every((p) => p.episodeID)).toBe(true);
			expect(patients.every((p) => p.workerName && p.workerName.length > 1)).toBe(true);
			expect(patients.some((p) => p.id === testPatients[0]!.id)).toBe(true);

			const samplePatient = sample(patients);
			expect(samplePatient?.status).toBe(PatientStatus.ReadyForEMR);
			expect(samplePatient?.episodeID).toBeDefined();
			expect(samplePatient?.id).toBeDefined();
			expect(samplePatient?.firstName).toBeDefined();
			expect(samplePatient?.lastName).toBeDefined();
			expect(samplePatient?.configurationType).toBeDefined();
		});

		it('should return HTTP 401 Unauthorized, when access-key is missing', async () => {
			const response = await request(baseUrl)
				.get('/api/v2/patients')
				.set('secret-key', `${env.RPA_SECRET_KEY}`)
				.expect(401);

			expect(response.body).toEqual({ code: 'UNAUTHORIZED', message: 'Unauthorized' });
		});

		it('should return HTTP 401 Unauthorized, when secret-key is missing', async () => {
			const response = await request(baseUrl)
				.get('/api/v2/patients')
				.set('access-key', `${env.RPA_ACCESS_KEY}`)
				.expect(401);

			expect(response.body).toEqual({ code: 'UNAUTHORIZED', message: 'Unauthorized' });
		});

		it('should return HTTP 401 Unauthorized, when access-key is incorrect', async () => {
			const response = await request(baseUrl)
				.get('/api/v2/patients')
				.set('access-key', 'incorrect-access-key')
				.set('secret-key', `${env.RPA_SECRET_KEY}`)
				.expect(401);

			expect(response.body).toEqual({ code: 'UNAUTHORIZED', message: 'Unauthorized' });
		});

		it('should return HTTP 401 Unauthorized, when secret-key is incorrect', async () => {
			const response = await request(baseUrl)
				.get('/api/v2/patients')
				.set('access-key', `${env.RPA_ACCESS_KEY}`)
				.set('secret-key', 'incorrect-secret-key')
				.expect(401);

			expect(response.body).toEqual({ code: 'UNAUTHORIZED', message: 'Unauthorized' });
		});
	});

	describe('GET /api/v2/patients/[patientId]', () => {
		let testPatients: Patient[];
		beforeAll(async () => {
			const { RPA_ACCESS_KEY, RPA_SECRET_KEY } = env;
			expect(RPA_ACCESS_KEY).toBeDefined();
			expect(RPA_SECRET_KEY).toBeDefined();
			({ testPatients } = await createTestEMRData());
		});

		it('should return HTTP 200 OK, with a single ReadyForEMR patient', async () => {
			const patientToFind = sample(testPatients);
			const response = await request(baseUrl)
				.get(`/api/v2/patients/${patientToFind?.id}`)
				.set('access-key', `${env.RPA_ACCESS_KEY}`)
				.set('secret-key', `${env.RPA_SECRET_KEY}`)
				.expect(200);

			const patient: RPAPatient = response.body as RPAPatient;
			expect(patient).toBeDefined();
			expect(patient.status).toBe(PatientStatus.ReadyForEMR);
			expect(patient.episodeID).toBe(patientToFind?.EMRIdentifier);
			expect(patient.id).toBe(patientToFind?.id);
			expect(patient.firstName).toBe(patientToFind?.firstName);
			expect(patient.lastName).toBe(patientToFind?.lastName);
			expect(patient.configurationType).toBe(patientToFind?.configurationType);
			expect(patient.assessmentAnswers.length).toBeGreaterThan(0);
			expect(patient.artifacts.length).toBeGreaterThan(0);
			expect(patient.artifacts.some((a) => a.hchbLocation === 'Wounds')).toBe(true);
			expect(patient.artifacts.every((a) => a.url.length > 0)).toBe(true);
		});

		it('should return skilled nursing visit frequencies', async () => {
			const patientToFind = sample(testPatients);
			if (!patientToFind) throw new Error('Patient not found');
			const checkedResponse = {
				choice: {
					skilledNursingVisitFrequencies: [testSkilledNursingVisitFrequency],
				},
			};

			await prisma.assessmentAnswer.upsert({
				where: {
					patientId_assessmentNumber: {
						patientId: patientToFind.id,
						assessmentNumber: CustomAssessmentNumber.SKILLED_NURSING_VISIT_FREQUENCIES,
					},
				},
				create: {
					assessmentNumber: CustomAssessmentNumber.SKILLED_NURSING_VISIT_FREQUENCIES,
					patientId: patientToFind.id,
					checkedResponse,
				},
				update: {
					checkedResponse,
				},
			});
			const response = await request(baseUrl)
				.get(`/api/v2/patients/${patientToFind?.id}`)
				.set('access-key', `${env.RPA_ACCESS_KEY}`)
				.set('secret-key', `${env.RPA_SECRET_KEY}`)
				.expect(200);

			const patient: RPAPatient = response.body as RPAPatient;
			expect(patient.assessmentAnswers.length).toBeGreaterThan(0);
			const skilledNursingVisitFrequencies = patient.assessmentAnswers.find(
				(a) => a.assessmentNumber === CustomAssessmentNumber.SKILLED_NURSING_VISIT_FREQUENCIES.toString(),
			);
			expect(skilledNursingVisitFrequencies).toBeDefined();
			const choice = (skilledNursingVisitFrequencies?.checkedResponse as AssessmentSkilledNursingVisitFrequencies)
				?.choice as unknown as RPASkilledNursingVisitFrequencyResponse;
			const dates = choice?.skilledNursingVisitFrequencies?.dates;
			expect(dates?.length).toBeGreaterThan(0);
			expect(dates?.every((d) => expect(d.Date).toEqual(expect.any(String))));
		});

		it('should return top level answers with all follow ups', async () => {
			const patientToFind = sample(testPatients);
			if (!patientToFind) throw new Error('Patient not found');
			const checkedResponse = {
				choice: ['Oxygen therapy', 'Chemotherapy'],
			};

			await prisma.assessmentAnswer.upsert({
				where: {
					patientId_assessmentNumber: {
						patientId: patientToFind.id,
						assessmentNumber: 'O0110_A',
					},
				},
				create: {
					assessmentNumber: 'O0110_A',
					checkedResponse,
					patientId: patientToFind.id,
				},
				update: {
					checkedResponse,
				},
			});

			const followUp1CheckedResponse = {
				choice: ['Chemotherapy - ORAL'],
			};

			await prisma.assessmentAnswer.upsert({
				where: {
					patientId_assessmentNumber: {
						patientId: patientToFind.id,
						assessmentNumber: 'O0110_A_A1',
					},
				},
				create: {
					assessmentNumber: 'O0110_A_A1',
					checkedResponse: followUp1CheckedResponse,
					patientId: patientToFind.id,
				},
				update: {
					checkedResponse: followUp1CheckedResponse,
				},
			});

			const followUp2CheckedResponse = {
				choice: ['Oxygen therapy - Intermittent'],
			};

			await prisma.assessmentAnswer.upsert({
				where: {
					patientId_assessmentNumber: {
						patientId: patientToFind.id,
						assessmentNumber: 'O0110_A_C1',
					},
				},
				create: {
					assessmentNumber: 'O0110_A_C1',
					checkedResponse: followUp2CheckedResponse,
					patientId: patientToFind.id,
				},
				update: {
					checkedResponse: followUp2CheckedResponse,
				},
			});

			const response = await request(baseUrl)
				.get(`/api/v2/patients/${patientToFind?.id}`)
				.set('access-key', `${env.RPA_ACCESS_KEY}`)
				.set('secret-key', `${env.RPA_SECRET_KEY}`)
				.expect(200);

			const patient: RPAPatient = response.body as RPAPatient;
			expect(patient.assessmentAnswers.length).toBeGreaterThan(0);
			const answersWithFollowUps = patient.assessmentAnswers.filter((a) =>
				['O0110_A', 'O0110_A_A1', 'O0110_A_C1'].includes(a.assessmentNumber),
			);
			expect(answersWithFollowUps).toHaveLength(3);
			const topLevelAnswer = answersWithFollowUps.find((a) => a.assessmentNumber === 'O0110_A');
			expect((topLevelAnswer?.checkedResponse as CheckedResponseUnion).choice).toEqual([
				'C1. OXYGEN',
				'A1. CHEMOTHERAPY',
			]);
			const firstFollowUp = answersWithFollowUps.find((a) => a.assessmentNumber === 'O0110_A_A1');
			expect((firstFollowUp?.checkedResponse as CheckedResponseUnion).choice).toEqual(['A3. ORAL']);
			const secondFollowUp = answersWithFollowUps.find((a) => a.assessmentNumber === 'O0110_A_C1');
			expect((secondFollowUp?.checkedResponse as CheckedResponseUnion).choice).toEqual(['C3. INTERMITTENT']);
		});

		it('should return HTTP 404 Not Found, when patient does not exist', async () => {
			const response = await request(baseUrl)
				.get(`/api/v2/patients/999999`)
				.set('access-key', `${env.RPA_ACCESS_KEY}`)
				.set('secret-key', `${env.RPA_SECRET_KEY}`)
				.expect(404);

			expect(response.body).toEqual({ code: 'NOT_FOUND', message: 'Patient not found' });
		});
	});

	describe('POST /api/v2/patients/[patientId]/[assessmentNumber]', () => {
		let testPatients: PatientWithAssessments[];
		beforeAll(async () => {
			const { RPA_ACCESS_KEY, RPA_SECRET_KEY } = env;
			expect(RPA_ACCESS_KEY).toBeDefined();
			expect(RPA_SECRET_KEY).toBeDefined();
			({ testPatients } = await createTestEMRData());
		});

		it('should update RpaPatientAssessmentAnswer', async () => {
			const sampleUpdatePatient = sample(testPatients);
			const existingAssessment = await prisma.assessmentAnswer.findFirst({});
			expect(existingAssessment).toBeDefined();

			const assessmentToUpdate = sampleUpdatePatient?.AssessmentAnswer[0];

			const assessmentAnswerUpdate = {
				assessmentAnswer: assessmentToUpdate,
				assessmentNumber: assessmentToUpdate?.assessmentNumber ?? '1',
				status: AssessmentAnswerIntegrationStatus.Completed,
				message: faker.lorem.sentence(),
			};

			const response = await request(baseUrl)
				.post(`/api/v2/patients/${sampleUpdatePatient?.id}/${assessmentAnswerUpdate.assessmentNumber}`)
				.set('access-key', `${env.RPA_ACCESS_KEY}`)
				.set('secret-key', `${env.RPA_SECRET_KEY}`)
				.send(assessmentAnswerUpdate)
				.expect(200);

			const updatedAssessment = response.body as AssessmentAnswer;
			expect(updatedAssessment).toBeDefined();
			expect(updatedAssessment.assessmentNumber).toBe(assessmentAnswerUpdate.assessmentNumber);
			expect(updatedAssessment.integrationStatus).toBe(assessmentAnswerUpdate.status);
			expect(updatedAssessment.integrationMessage).toBe(assessmentAnswerUpdate.message);
		});

		it('should update AutoGenerated Assessment Answers', async () => {
			const sampleUpdatePatient = sample(testPatients)!;
			const assessmentToUpdate = sample(getGeneratedBlankAnswers())!;
			expect(assessmentToUpdate).toBeDefined();
			expect(sampleUpdatePatient).toBeDefined();
			const existingAssessment = await prisma.assessmentAnswer.findFirst({
				where: { patientId: sampleUpdatePatient.id, assessmentNumber: assessmentToUpdate.assessmentNumber },
			});
			expect(existingAssessment).toBe(null);

			const assessmentAnswerUpdate = {
				status: AssessmentAnswerIntegrationStatus.Completed,
				message: faker.lorem.sentence(),
			};

			const response = await request(baseUrl)
				.post(`/api/v2/patients/${sampleUpdatePatient.id}/${assessmentToUpdate.assessmentNumber}`)
				.set('access-key', `${env.RPA_ACCESS_KEY}`)
				.set('secret-key', `${env.RPA_SECRET_KEY}`)
				.send(assessmentAnswerUpdate)
				.expect(200);

			const updatedAssessment = response.body as AssessmentAnswer;
			expect(updatedAssessment).toBeDefined();
			expect(updatedAssessment.assessmentNumber).toBe(assessmentToUpdate.assessmentNumber);
			expect(updatedAssessment.integrationStatus).toBe(assessmentAnswerUpdate.status);
			expect(updatedAssessment.integrationMessage).toBe(assessmentAnswerUpdate.message);

			const newDbEntry = await prisma.assessmentAnswer.findFirst({
				where: { patientId: sampleUpdatePatient.id, assessmentNumber: assessmentToUpdate.assessmentNumber },
			});
			expect(newDbEntry).toBeDefined();
			expect(newDbEntry?.integrationStatus).toBe(assessmentAnswerUpdate.status);
			expect(newDbEntry?.integrationMessage).toBe(assessmentAnswerUpdate.message);
			expect(newDbEntry?.checkedResponse).toBe(null);
		});
	});

	describe('POST /api/v2/patients/[patientId]/artifacts/[artifactId]', () => {
		let testPatients: PatientWithArtifacts[];
		beforeAll(async () => {
			const { RPA_ACCESS_KEY, RPA_SECRET_KEY } = env;
			expect(RPA_ACCESS_KEY).toBeDefined();
			expect(RPA_SECRET_KEY).toBeDefined();
			({ testPatients } = await createTestEMRData());
		});

		it('update artifact to be complete', async () => {
			const samplePatient = testPatients[0];
			const sampleArtifact = samplePatient?.PatientArtifacts[0];
			const response = await request(baseUrl)
				.post(`/api/v2/patients/${samplePatient?.id}/artifacts/${sampleArtifact?.id}`)
				.set('access-key', `${env.RPA_ACCESS_KEY}`)
				.set('secret-key', `${env.RPA_SECRET_KEY}`)
				.send({ integrationStatus: AssessmentAnswerIntegrationStatus.Completed })
				.expect(200);
			const body = response.body as RPAArtifact;
			expect(body.integrationStatus).toEqual(AssessmentAnswerIntegrationStatus.Completed);
		});

		it('send 400 if invalid payload provided', async () => {
			const samplePatient = testPatients[0];
			const sampleArtifact = samplePatient?.PatientArtifacts[0];
			await request(baseUrl)
				.post(`/api/v2/patients/${samplePatient?.id}/artifacts/${sampleArtifact?.id}`)
				.set('access-key', `${env.RPA_ACCESS_KEY}`)
				.set('secret-key', `${env.RPA_SECRET_KEY}`)
				.send({ integrationStatus: 'fake status' })
				.expect(400);
		});
	});

	describe('POST /api/v2/patients/[patientId]/request-login', () => {
		let testPatients: Patient[];
		beforeAll(async () => {
			const { RPA_ACCESS_KEY, RPA_SECRET_KEY } = env;
			expect(RPA_ACCESS_KEY).toBeDefined();
			expect(RPA_SECRET_KEY).toBeDefined();
			({ testPatients } = await createTestEMRData());
		});

		it('should return available login', async () => {
			const samplePatient = testPatients[0];
			const response = await request(baseUrl)
				.post(`/api/v2/patients/${samplePatient?.id}/emr/request-login`)
				.set('access-key', `${env.RPA_ACCESS_KEY}`)
				.set('secret-key', `${env.RPA_SECRET_KEY}`)
				.send()
				.expect(200);
			const body = response.body as LoginProfile;
			expect(body.firstName).toBeDefined();
			expect(body.lastName).toBeDefined();
			expect(body.hchbUsername).toBeDefined();
			expect(body.hchbPassword).toBeDefined();
			expect(body.pointcareUserId).toBeDefined();
			expect(body.pointcarePassword).toBeDefined();
		});

		it('should return error when no more logins available', async () => {
			const samplePatient = testPatients[0];
			await request(baseUrl)
				.post(`/api/v2/patients/${samplePatient?.id}/emr/request-login`)
				.set('access-key', `${env.RPA_ACCESS_KEY}`)
				.set('secret-key', `${env.RPA_SECRET_KEY}`)
				.send()
				.expect(404);
		});
	});

	describe('POST /api/v2/emr/request-main-login and request-main-logout', () => {
		let testPatients: Patient[];
		beforeAll(async () => {
			const { RPA_ACCESS_KEY, RPA_SECRET_KEY } = env;
			expect(RPA_ACCESS_KEY).toBeDefined();
			expect(RPA_SECRET_KEY).toBeDefined();
			const data = await createTestEMRData();
			testPatients = data.testPatients;
		});

		it('should return available login', async () => {
			const samplePatient = testPatients[0];
			const response = await request(baseUrl)
				.post(`/api/v2/emr/request-main-login`)
				.set('access-key', `${env.RPA_ACCESS_KEY}`)
				.set('secret-key', `${env.RPA_SECRET_KEY}`)
				.send({ orgId: samplePatient?.organizationId })
				.expect(200);
			const body = response.body as LoginProfile;
			expect(body.firstName).toBeDefined();
			expect(body.lastName).toBeDefined();
			expect(body.hchbUsername).toBeDefined();
			expect(body.hchbPassword).toBeDefined();
			expect(body.pointcareUserId).toBeDefined();
			expect(body.pointcarePassword).toBeDefined();
		});

		it('should return error when no more logins available', async () => {
			const samplePatient = testPatients[0];
			await request(baseUrl)
				.post(`/api/v2/emr/request-main-login`)
				.set('access-key', `${env.RPA_ACCESS_KEY}`)
				.set('secret-key', `${env.RPA_SECRET_KEY}`)
				.send({ orgId: samplePatient?.organizationId })
				.expect(404);
		});

		it('should release a login for later use', async () => {
			const samplePatient = testPatients[0];
			await request(baseUrl)
				.post(`/api/v2/emr/request-main-logout`)
				.set('access-key', `${env.RPA_ACCESS_KEY}`)
				.set('secret-key', `${env.RPA_SECRET_KEY}`)
				.send({
					loginId: faker.number.int({ min: 8000, max: 9999 }),
				})
				.expect(404);

			await prisma.loginProfile.updateMany({ data: { inUse: false }, where: { mainLogin: true } });
			const response = await request(baseUrl)
				.post(`/api/v2/emr/request-main-login`)
				.set('access-key', `${env.RPA_ACCESS_KEY}`)
				.set('secret-key', `${env.RPA_SECRET_KEY}`)
				.send({ orgId: samplePatient?.organizationId })
				.expect(200);
			const body = response.body as LoginProfile & { loginId: number };

			await request(baseUrl)
				.post(`/api/v2/emr/request-main-logout`)
				.set('access-key', `${env.RPA_ACCESS_KEY}`)
				.set('secret-key', `${env.RPA_SECRET_KEY}`)
				.send({ loginId: body.loginId })
				.expect(200);
		});
	});
});
