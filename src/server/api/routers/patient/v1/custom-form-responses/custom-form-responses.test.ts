import { expect, it } from '@jest/globals';
import { AssessmentAnswer } from '@prisma/client';
import { JsonValue } from '@prisma/client/runtime/library';
import { CustomAssessmentNumber } from '~/assessments/apricot/custom';
import { getLocalConfiguration } from '~/assessments/configurations';
import { AssessmentQuestionSources, QuestionSource } from '~/assessments/types';
import { lookupQuestion } from '~/assessments/util/lookupQuestionUtil';
import {
	expectedAddonEvaluationResponse,
	expectedHomeHealthAideVisitFrequencyResponse,
	expectedMedicationRpaResponse,
	expectedSkilledNursingVisitFrequencyResponse,
	sampleConfig,
	testAddonEvaluationCheckedResponse,
	testHomeHealthAideVisitFrequency,
	testMedicationCheckedResponse,
	testPathwaysNesting,
	testPathwaysNestingResponse,
	testSkilledNursingVisitFrequency,
} from '~/common/testUtils/generateFakeAnswers';
import { getAssessmentCustomFormResponses, isAssessmentCustomForm } from '.';
import { generateCarePlanResponse } from './careplan';

describe('getAssessmentCustomFormResponses', () => {
	describe('Medication Custom', () => {
		const question = lookupQuestion(CustomAssessmentNumber.MEDICATIONS, sampleConfig);
		it('should return medication answers', () => {
			const testAssessment: Partial<AssessmentAnswer> = {
				assessmentNumber: CustomAssessmentNumber.MEDICATIONS,
				checkedResponse: { choice: { medications: [testMedicationCheckedResponse] as JsonValue } },
				integrationMessage: null,
				integrationStatus: 'Pending',
				status: 'Completed',
			};
			const answer = getAssessmentCustomFormResponses(question, testAssessment as AssessmentAnswer, sampleConfig);
			expect(answer.checkedResponse).toEqual({ choice: { medications: [expectedMedicationRpaResponse] } });
		});
	});

	describe('Skilled Nursing Visit Frequency Custom', () => {
		const question = lookupQuestion(CustomAssessmentNumber.SKILLED_NURSING_VISIT_FREQUENCIES, sampleConfig);

		it('return null if no visit frequencies', () => {
			const testAssessment: Partial<AssessmentAnswer> = {
				assessmentNumber: CustomAssessmentNumber.SKILLED_NURSING_VISIT_FREQUENCIES,
				checkedResponse: {
					choice: { skilledNursingVisitFrequencies: [] },
				},
			};
			const result = getAssessmentCustomFormResponses(question, testAssessment as AssessmentAnswer, sampleConfig);
			expect(result.checkedResponse).toEqual({ choice: { skilledNursingVisitFrequencies: null } });
		});

		it('Should return skilled nursing visit frequency answers', () => {
			const testAssessment: Partial<AssessmentAnswer> = {
				assessmentNumber: CustomAssessmentNumber.SKILLED_NURSING_VISIT_FREQUENCIES,
				checkedResponse: {
					choice: {
						skilledNursingVisitFrequencies: [testSkilledNursingVisitFrequency as JsonValue],
					},
				},
			};

			const answer = getAssessmentCustomFormResponses(question, testAssessment as AssessmentAnswer, sampleConfig);
			expect(answer.checkedResponse).toEqual({
				choice: { skilledNursingVisitFrequencies: expectedSkilledNursingVisitFrequencyResponse },
			});
		});
	});

	describe('HHA Visit Frequency Custom', () => {
		const question = lookupQuestion(CustomAssessmentNumber.HOME_HEALTH_AIDE_VISIT_FREQUENCIES, sampleConfig);

		it('return null if no visit frequencies', () => {
			const testAssessment: Partial<AssessmentAnswer> = {
				assessmentNumber: CustomAssessmentNumber.HOME_HEALTH_AIDE_VISIT_FREQUENCIES,
				checkedResponse: {
					choice: { homeHealthAideVisitFrequencies: [] },
				},
			};
			const result = getAssessmentCustomFormResponses(question, testAssessment as AssessmentAnswer, sampleConfig);
			expect(result.checkedResponse).toEqual({ choice: { homeHealthAideVisitFrequencies: null } });
		});

		it('Should return home health aide visit frequency answers', () => {
			const testAssessment: Partial<AssessmentAnswer> = {
				assessmentNumber: CustomAssessmentNumber.HOME_HEALTH_AIDE_VISIT_FREQUENCIES,
				checkedResponse: {
					choice: {
						homeHealthAideVisitFrequencies: [testHomeHealthAideVisitFrequency as JsonValue],
					},
				},
			};

			const questionSource = {
				id: CustomAssessmentNumber.HOME_HEALTH_AIDE_VISIT_FREQUENCIES,
				source: AssessmentQuestionSources.Custom,
			} as QuestionSource;
			const answer = getAssessmentCustomFormResponses(
				lookupQuestion(questionSource.id!, sampleConfig),
				testAssessment as AssessmentAnswer,
				sampleConfig,
			);

			expect(answer.checkedResponse).toEqual({
				choice: {
					homeHealthAideVisitFrequencies: expectedHomeHealthAideVisitFrequencyResponse,
				},
			});
		});
	});

	describe('Additional Evaluation Custom', () => {
		it('Should return addon evaluation answers', () => {
			const testAssessment: Partial<AssessmentAnswer> = {
				assessmentNumber: CustomAssessmentNumber.ADDITIONAL_EVALUATION,
				checkedResponse: {
					choice: {
						addonEvaluations: [testAddonEvaluationCheckedResponse as JsonValue],
					},
				},
			};

			const questionSource = {
				id: CustomAssessmentNumber.ADDITIONAL_EVALUATION,
				source: AssessmentQuestionSources.Custom,
			} as QuestionSource;
			const answer = getAssessmentCustomFormResponses(
				lookupQuestion(questionSource.id!, sampleConfig),
				testAssessment as AssessmentAnswer,
				sampleConfig,
			);

			expect(answer.checkedResponse).toEqual({
				choice: {
					addonEvaluations: expectedAddonEvaluationResponse,
				},
			});
		});
	});
});

describe('isAssessmentCustomForm', () => {
	it('should return true for custom forms', () => {
		Object.values(CustomAssessmentNumber).forEach((assessmentNumber) => {
			expect(isAssessmentCustomForm(assessmentNumber)).toBe(true);
		});
	});

	it('should return false for non-custom forms', () => {
		expect(isAssessmentCustomForm('PA-97a6bd')).toBe(false);
	});
});

describe('Map Pathways nesting response', () => {
	const config = getLocalConfiguration('Accentra');
	it('getPathwaysNestingItems', () => {
		const nestingItems = config.pathwaysNesting;
		expect(nestingItems[0]?.text).toEqual('SN EVALUATION PERFORMED.  ADDITIONAL VISITS TO BE PROVIDED. (1104908)');
	});

	it('generateCarePlanResponse', () => {
		const assessmentAnswer: Partial<AssessmentAnswer> = {
			assessmentNumber: CustomAssessmentNumber.PLAN_BUILDER,
			checkedResponse: {
				choice: {
					areas: [
						{
							category: 'ALTERED GASTROINTESTINAL SYSTEM (8212)',
							problems: [
								{
									name: 'NEED FOR COLOSTOMY/ILEOSTOMY TEACHING/CARE (1105126)',
									goalDetails: 'goal details',
									interventionDetails: 'intervention details',
								},
							],
						},
					],
				},
			},
		};
		const res = generateCarePlanResponse(
			assessmentAnswer as AssessmentAnswer,
			config.pathways,
			testPathwaysNesting,
		);
		expect(res).toEqual(testPathwaysNestingResponse);
	});

	it('therapy only patient clears other categories', () => {
		const assessmentAnswer: Partial<AssessmentAnswer> = {
			assessmentNumber: CustomAssessmentNumber.PLAN_BUILDER,
			checkedResponse: {
				choice: {
					areas: [
						{
							category: 'THERAPY ONLY PATIENT (1105173)',
							problems: [
								{
									name: 'PT EVALUATION (1105199)',
									goalDetails: 'goal details',
									interventionDetails: 'intervention details',
								},
							],
						},
						{
							category: 'ALTERED GASTROINTESTINAL SYSTEM (8212)',
							problems: [
								{
									name: 'NEED FOR COLOSTOMY/ILEOSTOMY TEACHING/CARE (1105126)',
									goalDetails: 'goal details',
									interventionDetails: 'intervention details',
								},
							],
						},
					],
				},
			},
		};
		const res = generateCarePlanResponse(
			assessmentAnswer as AssessmentAnswer,
			config.pathways,
			testPathwaysNesting,
		);
		expect(res).not.toEqual(testPathwaysNestingResponse);
		expect(res[0]?.response).toEqual('NO');
	});
});
