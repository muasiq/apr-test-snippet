import { Box, Stack, Typography } from '@mui/material';
import { NurseInterviewQuestion, woundInterviewItem } from '~/assessments/nurse-interview/questions';
import { QuestionDetailsHelperTextItem } from './QuestionDetailsHelperTextItem';

type Props = {
	questionShortLabel: string | undefined;
	currentQuestion: NurseInterviewQuestion | undefined;
	currentWoundNumber: string;
};
export const QuestionDetails = ({ currentQuestion, currentWoundNumber, questionShortLabel }: Props) => {
	const question =
		questionShortLabel === 'Wounds'
			? woundInterviewItem(Number(currentWoundNumber)).question
			: currentQuestion?.question;
	return (
		<>
			<Box my={3} position={'relative'}>
				<Typography variant="h4">{question}</Typography>
			</Box>

			<Stack spacing={2}>
				{currentQuestion?.helperText?.map((text, index) => (
					<QuestionDetailsHelperTextItem key={index} helperText={text} />
				))}
			</Stack>
		</>
	);
};
