import { expect } from '@jest/globals';
import { getLocalConfiguration } from '~/assessments/configurations';
import { AutoCalculateOptions } from '~/assessments/oasis/auto-calculate-fields/options';
import { SchemaAssessmentAnswer } from '~/common/types/AssessmentSuggestionAndChoice';
import { PatientWithJoins } from '~/server/api/routers/patient/patient.types';
import { serializeQuestion } from './serializeQuestion';

const patientData = {
	id: 1,
	firstName: 'John',
	lastName: 'Smith',
	dateOfBirth: new Date('01/01/1970'),
} as unknown as PatientWithJoins;

const configuration = getLocalConfiguration('Accentra');

describe('serialize question', () => {
	describe('auto-calculated questions', () => {
		it('branden risk returns undefined until all answers are provided', () => {
			const answers = [
				{
					assessmentNumber: 'PA-3c342a',
					checkedResponse: {
						choice: 'COMPLETELY LIMITED - UNRESPONSIVE (DOES NOT MOAN, FLINCH OR GRASP) TO PAINFUL STIMULI, DUE TO DIMINISHED LEVEL OF CONSCIOUSNESS OR SEDATION OR LIMITED ABILITY TO FEEL PAIN OVER MOST OF BODY SURFACES',
					},
				},
			] as unknown as SchemaAssessmentAnswer[];

			const value = serializeQuestion({
				question: { autoCalculateFieldResolver: AutoCalculateOptions.BRADEN_RISK_ASSESSMENT },
				patientData,
				configuration,
				answers,
			});

			expect(value).toEqual(undefined);
		});

		it('branden risk include followups', () => {
			const answers = [
				{
					assessmentNumber: 'PA-3c342a',
					checkedResponse: {
						choice: 'COMPLETELY LIMITED - UNRESPONSIVE (DOES NOT MOAN, FLINCH OR GRASP) TO PAINFUL STIMULI, DUE TO DIMINISHED LEVEL OF CONSCIOUSNESS OR SEDATION OR LIMITED ABILITY TO FEEL PAIN OVER MOST OF BODY SURFACES',
					},
				},
				{
					assessmentNumber: 'PA-8d5572',
					checkedResponse: {
						choice: 'CONSTANTLY MOIST - SKIN IS KEPT MOIST ALMOST CONSTANTLY BY PERSPIRATION, URINE, ETC. DAMPNESS IS DETECTED EVERY TIME PATIENT IS MOVED OR TURNED.',
					},
				},
				{
					assessmentNumber: 'PA-603f9e',
					checkedResponse: {
						choice: 'BEDFAST - CONFINED TO BED',
					},
				},
				{
					assessmentNumber: 'PA-f30be6',
					checkedResponse: {
						choice: 'COMPLETELY IMMOBILE - DOES NOT MAKE EVEN SLIGHT CHANGES IN BODY OR EXTREMITY POSITION WITHOUT ASSISTANCE.',
					},
				},
				{
					assessmentNumber: 'PA-806a93',
					checkedResponse: {
						choice: 'VERY POOR - NEVER EATS A COMPLETE MEAL. RARELY EATS MORE THAN 1/3 OF ANY FOOD OFFERED. EATS 2 SERVIINGS OR LESS OF PROTEIN (MEAT OR DAIRY PRODUCTS) PER DAY. TAKES FLUIDS POORLY. DOES NOT TAKE A LIQUID DIETARY SUPPLEMENT, OR IS NPO AND/OR MAINTAINED ON CLEAR LIQUIDS OR IV FOR MORE THAN 5 DAYS.',
					},
				},
				{
					assessmentNumber: 'PA-dfa675',
					checkedResponse: {
						choice: 'PROBLEM - REQUIRES MODERATE TO MAXIMUM ASSISTANCE IN MOVING. COMPLETE LIFTING WITHOUT SLIDING AGAINST SHEETS IS IMPOSSIBLE. FREQUENTLY SLIDES DOWN IN BED OR CHAIR, REQUIRING FREQUENT REPOSITIONING WITH MAXIMUM ASSISTANCE. SPASTICITY, CONTRACTURES, OR AGITATION LEADS TO ALMOST CONSTANT FRICTION.',
					},
				},
				{
					assessmentNumber: 'PA-9d163a',
					checkedResponse: {
						choice: ['GEL OR FOAM MATTRESS'],
					},
				},
			] as unknown as SchemaAssessmentAnswer[];

			const value = serializeQuestion({
				question: { autoCalculateFieldResolver: AutoCalculateOptions.BRADEN_RISK_ASSESSMENT },
				patientData,
				configuration,
				answers,
			});

			expect(value).toEqual({
				children: [
					{
						children: [
							{
								label: 'TOTAL SCORE (PATIENTS WITH A TOTAL SCORE OF 12 OR LESS ARE CONSIDERED TO BE AT HIGH RISK OF DEVELOPING PRESSURE ULCERS):',
								value: 6,
							},
							{
								label: 'INDICATE THE BRADEN RISK LEVEL PRESENTED:',
								value: 'High Risk',
							},
						],
						followups: ['PA-9d163a', 'PA-c0b519'],
					},
					{
						label: 'Select the appropriate pressure reduction surface required:',
						value: 'GEL OR FOAM MATTRESS',
					},
					{
						label: 'Indicate the appropriate action needed:',
						value: '',
					},
				],
			});
		});
	});
});
