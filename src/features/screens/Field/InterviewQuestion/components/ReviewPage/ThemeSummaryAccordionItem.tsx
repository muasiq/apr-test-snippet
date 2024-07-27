import { Edit } from '@mui/icons-material';
import { Button, IconButton, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { interview } from '~/assessments/nurse-interview/questions';
import { useShallowRouterQuery } from '~/common/hooks/useShallowRouterQuery';
import { primaryTextFieldStyles } from '~/features/ui/textfield/textfield.styles';
import theme from '~/styles/theme';
import { InterviewState } from '../../common/interviewState';
import { AccordionQuestionError } from '../Review';

type Props = {
	question: string;
	defaultValue: string | null;
	onChange: (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
	removeFailedAudioQuestion: (question: string) => void;
	addFailedAudioQuestion: (question: string) => void;
	hasError: AccordionQuestionError | undefined;
	canEdit: boolean;
	canRedo: boolean;
};
export const ThemeSummaryAccordionItem = ({
	defaultValue,
	onChange,
	question,
	hasError,
	addFailedAudioQuestion,
	removeFailedAudioQuestion,
	canEdit,
	canRedo,
}: Props) => {
	const [value, setValue] = useState(defaultValue ?? '');
	const [displayError, setDisplayError] = useState(false);
	const [editAnswer, setEditAnswer] = useState(false);
	const { push } = useShallowRouterQuery();

	useEffect(() => {
		if (hasError) {
			setValue('');
			setDisplayError(true);
		}
	}, [hasError]);

	const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
		const newValue = event.target.value;

		setValue(newValue);

		if (newValue.trim() === '') {
			addFailedAudioQuestion(question);
			setDisplayError(true);
		} else if (newValue.trim() !== '' && hasError) {
			removeFailedAudioQuestion(question);
			setDisplayError(false);
		}
	};

	const handleEditClick = () => {
		setEditAnswer((prev) => !prev);
	};

	const handleSaveClick = () => {
		setEditAnswer(false);
		onChange({ target: { value } } as React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>);
	};

	const handleRedoClick = () => {
		const questionShortLabel = interview.find((item) => item.question === question)?.shortLabel;
		push({
			interviewState: InterviewState.REVIEW_REDO_PROMPT,
			questionShortLabel,
			isInReview: 'true',
			dictate: 'true',
		});
	};

	return (
		<Stack spacing={1}>
			<Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
				<Typography variant="h6" color={theme.palette.text.primary}>
					{question}
				</Typography>
				{canEdit &&
					(editAnswer ? (
						<Stack direction={'row'}>
							{canRedo && (
								<Button
									variant="text"
									sx={{ borderRadius: 0 }}
									size="small"
									onClick={handleRedoClick}
									data-cy="theme-summary-edit-redo-btn"
								>
									REDO
								</Button>
							)}
							<Button
								variant="text"
								sx={{ borderRadius: 0 }}
								size="small"
								onClick={handleSaveClick}
								data-cy="theme-summary-edit-save-btn"
							>
								SAVE
							</Button>
						</Stack>
					) : (
						<IconButton onClick={handleEditClick} data-cy="theme-summary-edit-btn">
							<Edit />
						</IconButton>
					))}
			</Stack>
			{displayError && (
				<Typography variant="body2" color={'error'}>
					{hasError?.errorMessage}
				</Typography>
			)}
			{editAnswer ? (
				<TextField
					multiline
					value={value}
					variant="outlined"
					fullWidth
					onChange={handleChange}
					sx={primaryTextFieldStyles}
					data-cy="theme-summary-editing-text"
				/>
			) : (
				<Typography
					variant="body2"
					color={theme.palette.text.primary}
					sx={{ whiteSpace: 'pre-wrap' }}
					data-cy="theme-summary-saved-text"
				>
					{value || 'No response given'}
				</Typography>
			)}
		</Stack>
	);
};
