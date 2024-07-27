import { Box, Stack, Typography } from '@mui/material';
import { FULL_HEIGHT_MINUS_NAVBAR } from '~/features/ui/layouts/TopNav';
import { useShallowRouterQuery } from '../../../../../common/hooks/useShallowRouterQuery';
import { InterviewState } from '../common/interviewState';
import { AnswerModeBackForward } from './AnswerModeBackForward';

export const ReviewRedoPrompt = (): JSX.Element => {
	const { push } = useShallowRouterQuery();

	const handleForwardClick = (dictate: boolean) => {
		push({ interviewState: InterviewState.MAIN_INTERVIEW, dictate });
	};

	const handleBackClick = () => {
		push({ interviewState: InterviewState.REVIEW, isInReview: undefined });
	};

	return (
		<Box height={FULL_HEIGHT_MINUS_NAVBAR} display={'flex'} flexDirection={'column'}>
			<Box flexGrow={1} overflow={'auto'} px={3} py={4} textAlign={{ xs: 'start', sm: 'center' }}>
				<Stack spacing={2}>
					<Typography variant="h4">Are you sure you want to restate this answer?</Typography>
					<Typography variant="body2">
						You can change your input method below and/or continue to the question.
					</Typography>
				</Stack>
			</Box>
			<AnswerModeBackForward onForward={handleForwardClick} onBackward={handleBackClick} />
		</Box>
	);
};
