import { faker } from '@faker-js/faker';
import { expect, it } from '@jest/globals';
import { AssessmentAnswerSuggestionStatus, Organization, Patient, UserRole } from '@prisma/client';
import { CustomAssessmentNumber } from '~/assessments/apricot/custom';
import { FdbDrugType } from '~/common/constants/medication';
import { createInteraction, createMedication } from '~/common/testUtils/entityBuilders/medication';
import { prisma } from '~/server/prisma';
import { TestUser, createTestContext, createTestData } from '../../../../../test/util';
import { createCaller } from '../../root';

import { createSignoffNeededPatient } from '~/common/testUtils/seedPatients';
import * as fdb from '../../common/fdb';
import { MedicationSchema } from './assessment.inputs';

jest.mock('../../common/fdb');

describe('Assessment Procedures', () => {
	let user: TestUser;

	beforeAll(async () => {
		user = await createTestData([UserRole.Nurse]);
	});

	afterAll(async () => {
		await prisma.$disconnect();
	});

	describe('assessment check', () => {
		it('should check assessment', async () => {
			const ctx = createTestContext({ user, roles: [UserRole.Nurse] });
			const api = createCaller(ctx);
			const org = await api.organization.getUserOrganization();

			const testPatient = await createSignoffNeededPatient(user.id, org, user.locationId!);

			const patientAssessment = await prisma.assessmentAnswer.findFirstOrThrow({
				where: {
					patientId: testPatient.id,
				},
			});

			const assessmentCheck = await api.assessment.assessmentCheck({
				patientId: testPatient.id,
				assessmentNumber: patientAssessment.assessmentNumber,
				skipGeneratedGuess: true,
				checkedResponse: { choice: 'Mocked choice text' },
			});

			expect(assessmentCheck?.assessmentNumber).toBe(patientAssessment.assessmentNumber);
			expect(assessmentCheck?.checkedResponse).toEqual({ choice: 'Mocked choice text' });
			expect(assessmentCheck?.checkedById).toBe(user.id);
			expect(assessmentCheck?.patientId).toBe(testPatient.id);
		});

		describe('medication', () => {
			let ctx: ReturnType<typeof createTestContext>;
			let api: ReturnType<typeof createCaller>;
			let org: Organization;
			let testPatient: Patient;

			beforeEach(async () => {
				ctx = createTestContext({ user, roles: [UserRole.Nurse] });
				api = createCaller(ctx);
				org = await api.organization.getUserOrganization();
				testPatient = await createSignoffNeededPatient(user.id, org, user.locationId!);
			});

			it('should require strength for unlisted medication', async () => {
				const medications = [createMedication({ strength: undefined })];

				await expect(
					api.assessment.assessmentCheck({
						patientId: testPatient.id,
						assessmentNumber: CustomAssessmentNumber.MEDICATIONS,
						skipGeneratedGuess: true,
						checkedResponse: { choice: { medications } },
					}),
				).rejects.toThrow();
			});

			it('should not require strength for listed medication', async () => {
				const medications = [
					createMedication({
						strength: undefined,
						fdb: {
							type: FdbDrugType.DISPENSABLE_DRUG,
							id: faker.string.numeric(),
							name: faker.lorem.words(),
						},
					}),
				];

				await expect(
					api.assessment.assessmentCheck({
						patientId: testPatient.id,
						assessmentNumber: CustomAssessmentNumber.MEDICATIONS,
						skipGeneratedGuess: true,
						checkedResponse: { choice: { medications } },
					}),
				).resolves.not.toThrow();
			});

			it('should allow decimal values for dose amount', async () => {
				const medications = [
					createMedication({ doseAmount: 5 }),
					createMedication({ doseAmount: 2.5 }),
					createMedication({ doseAmount: 2.5, doseUnit: 'Per instructions', instructions: 'instructions' }),
				];

				await expect(
					api.assessment.assessmentCheck({
						patientId: testPatient.id,
						assessmentNumber: CustomAssessmentNumber.MEDICATIONS,
						skipGeneratedGuess: true,
						checkedResponse: { choice: { medications } },
					}),
				).resolves.not.toThrow();
			});

			it('should require instructions when dose unit is set to per instructions', async () => {
				const medications = [createMedication({ doseUnit: 'Per instructions' })];

				await expect(
					api.assessment.assessmentCheck({
						patientId: testPatient.id,
						assessmentNumber: CustomAssessmentNumber.MEDICATIONS,
						skipGeneratedGuess: true,
						checkedResponse: { choice: { medications } },
					}),
				).rejects.toThrow();
			});

			describe('medication interactions', () => {
				let interactions: ReturnType<typeof createInteraction>[];
				let medications: MedicationSchema[];

				beforeEach(() => {
					interactions = [createInteraction()];
					medications = [
						createMedication({ fdb: { type: FdbDrugType.DISPENSABLE_DRUG, id: '123', name: 'Drug 1' } }),
						createMedication({ fdb: { type: FdbDrugType.DISPENSABLE_DRUG, id: '456', name: 'Drug 2' } }),
					];

					jest.spyOn(fdb, 'getInteractions').mockImplementation(() => Promise.resolve(interactions));
				});

				it('should update interactions when medications are changed', async () => {
					const res = await api.assessment.assessmentCheck({
						patientId: testPatient.id,
						assessmentNumber: CustomAssessmentNumber.MEDICATIONS,
						skipGeneratedGuess: true,
						checkedResponse: { choice: { medications } },
					});

					expect(res?.checkedResponse).toEqual(
						expect.objectContaining({ interactions: { data: interactions, verified: false } }),
					);
				});

				it('should be able to verify interactions', async () => {
					await api.assessment.assessmentCheck({
						patientId: testPatient.id,
						assessmentNumber: CustomAssessmentNumber.MEDICATIONS,
						skipGeneratedGuess: true,
						checkedResponse: { choice: { medications } },
					});

					const res = await api.assessment.verifyMedicationInteractionsAssessment({
						patientId: testPatient.id,
					});

					expect(res?.checkedResponse).toEqual(
						expect.objectContaining({
							interactions: {
								data: interactions,
								verified: true,
								verifiedAt: expect.any(String),
								verifiedBy: user.name,
							},
						}),
					);
				});

				it('should not be able to verify if not the case manager', async () => {
					const user2 = await createTestData([UserRole.Nurse]);

					const ctx = createTestContext({ user: user2, roles: [UserRole.Nurse] });
					const api = createCaller(ctx);

					await expect(
						api.assessment.verifyMedicationInteractionsAssessment({
							patientId: testPatient.id,
						}),
					).rejects.toThrow();
				});
			});
		});
	});

	describe('get all assessment questions for patient', () => {
		it('should get all assessment questions for patient', async () => {
			const ctx = createTestContext({ user, roles: [UserRole.SuperAdmin] });
			const api = createCaller(ctx);
			const org = await api.organization.getUserOrganization();

			const testPatient = await createSignoffNeededPatient(user.id, org, user.locationId!);

			const assessmentQuestions = await api.assessment.getAllAssessmentQuestionsForPatient({
				patientId: testPatient.id,
			});

			expect(assessmentQuestions).toBeInstanceOf(Array);
			expect(assessmentQuestions.length).toBeGreaterThan(0);

			const sampleQuestion = faker.helpers.arrayElement(assessmentQuestions);
			expect(sampleQuestion?.assessmentNumber).toBeDefined();
			expect(sampleQuestion?.checkedById).toBe(user.id);
			expect(sampleQuestion?.patientId).toBe(testPatient.id);
			expect(sampleQuestion?.status).toBe(AssessmentAnswerSuggestionStatus.InProgress);
			expect(sampleQuestion?.checkedResponse).toBeDefined();
		});
	});

	describe('get assessment question for patient', () => {
		it('should get assessment question for patient', async () => {
			const ctx = createTestContext({ user, roles: [UserRole.SuperAdmin] });
			const api = createCaller(ctx);
			const org = await api.organization.getUserOrganization();

			const testPatient = await createSignoffNeededPatient(user.id, org, user.locationId!);

			const existingAssessment = await prisma.assessmentAnswer.findFirstOrThrow({
				where: {
					patientId: testPatient.id,
				},
				select: {
					assessmentNumber: true,
				},
			});

			const assessmentQuestion = await api.assessment.getAssessmentQuestionForPatient({
				patientId: testPatient.id,
				assessmentNumber: existingAssessment.assessmentNumber,
			});

			expect(assessmentQuestion?.assessmentNumber).toBe(existingAssessment?.assessmentNumber);
			expect(assessmentQuestion?.checkedById).toBe(user.id);
			expect(assessmentQuestion?.patientId).toBe(testPatient.id);
			expect(assessmentQuestion?.status).toBe(AssessmentAnswerSuggestionStatus.InProgress);
			expect(assessmentQuestion?.checkedResponse).toBeDefined();
		});
	});

	describe('generate assessment answer', () => {
		it('should generate assessment answer', async () => {
			const ctx = createTestContext({ user, roles: [UserRole.SuperAdmin] });
			const api = createCaller(ctx);
			const org = await api.organization.getUserOrganization();

			const testPatient = await createSignoffNeededPatient(user.id, org, user.locationId!);

			const existingAssessment = await prisma.assessmentAnswer.findFirstOrThrow({
				where: {
					patientId: testPatient.id,
				},
			});

			const assessmentAnswer = await api.assessment.generateAssessmentAnswer({
				patientId: testPatient.id,
				assessmentNumber: existingAssessment.assessmentNumber,
			});

			expect(assessmentAnswer?.assessmentNumber).toBe(existingAssessment?.assessmentNumber);
			expect(assessmentAnswer?.checkedById).toBe(user.id);
			expect(assessmentAnswer?.patientId).toBe(testPatient.id);
			expect(assessmentAnswer?.status).toBe(AssessmentAnswerSuggestionStatus.InProgress);
			expect(assessmentAnswer?.checkedResponse).toBeDefined();
		});
	});
});
