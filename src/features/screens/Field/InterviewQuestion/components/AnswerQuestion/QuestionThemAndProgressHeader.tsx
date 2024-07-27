import { Stack, Typography } from '@mui/material';
import { NurseInterviewQuestion } from '~/assessments/nurse-interview/questions';
import {
	getNurseInterviewQuestionProgress,
	previousCurrentNextThemeWindow,
} from '../../common/utils/mainInterviewUtil';

type Props = {
	currentInterview: NurseInterviewQuestion[];
	currentShortLabel: string | undefined;
};
export const QuestionThemeAndProgressHeader = ({ currentInterview, currentShortLabel }: Props) => {
	const currentQuestion = currentInterview.find((question) => question.shortLabel === currentShortLabel);

	const { currentTheme } = previousCurrentNextThemeWindow(currentInterview, currentQuestion?.theme);
	const questionProgress = getNurseInterviewQuestionProgress(currentInterview, currentShortLabel);

	return (
		<Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
			<Typography color={'primary'} variant="h6" sx={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
				{currentTheme}
			</Typography>
			<Typography color={'primary'} variant="h6">
				{questionProgress}
			</Typography>
		</Stack>
	);
};
