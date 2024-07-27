import { Configuration } from '~/assessments/configurations';
import { lookupQuestion } from '../../../../../util/lookupQuestionUtil';

type PhysicalAssessmentResponse = {
	text: string;
	sequence: number;
	reference: string;
	code: string;
	followup?: string[];
};

export enum BradenRiskAssessmentQuestions {
	PA979 = 'PA-3c342a',
	PA993 = 'PA-8d5572',
	PA1000 = 'PA-603f9e',
	PA1010 = 'PA-f30be6',
	PA1018 = 'PA-806a93',
	PA1034 = 'PA-dfa675',
}

export const getPA1049FollowUpQuestionIds = (totalScore: number, configuration: Configuration) => {
	const lookupText = getBradenRiskLookupText(totalScore)?.toLowerCase();
	if (!lookupText) return [];

	try {
		const question = lookupQuestion('PA-f83cf9', configuration);
		const response = question?.responses?.find((response) => response.text.toLowerCase().includes(lookupText)) as
			| PhysicalAssessmentResponse
			| undefined;

		return response?.followup ?? [];
	} catch (error) {
		return [];
	}
};

export const getBradenRiskLevelText = (totalScore: number) => {
	if (totalScore <= 12) return 'High Risk';
	if (totalScore >= 13 && totalScore <= 14) return 'Moderate Risk';
	if (totalScore >= 15 && totalScore <= 18) return 'Low Risk';
	if (totalScore >= 19) return 'Mild to No Risk';
	return null;
};

// used to find the question in the configuration
function getBradenRiskLookupText(totalScore: number) {
	if (totalScore <= 12) return 'HIGH RISK';
	if (totalScore >= 13 && totalScore <= 14) return 'MODERATE RISK';
	if (totalScore >= 15 && totalScore <= 18) return 'LOW RISK';
	if (totalScore >= 19) return 'HEALTHY PATIENT';
	return undefined;
}
