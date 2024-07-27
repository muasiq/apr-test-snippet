import { Box, CircularProgress, CircularProgressProps } from '@mui/material';

type Props = {
	size?: string | number;
	positionAbsolute?: boolean;
} & CircularProgressProps;
export const LoadingSpinner = ({ size = 40, positionAbsolute = true, ...additionalProps }: Props): JSX.Element => {
	if (positionAbsolute) {
		return (
			<Box
				display="flex"
				alignItems="center"
				justifyContent="center"
				position="absolute"
				top={0}
				bottom={0}
				left={0}
				right={0}
			>
				<CircularProgress size={size} {...additionalProps} />
			</Box>
		);
	}
	return <CircularProgress size={size} {...additionalProps} />;
};
