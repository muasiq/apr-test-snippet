import { Box, Typography } from '@mui/material';
import theme from '~/styles/theme';

type Props = {
	helperText: string;
};
export const QuestionDetailsHelperTextItem = ({ helperText }: Props) => {
	return (
		<Box bgcolor={theme.palette.glass} border={'2px solid #FFF'} borderRadius={'8px'} p={2}>
			<Typography variant="body2">{helperText}</Typography>
		</Box>
	);
};
