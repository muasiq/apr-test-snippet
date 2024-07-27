import { Alert, Stack } from '@mui/material';
import { AutoCalculateInput } from '../../../../../../features/ui/oasis/AutoCalculateInput';
import {
	AutoCalculateFieldResolver,
	getAnsweredAssessmentQuestionsByEnum,
	getDataFileChoiceScore,
	getUnansweredQuestions,
} from '../../../../../util/autoCalculateFieldsUtil';
import { MAHCRiskAssessmentQuestions, getMAHCRiskLevelText } from './MAHCRiskAssessmentUtil';

const label = "ACCORDING TO THE MAHC 10 FALL RISK ASSESSMENT, THIS PATIENT'S SCORE IS";
const riskLabel = 'BASED ON THE SCORE, THE PATIENT IS';

function getMAHCRiskValue({ assessmentData, configuration }: AutoCalculateFieldResolver) {
	const answeredMAHCRiskQuestions = getAnsweredAssessmentQuestionsByEnum(assessmentData, MAHCRiskAssessmentQuestions);
	const unansweredQuestions = getUnansweredQuestions(answeredMAHCRiskQuestions, MAHCRiskAssessmentQuestions);

	const score = answeredMAHCRiskQuestions.reduce((acc, item) => acc + getDataFileChoiceScore(item, configuration), 0);

	return {
		score,
		riskLevelText: getMAHCRiskLevelText(score),
		unansweredQuestions,
		isComplete: unansweredQuestions.length === 0,
	};
}

export function getSerializedValue(props: AutoCalculateFieldResolver) {
	const { score, riskLevelText, isComplete } = getMAHCRiskValue(props);

	if (!isComplete) return undefined;

	return {
		children: [
			{ label: label, value: score },
			{ label: riskLabel, value: riskLevelText },
		],
	};
}

export const Input = (props: AutoCalculateFieldResolver) => {
	const { score, riskLevelText, isComplete, unansweredQuestions } = getMAHCRiskValue(props);

	return (
		<>
			{isComplete ? (
				<Stack spacing={3}>
					<AutoCalculateInput question={label} score={score} />
					<AutoCalculateInput question={riskLabel} score={riskLevelText} />
				</Stack>
			) : (
				<Alert severity="warning" icon={false}>
					MAHC Risk Assessment Score Incomplete. Please finish answering {unansweredQuestions.join(', ')}{' '}
				</Alert>
			)}
		</>
	);
};
