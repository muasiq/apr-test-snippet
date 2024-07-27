import { expect, it } from '@jest/globals';
import { ConfigurationType, PatientStatus } from '@prisma/client';
import { CustomAssessmentNumber } from '~/assessments/apricot/custom';
import { AccentraConfig } from '~/assessments/home-care-home-base/orgs/accentra';
import { prisma } from '../../../../prisma';
import { GenerateSuggestionParams } from '../generateSuggestion';
import { carePlanSuggestion } from './carePlanSuggestion';

describe('carePlanSuggestion', () => {
	describe('careProblemsPrompt', () => {
		it('add care plan suggestion to db', async () => {
			const patientToUse = await prisma.patient.findFirstOrThrow({
				where: { status: PatientStatus.WithQA, configurationType: ConfigurationType.HomeCareHomeBase },
				include: {
					NurseInterview: { include: { NurseInterviewThemeSummaries: { include: { QuestionItems: true } } } },
					InterviewQuestion: true,
					PatientArtifacts: { include: { patientDocumentArtifact: { include: { paragraphs: true } } } },
				},
			});
			const response = await carePlanSuggestion({
				patient: patientToUse,
				configuration: AccentraConfig,
			} as GenerateSuggestionParams);
			const result = await prisma.assessmentAnswer.upsert({
				where: {
					patientId_assessmentNumber: {
						assessmentNumber: CustomAssessmentNumber.PLAN_BUILDER,
						patientId: patientToUse.id,
					},
				},
				create: {
					status: 'Completed',
					patientId: patientToUse.id,
					assessmentNumber: CustomAssessmentNumber.PLAN_BUILDER,
					generatedResponse: response,
				},
				update: {
					status: 'Completed',
					generatedResponse: response,
				},
			});
			expect(result.generatedResponse).toBeDefined();
		}, 90000);
	});
});
