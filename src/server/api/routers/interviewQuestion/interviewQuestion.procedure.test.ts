import { expect, it } from '@jest/globals';
import { PatientStatus, Prisma, UserRole } from '@prisma/client';
import { createNewPatient } from '~/common/testUtils/seedPatients';
import { createTestContext, createTestData } from '../../../../../test/util';
import { lookupQuestionByText } from '../../../../assessments/nurse-interview/questions';
import { prisma } from '../../../prisma';
import { createCaller } from '../../root';

describe('InterviewQuestion Procedure', () => {
	let user: {
		id: string;
		organizationId: number;
		email: string;
		name: string;
		roles: UserRole[];
		locationId: number;
		tokenInfo?: { token: string; expires: string };
	};

	beforeAll(async () => {
		user = await createTestData([UserRole.Nurse]);
	});

	describe('submitForQA', () => {
		it('change status and create all summary items', async () => {
			const questionTextToTest = "Describe the patient's skin.";
			const testText = 'Great Skin';
			const ctx = createTestContext({ user, roles: [UserRole.Nurse] });
			const api = createCaller(ctx);
			const org = await prisma.organization.findUnique({ where: { id: user.organizationId } });
			if (!org) throw new Error('Organization not found');
			const testPatient = await createNewPatient({
				userId: user.id,
				organization: org,
				locationId: user.locationId,
				status: PatientStatus.NewPatient,
			});
			const testInterview: Prisma.NurseInterviewUpsertArgs['create'] = {
				selectedThemesToReportOn: ['Skin'],
				userId: user.id,
				patientId: testPatient.id,
				NurseInterviewThemeSummaries: {
					create: {
						theme: 'Skin',
						QuestionItems: {
							create: {
								question: questionTextToTest,
								humanConfirmedSummarizedText: testText,
							},
						},
					},
				},
			};
			await prisma.nurseInterview.upsert({
				where: { patientId: testPatient.id },
				create: {
					...testInterview,
				},
				update: {
					...testInterview,
				},
			});

			const result = await api.interviewQuestion.submitForQA({ patientId: testPatient.id });
			expect(result).toBe(true);
			const patient = await prisma.patient.findUnique({
				where: { id: testPatient.id },
				include: {
					NurseInterview: { include: { NurseInterviewThemeSummaries: { include: { QuestionItems: true } } } },
				},
			});
			expect(patient?.status).toBe(PatientStatus.WithQA);
			const allAnswers = patient?.NurseInterview?.NurseInterviewThemeSummaries.flatMap(
				(summary) => summary.QuestionItems,
			);
			expect(allAnswers?.length ?? 0).toBeGreaterThan(0);

			allAnswers?.forEach((question) => {
				if (question.question === questionTextToTest) {
					expect(question.humanConfirmedSummarizedText).toBe(testText);
				} else {
					const defaultAnswer = lookupQuestionByText(question.question)?.defaultResponse;
					if (!defaultAnswer) throw new Error('Default answer not found');
					expect(question.humanConfirmedSummarizedText).toBe(defaultAnswer);
				}
			});
		});
	});
});
