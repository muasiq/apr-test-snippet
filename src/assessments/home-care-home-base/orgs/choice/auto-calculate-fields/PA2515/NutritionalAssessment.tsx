import { Alert, Stack } from '@mui/material';
import { AutoCalculateInput } from '../../../../../../features/ui/oasis/AutoCalculateInput';
import { AutoCalculateFieldResolver } from '../../../../../util/autoCalculateFieldsUtil';
import { getNutritionalAssessmentQuestionData, getNutritionalAssessmentScore } from './nutritionalAssessmentUtil';

export const NUTRITIONAL_ASSESSMENT_QUESTION_DATA_OASIS_NUMBER = 'PA-4533f1';

const label = 'Nutritional Assessment Score:';
const riskLabel = 'Nutritional Risk Level:';

function getNutritionalAssessmentValue({ assessmentData, configuration }: AutoCalculateFieldResolver) {
	const nutritionalAssessmentQuestionData = getNutritionalAssessmentQuestionData(
		assessmentData,
		NUTRITIONAL_ASSESSMENT_QUESTION_DATA_OASIS_NUMBER,
	);

	const { nutritionalAssessmentScore, nutritionalRiskLevelText } = getNutritionalAssessmentScore(
		nutritionalAssessmentQuestionData?.checkedResponse.choice as unknown as string[] | undefined,
		configuration,
	);

	return {
		nutritionalAssessmentScore,
		nutritionalRiskLevelText,
		isComplete: !!nutritionalAssessmentQuestionData,
	};
}

export function getSerializedValue(props: AutoCalculateFieldResolver) {
	const { nutritionalAssessmentScore, nutritionalRiskLevelText, isComplete } = getNutritionalAssessmentValue(props);

	if (!isComplete) return undefined;

	return {
		children: [
			{ label, value: nutritionalAssessmentScore },
			{ label: riskLabel, value: nutritionalRiskLevelText },
		],
	};
}

export const Input = (props: AutoCalculateFieldResolver) => {
	const { nutritionalAssessmentScore, nutritionalRiskLevelText, isComplete } = getNutritionalAssessmentValue(props);

	return (
		<>
			{isComplete ? (
				<Stack spacing={3}>
					<AutoCalculateInput question={label} score={nutritionalAssessmentScore} />
					<AutoCalculateInput question={riskLabel} score={nutritionalRiskLevelText} />
				</Stack>
			) : (
				<Alert severity="warning" icon={false}>
					Nutritional Risk Assessment Score Incomplete. Please finish answering{' '}
					{NUTRITIONAL_ASSESSMENT_QUESTION_DATA_OASIS_NUMBER}
				</Alert>
			)}
		</>
	);
};
