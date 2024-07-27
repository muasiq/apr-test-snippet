import { isEmpty } from 'lodash';
import { Configuration } from '../../../../../configurations';
import { AutoCalculateFieldResolver, getDataFileChoiceScore } from '../../../../../util/autoCalculateFieldsUtil';

export enum NutritionalAssessmentQuestions {
	PA2500 = 'PA-4533f1',
}

export const getNutritionalAssessmentQuestionData = (
	assessmentData: AutoCalculateFieldResolver['assessmentData'],
	nutritionalAssessmentQuestionNumber: string,
) => {
	return assessmentData.find(
		(item) => item.assessmentNumber === nutritionalAssessmentQuestionNumber && item.checkedResponse,
	);
};

export const getNutritionalAssessmentScore = (choices: string | string[] | undefined, configuration: Configuration) => {
	if (!choices ?? isEmpty(choices)) return { nutritionalAssessmentScore: 0, nutritionalRiskLevelText: 'N/A' };

	const resolvedChoice = typeof choices === 'string' ? [choices] : choices;

	const score = resolvedChoice?.reduce((acc, curr) => {
		return (
			acc +
			getDataFileChoiceScore(
				{
					assessmentNumber: NutritionalAssessmentQuestions.PA2500,
					checkedResponse: { choice: curr },
				},
				configuration,
			)
		);
	}, 0);

	const nutritionalRiskLevelText = score && getNutritionalRiskLevelText(score);

	return { nutritionalAssessmentScore: score, nutritionalRiskLevelText };
};

const getNutritionalRiskLevelText = (totalScore: number) => {
	if (totalScore <= 2) return 'Low nutritional risk';
	if (totalScore >= 3 && totalScore <= 5) return 'Medium nutritional risk';
	if (totalScore >= 6) return 'High nutritional risk';
};
