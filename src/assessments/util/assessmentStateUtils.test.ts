import { expect } from '@jest/globals';
import { AssessmentAnswer } from '@prisma/client';
import { compact, intersection } from 'lodash';
import { CustomAssessmentNumber } from '~/assessments/apricot/custom';
import { WOUND_HEADING } from '~/assessments/apricot/util';
import { Configuration, getLocalConfiguration } from '~/assessments/configurations';
import {
	allQuestionsMap,
	allRelevantQuestionIdsForPatient,
	allRelevantQuestionsForPageHeading,
	allRelevantQuestionsForPatientHaveConfirmedAnswers,
	allTopLevelQuestionsForConfigurationAndPatient,
	pageHeadingHasAllRelevantQuestionsConfirmed,
	questionsThatDoNotHaveConfirmedAnswers,
	recursivelyGetAllFollowUpsForTopLevelQuestionIds,
} from '~/assessments/util/assessmentStateUtils';
import { addMultipleIndex } from '~/common/utils/addMultipleIndex';
import { PatientWithJoins } from '~/server/api/routers/patient/patient.types';

describe('assessmentStateUtils', () => {
	const patient = {
		NurseInterview: {
			totalWounds: 1,
		},
	} as PatientWithJoins;

	const configuration = getLocalConfiguration('Accentra');
	const allIdsInPatientInformationSection = [
		'PA-97a6bd',
		'A1005',
		'A1010',
		'MQ29KAPBEQ',
		'A1110B',
		'PA-710511',
		'SSA102',
		'PA-329f77',
		'PA-2c33c4',
		'B1300',
		'PA-5a8f12',
		'M1100',
		'PA-1a4639',
		'PA-5a0310',
		'PA-401818',
		'PA-7241b1',
		'SSA100',
		'M2102F',
		'PA-59767e',
		'PA-bcf065',
		'PA-317452',
		'A1250',
		'PA-a86932',
		'PA-1386f9',
		'PA-c02a64',
		'advance_directives_custom',
		'facilities_custom',
		'EV00',
	];

	describe(allTopLevelQuestionsForConfigurationAndPatient.name, () => {
		const questions = allTopLevelQuestionsForConfigurationAndPatient({ configuration, patient, answers: [] });

		it('should return all top level questions for patient', () => {
			const itemsToSpotCheck = [
				'MQ373KM2QO',
				CustomAssessmentNumber.HOME_HEALTH_AIDE_VISIT_FREQUENCIES,
				'PA-2b0c08',
				'C1310A',
			];
			const spotCheck = questions.filter((q) => {
				return itemsToSpotCheck.some((item) => item === q.id);
			});
			expect(spotCheck.length).toBe(itemsToSpotCheck.length);
		});

		it('should not return follow-ups', () => {
			const followUpId = 'AC1001';
			expect(questions.find((q) => q.id === followUpId)).toBeUndefined();
		});
	});

	describe(recursivelyGetAllFollowUpsForTopLevelQuestionIds.name, () => {
		const answers = [
			generateAnswer('PSIG25V2GVRD', 'Not Met'),
			generateAnswer('PA-fcab86'),
			generateAnswer('PA-15bc7b', 'Yes', false),
			generateAnswer('PA-9f8d09', 'Yes', false),
			generateAnswer('O0110_A', ['Oxygen therapy', 'Chemotherapy'], true),
			generateAnswer('SSA01-#1'),
		];
		const allQuestions = allQuestionsMap(configuration);
		const topLevelQuestions = allTopLevelQuestionsForConfigurationAndPatient({ configuration, patient, answers });
		const topLevelQuestionIds = compact(topLevelQuestions.map((q) => q.id));
		it('should return all relevant follow ups based on generated and confirmed answers', () => {
			const relevantFollowUps = recursivelyGetAllFollowUpsForTopLevelQuestionIds(
				allQuestions,
				topLevelQuestionIds,
				{ answers, configuration, patient },
			);
			// PSIG25V2GVRD follow-up intentionally not included since it's parent is not adding it to the follow-up tree
			expect(relevantFollowUps).toEqual([
				'PA-acc548',
				'PA-f8ace2',
				'PA-9f8d09',
				'O0110_A_A1',
				'O0110_A_C1',
				'MQ6BB554AY-#1',
				'MQ55CXJBTX-#1',
				'MQ3M1T78JB-#1',
				'MQ4LWHY55V-#1',
				'MQ1A9R6EWB-#1',
				'SSA02-#1',
				'SSA04-#1',
				'PA-772181',
			]);
		});
	});

	describe(allRelevantQuestionIdsForPatient.name, () => {
		it('should return all top level questions and currently relevant follows ups based on generated and accepted answers', () => {
			const answers = [generateAnswer('PA-15bc7b'), generateAnswer('PA-fcab86'), generateAnswer('SSA01-#2')];
			const relevantQuestions = allRelevantQuestionIdsForPatient({ answers, configuration, patient });
			const itemsToSpotCheck = [
				'PA-9f8d09',
				'PA-acc548',
				'PA-f8ace2',
				CustomAssessmentNumber.HOME_HEALTH_AIDE_VISIT_FREQUENCIES,
				'PA-2b0c08',
				'C1310A',
			];
			const spotCheck = intersection(relevantQuestions, itemsToSpotCheck);
			expect(spotCheck.length).toEqual(itemsToSpotCheck.length);
		});
	});

	describe(allRelevantQuestionsForPageHeading.name, () => {
		const patient = {
			NurseInterview: {
				totalWounds: 2,
			},
		} as PatientWithJoins;
		it('should return all relevant questions for a page heading', () => {
			const heading = 'Patient Information';
			const questions = allRelevantQuestionsForPageHeading(heading, { configuration, patient, answers: [] });
			expect(questions).toEqual(allIdsInPatientInformationSection);
		});

		it('should return all relevant questions for a page heading with multiple index and no answers', () => {
			const questions = allRelevantQuestionsForPageHeading(WOUND_HEADING, {
				configuration,
				patient,
				answers: [],
			});
			expect(questions).toEqual(['SSA01-#1', 'SSA01-#2']);
		});

		it('should return all relevant questions for a page heading with multiple index and some answers', () => {
			const answers = [generateAnswer('SSA01-#2')];
			const questions = allRelevantQuestionsForPageHeading(WOUND_HEADING, {
				configuration,
				patient,
				answers,
			});
			expect(questions).toEqual([
				'SSA01-#1',
				'SSA01-#2',
				'MQ6BB554AY-#2',
				'MQ55CXJBTX-#2',
				'MQ3M1T78JB-#2',
				'MQ4LWHY55V-#2',
				'MQ1A9R6EWB-#2',
				'SSA02-#2',
				'SSA04-#2',
			]);
		});

		it('should return all relevant questions for multiple follow-up levels', () => {
			const heading = 'Health History';
			const answers = [generateAnswer('PA-15bc7b'), generateAnswer('PA-9f8d09')];
			const questions = allRelevantQuestionsForPageHeading(heading, { configuration, patient, answers });
			expect(questions).toMatchSnapshot();
			const spotCheck = ['PA-9f8d09', 'PA-772181'];
			const spotCheckMatches = questions.filter((q) => spotCheck.includes(q));
			expect(spotCheckMatches.length).toBe(spotCheck.length);
		});
	});

	describe(pageHeadingHasAllRelevantQuestionsConfirmed.name, () => {
		it('should return true if all relevant questions are confirmed', () => {
			const allQuestions = allQuestionsMap(configuration);
			const topLevelAnswers = allIdsInPatientInformationSection.map((id) => generateAnswer(id, 'No'));
			const followUps = recursivelyGetAllFollowUpsForTopLevelQuestionIds(
				allQuestions,
				allIdsInPatientInformationSection,
				{ answers: topLevelAnswers, configuration, patient },
			);
			// This will need to be recursive if this section ever gets more than one level deep for follow-ups
			const answersForFollowUps = followUps.map((id) => generateAnswer(id, 'No'));
			const answer = pageHeadingHasAllRelevantQuestionsConfirmed('Patient Information', {
				configuration,
				patient,
				answers: [...topLevelAnswers, ...answersForFollowUps],
			});
			expect(answer).toBe(true);
		});

		it('should return false if no answers at all ', () => {
			const answer = pageHeadingHasAllRelevantQuestionsConfirmed('Patient Information', {
				configuration,
				patient,
				answers: [],
			});
			expect(answer).toBe(false);
		});

		it('should return false if not all answered  ', () => {
			const answer = pageHeadingHasAllRelevantQuestionsConfirmed('Patient Information', {
				configuration,
				patient,
				answers: [generateAnswer('PA-59767e')],
			});
			expect(answer).toBe(false);
		});
	});

	describe(allRelevantQuestionsForPatientHaveConfirmedAnswers.name, () => {
		it('should return true if all relevant questions have confirmed answers', () => {
			const answerForEveryPossibleQuestion = answersForAllQuestionsInConfigPlusFirstIndex(configuration);
			const answer = allRelevantQuestionsForPatientHaveConfirmedAnswers({
				configuration,
				patient,
				answers: answerForEveryPossibleQuestion,
			});
			expect(answer).toBe(true);
		});

		it('should return false if not all relevant questions have confirmed answers', () => {
			const someAnswers = allIdsInPatientInformationSection.map((id) => generateAnswer(id, 'Yes'));
			const answer = allRelevantQuestionsForPatientHaveConfirmedAnswers({
				configuration,
				patient,
				answers: someAnswers,
			});
			expect(answer).toBe(false);
		});

		it('should return false if no answers', () => {
			const answer = allRelevantQuestionsForPatientHaveConfirmedAnswers({ configuration, patient, answers: [] });
			expect(answer).toBe(false);
		});
	});

	describe(questionsThatDoNotHaveConfirmedAnswers.name, () => {
		it('should return questions that do not have confirmed answers', () => {
			const toTest = 'A1005';
			const answerForEveryPossibleQuestion = answersForAllQuestionsInConfigPlusFirstIndex(configuration).filter(
				(a) => a.assessmentNumber !== toTest,
			);
			const remainingQuestions = questionsThatDoNotHaveConfirmedAnswers({
				configuration,
				patient,
				answers: answerForEveryPossibleQuestion,
			});
			expect(remainingQuestions).toEqual([toTest]);
		});

		it('should return empty array when all are answered', () => {
			const answerForEveryPossibleQuestion = answersForAllQuestionsInConfigPlusFirstIndex(configuration);
			const remainingQuestions = questionsThatDoNotHaveConfirmedAnswers({
				configuration,
				patient,
				answers: answerForEveryPossibleQuestion,
			});
			expect(remainingQuestions.length).toBe(0);
		});
	});
});

function answersForAllQuestionsInConfigPlusFirstIndex(configuration: Configuration) {
	// height and weight are in data file but Apricot Core is the one used
	const canBeSafelyIgnored = ['PA-946407', 'PA-ee1734'];
	return configuration.allQuestions
		.filter((q) => !canBeSafelyIgnored.includes(q.id))
		.flatMap((q) => [generateAnswer(q.id, 'Yes'), generateAnswer(addMultipleIndex(q.id, 1), 'Yes')]);
}

function generateAnswer(
	assessmentNumber: string,
	choice: string | string[] = 'Yes',
	confirmed = true,
): AssessmentAnswer {
	const withConfirmed = confirmed ? { checkedResponse: { choice }, generatedResponseAccepted: true } : {};
	return {
		assessmentNumber,
		generatedResponse: { choice },
		...withConfirmed,
	} as Partial<AssessmentAnswer> as AssessmentAnswer;
}
