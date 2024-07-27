import { Cancel, CheckCircle } from '@mui/icons-material';
import { Grid, Stack, Typography } from '@mui/material';
import { isEqual } from 'lodash';
import {
	SuggestionOutput,
	formatChoice,
	resolveExistingChoice,
	resolveExistingExplanation,
} from './util/suggestionAndChoiceUtils';

type Props = {
	result: SuggestionOutput;
};
export const ShowIterationResult = ({ result }: Props): JSX.Element | null => {
	const newChoice = formatChoice(result.suggestion.choice);
	const newExplanation = result.suggestion.explanation;
	const oldChoice = resolveExistingChoice(result.existingAnswer);
	const oldExplanation = resolveExistingExplanation(result.existingAnswer);
	const match = isEqual(newChoice, oldChoice);

	return (
		<>
			<Grid container>
				<Grid item xs={2}>
					{match ? <CheckCircle /> : <Cancel />}
				</Grid>
				<Grid item xs={5}>
					<Stack spacing={1} p={2}>
						<Typography variant="body1">{newChoice}</Typography>
						<Typography variant="body2">{newExplanation}</Typography>
					</Stack>
				</Grid>
				<Grid item xs={5}>
					{result.existingAnswer ? (
						<Stack spacing={1} p={2}>
							<Typography variant="body1">{oldChoice}</Typography>
							<Typography variant="body2">{oldExplanation}</Typography>
						</Stack>
					) : (
						<Typography variant="body1">No existing answer</Typography>
					)}
				</Grid>
			</Grid>
		</>
	);
};
