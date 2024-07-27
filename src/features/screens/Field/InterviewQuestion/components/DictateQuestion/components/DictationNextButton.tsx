import { ArrowForward } from '@mui/icons-material';
import { CircularProgress, Fab } from '@mui/material';
import { AnimatedCheckIcon } from '~/features/ui/icons/lottie/AnimatedCheckIcon';
import theme from '~/styles/theme';

type Props = {
	onClick: () => void;
	isVisible: boolean;
	disabled: boolean;
	isSuccess: boolean;
	isLoading: boolean;
};
export const DictationNextButton = ({ onClick, isVisible, disabled, isSuccess, isLoading }: Props) => {
	const renderIcon = () => {
		if (isSuccess) {
			return <AnimatedCheckIcon />;
		} else if (isLoading) {
			return <CircularProgress size={28} />;
		} else {
			return <ArrowForward />;
		}
	};
	return (
		<Fab
			disabled={disabled}
			data-cy="soc-interview-next-audio-question-button"
			onClick={onClick}
			variant="circular"
			sx={{
				bgcolor: '#FFF',
				color: theme.palette.primary.main,
				border: `2px solid ${theme.palette.primary.main}`,
				boxShadow: 'none',
				visibility: isVisible ? 'visible' : 'hidden',
				'&.Mui-disabled': {
					backgroundColor: '#FFF',
					color: theme.palette.disabledButtonAccentColor,
					borderColor: isLoading ? theme.palette.primary.main : theme.palette.disabledButtonAccentColor,
				},
			}}
		>
			{renderIcon()}
		</Fab>
	);
};
