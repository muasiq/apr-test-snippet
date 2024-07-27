import { expect, it } from '@jest/globals';
import { ConfigurationType, PatientArtifactTag, PatientStatus } from '@prisma/client';
import { prisma } from '../../../prisma';
import { GenerateSuggestionParams } from './generateSuggestion';
import { woundSuggestion } from './woundSuggestion';

describe('woundSuggestion', () => {
	describe('woundPrompt', () => {
		it('add wound suggestion to db', async () => {
			const patientToUse = await prisma.patient.findFirstOrThrow({
				where: {
					status: PatientStatus.WithQA,
					configurationType: ConfigurationType.HomeCareHomeBase,
					PatientArtifacts: { some: { tagName: PatientArtifactTag.Wounds } },
				},
				include: {
					NurseInterview: { include: { NurseInterviewThemeSummaries: { include: { QuestionItems: true } } } },
					InterviewQuestion: true,
					PatientArtifacts: { include: { patientDocumentArtifact: { include: { paragraphs: true } } } },
				},
			});
			const response = await woundSuggestion({ patient: patientToUse } as GenerateSuggestionParams);
			expect(response).toBeDefined();
		});
	});
});
