import { AutoCalculateInput } from '~/features/ui/oasis/AutoCalculateInput';
import {
	AutoCalculateFieldResolver,
	getAnsweredAssessmentQuestionsByEnum,
	getDataFileChoiceScore,
} from '../../../util/autoCalculateFieldsUtil';
import { MoodInterviewQuestionsEnum } from './moodInterviewUtil';

const label = 'Total Severity Score:';

function getMoodScore({ assessmentData, configuration }: AutoCalculateFieldResolver) {
	const answeredQuestions = getAnsweredAssessmentQuestionsByEnum(assessmentData, MoodInterviewQuestionsEnum);
	const totalScore = answeredQuestions.reduce((acc, item) => acc + getDataFileChoiceScore(item, configuration), 0);
	const unansweredQuestionsLength = Object.values(MoodInterviewQuestionsEnum).length - answeredQuestions.length;

	return unansweredQuestionsLength >= 3 ? 99 : totalScore;
}

export function getSerializedValue(props: AutoCalculateFieldResolver) {
	return { label, value: getMoodScore(props) };
}

export const Input = (props: AutoCalculateFieldResolver) => {
	return <AutoCalculateInput question={label} score={getMoodScore(props)} />;
};
