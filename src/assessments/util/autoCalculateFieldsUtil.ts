import { RouterOutputs } from '~/common/utils/api';
import { AdditionalDropdownConfigurationInput } from '~/server/api/routers/organization/organization.inputs';
import { Configuration } from '../configurations';
import { lookupQuestion } from './lookupQuestionUtil';

interface CheckedResponse {
	checkedResponse: {
		choice: string;
	};
}

export type AutoCalculateFieldResolver = {
	assessmentData: (RouterOutputs['assessment']['getAllAssessmentQuestionsForPatient'][number] & CheckedResponse)[];
	configuration: Configuration;
	additionalDropdownConfigurationInput: AdditionalDropdownConfigurationInput;
	readOnly: boolean;
	print?: boolean;
};

export const getUnansweredQuestions = <T extends Record<string, string>>(
	assessmentData: AutoCalculateFieldResolver['assessmentData'],
	questionEnum: T,
) => {
	return Object.values(questionEnum).filter(
		(question) => !assessmentData.some((item) => item.assessmentNumber === question && item.checkedResponse),
	);
};

export const getAnsweredAssessmentQuestionsByEnum = <
	T extends Record<string, string>,
	U extends Record<'assessmentNumber', string> & { checkedResponse: unknown },
>(
	assessmentData: U[],
	questionEnum: T,
) => {
	const questionEnumSet = new Set(Object.values(questionEnum));
	return assessmentData.filter((item) => questionEnumSet.has(item.assessmentNumber) && item.checkedResponse);
};

export const getDataFileChoiceScore = (
	item: Partial<AutoCalculateFieldResolver['assessmentData'][0]> | undefined,
	configuration: Configuration | null,
): number => {
	if (!configuration) return 0;
	if (!item?.checkedResponse || !item.assessmentNumber) return 0;

	const question = lookupQuestion(item.assessmentNumber, configuration);

	if (!question?.responses) {
		console.error(`${item.assessmentNumber} question or responses not found`);
		return 0;
	}

	const response = question.responses.find(
		(r) => r.text?.trim()?.toLowerCase() === item.checkedResponse?.choice?.trim().toLowerCase(),
	);

	if (!response?.text) {
		console.error(`${item.assessmentNumber} response not found for choice:`, item.checkedResponse.choice);
		return 0;
	}

	if (response.code) {
		return parseInt(response.code);
	}

	const position = question.responses.indexOf(response);
	if (position < 0) {
		console.error(`${item.assessmentNumber} response not found for choice:`, item.checkedResponse.choice);
		return 0;
	}
	return position + 1;
};
