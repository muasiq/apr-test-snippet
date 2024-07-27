import { Alert } from '@mui/material';
import { AutoCalculateInput } from '../../../../features/ui/oasis/AutoCalculateInput';
import {
	AutoCalculateFieldResolver,
	getAnsweredAssessmentQuestionsByEnum,
	getDataFileChoiceScore,
	getUnansweredQuestions,
} from '../../../util/autoCalculateFieldsUtil';
import { BimsAssessmentQuestions, shouldDisplayBimsAssessmentQuestion } from './BimsAssessmentUtil';

const label = 'BIMS Summary Score:';

function getBIMSScore({ assessmentData, configuration }: AutoCalculateFieldResolver) {
	const answeredBimsQuestions = getAnsweredAssessmentQuestionsByEnum(assessmentData, BimsAssessmentQuestions);
	return answeredBimsQuestions.reduce((acc, item) => acc + getDataFileChoiceScore(item, configuration), 0);
}

export function getSerializedValue(props: AutoCalculateFieldResolver) {
	if (!shouldDisplayBimsAssessmentQuestion(props.assessmentData)) return undefined;
	return { label, value: getBIMSScore(props) };
}

export const Input = (props: AutoCalculateFieldResolver) => {
	const { assessmentData } = props;
	if (!shouldDisplayBimsAssessmentQuestion(assessmentData)) return null;

	const answeredBimsQuestions = getAnsweredAssessmentQuestionsByEnum(assessmentData, BimsAssessmentQuestions);
	const unansweredQuestions = getUnansweredQuestions(answeredBimsQuestions, BimsAssessmentQuestions);

	return (
		<>
			{unansweredQuestions.length === 0 ? (
				<AutoCalculateInput question={label} score={getBIMSScore(props)} />
			) : (
				<Alert severity="warning" icon={false}>
					BIMS Summary Score Incomplete. Please finish answering {unansweredQuestions.join(', ')}{' '}
				</Alert>
			)}
		</>
	);
};
