import { Box, Stack, TextField } from '@mui/material';
import { NurseInterviewQuestion } from '~/assessments/nurse-interview/questions';
import { FULL_HEIGHT_MINUS_NAVBAR } from '~/features/ui/layouts/TopNav';
import { primaryTextFieldStyles } from '~/features/ui/textfield/textfield.styles';
import { BackForward } from './BackForward';
import { QuestionDetails } from './QuestionDetails';
import { QuestionThemeAndProgressHeader } from './QuestionThemAndProgressHeader';

type Props = {
	hasAudioResponse: boolean;
	isLoading: boolean;
	textResponse: string;
	setTextResponse: (value: string) => void;
	handleNextButtonClick: () => void;
	handlePreviousButtonClick: () => void;
	filteredInterview: NurseInterviewQuestion[];
	questionShortLabel: string | undefined;
	currentWoundNumber: string;
	currentQuestion: NurseInterviewQuestion | undefined;
	saveResponse: () => Promise<void>;
};

export const TextQuestion = ({
	hasAudioResponse,
	handleNextButtonClick,
	handlePreviousButtonClick,
	isLoading,
	setTextResponse,
	textResponse,
	filteredInterview,
	currentQuestion,
	currentWoundNumber,
	questionShortLabel,
	saveResponse,
}: Props) => {
	return (
		<Stack px={3} py={4} height={FULL_HEIGHT_MINUS_NAVBAR} flexDirection={'column'}>
			<Stack
				flexGrow={1}
				overflow={'auto'}
				flexDirection={'column'}
				sx={{
					scrollbarWidth: 'none',
					msOverflowStyle: 'none',
				}}
			>
				<QuestionThemeAndProgressHeader
					currentInterview={filteredInterview}
					currentShortLabel={questionShortLabel}
				/>
				<QuestionDetails
					currentQuestion={currentQuestion}
					currentWoundNumber={currentWoundNumber}
					questionShortLabel={questionShortLabel}
				/>
				<TextField
					disabled={isLoading || hasAudioResponse}
					sx={{ backgroundColor: 'white', mt: 5, mb: 15, ...primaryTextFieldStyles }}
					label={
						hasAudioResponse ? 'You have already answered this question with audio' : 'Type your response'
					}
					fullWidth
					multiline
					value={textResponse}
					onChange={(e) => setTextResponse(e.target.value)}
					data-cy="text-question-textfield"
				/>
				<Box height={100} />
			</Stack>

			<BackForward
				onBack={async () => {
					if (textResponse) {
						await saveResponse();
					}
					handlePreviousButtonClick();
				}}
				onForward={async () => {
					if (textResponse) {
						await saveResponse();
					}
					handleNextButtonClick();
				}}
				forwardDisabled={(!textResponse && !hasAudioResponse) || isLoading}
			/>
		</Stack>
	);
};
