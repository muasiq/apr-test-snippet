import { expect, it } from '@jest/globals';
import { ConfigurationType } from '@prisma/client';
import { AccentraConfig } from '~/assessments/home-care-home-base/orgs/accentra';
import { PatientWithAssessmentContext } from '~/server/api/routers/patient/patient.types';
import { Models } from '../claude';
import { GenerateSuggestionParams } from '../generateSuggestion';
import { carePlanSuggestion } from './carePlanSuggestion';

describe('carePlanSuggestions', () => {
	it('should generate care plan suggestions from ocr and interview notes', async () => {
		const patient = {
			id: 1,
			configurationType: ConfigurationType.HomeCareHomeBase,
			PatientArtifacts: [],
			NurseInterview: {
				NurseInterviewThemeSummaries: [
					{
						QuestionItems: [
							{
								question: 'Describe the goals and discharge plan for this patient.',
								LLMSummarizedText: [
									'Patient stated goal is to get wounds healed.',
									'Goal for this patient would be to get wounds healed and um strengthening, education on insulin-dependent diabetes, and to see blood sugar readings under 300.',
									'Prognosis and rehab potential for this patient is fair.',
								],
							},
						],
					},
				],
			},
		} as unknown as PatientWithAssessmentContext;

		const response = await carePlanSuggestion({
			patient,
			configuration: AccentraConfig,
			model: Models.HAIKU,
		} as GenerateSuggestionParams);

		const endocrine = response.choice.areas.find((area) => area.category === 'ALTERED ENDOCRINE SYSTEM (8279)');
		expect(endocrine?.problems).toEqual(
			expect.arrayContaining([
				{
					name: 'NEED FOR SKILLED TEACHING RELATED TO DIABETES (8281)',
					goalDetails: expect.any(String),
					interventionDetails: expect.any(String),
				},
				{
					name: "NEED FOR MONITORING OF PATIENT'S BLOOD GLUCOSE LOG (8284)",
					goalDetails: expect.any(String),
					interventionDetails: expect.any(String),
				},
				{
					name: 'NEED FOR BLOOD GLUCOSE TESTING (8287)',
					goalDetails: expect.any(String),
					interventionDetails: expect.any(String),
				},
			]),
		);

		const skin = response.choice.areas.find((area) => area.category === 'ALTERED SKIN INTEGRITY (8257)');
		expect(skin?.problems).toEqual(
			expect.arrayContaining([
				{
					name: 'NEED FOR OBSERVATION/ASSESSMENT AND SKILLED TEACHING AND TRAINING RELATED TO PRESERVATION OF SKIN INTEGRITY (1105138)',
					goalDetails: expect.any(String),
					interventionDetails: expect.any(String),
				},
				{
					name: 'NEED FOR WOUND CARE NOT OTHERWISE SPECIFIED (USED IN CONJUNCTION WITH O/A AND SKILLED TEACHING PROBLEM STATEMENT) (1105143)',
					goalDetails: expect.any(String),
					interventionDetails: expect.any(String),
				},
			]),
		);

		// details include specific values from notes
		const glucoseProblemItem = endocrine?.problems?.find(
			(item) => item.name === "NEED FOR MONITORING OF PATIENT'S BLOOD GLUCOSE LOG (8284)",
		);
		expect(glucoseProblemItem?.goalDetails.includes('300')).toBe(true);
		expect(glucoseProblemItem?.interventionDetails.includes('300')).toBe(true);
	}, 60000);
});
