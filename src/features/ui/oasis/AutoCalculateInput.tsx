import { Stack, Typography, TextField } from '@mui/material';
import theme from '~/styles/theme';

type Props = {
	question: string;
	score: number | string | null | undefined;
};
export const AutoCalculateInput = ({ question, score }: Props) => {
	return (
		<Stack spacing={1} borderLeft={`2px solid ${theme.palette.secondary.main}`} pl={2} pb={3}>
			<Typography variant="body1b">{question}</Typography>
			<TextField value={score} disabled />
		</Stack>
	);
};
