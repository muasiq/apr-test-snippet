import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { Box, Fab, Stack } from '@mui/material';
import { useRouter } from 'next/router';
import theme from '../../../../../../styles/theme';

const buttonStyle = {
	bgcolor: '#FFF',
	color: theme.palette.primary.main,
	border: `2px solid ${theme.palette.primary.main}`,
	boxShadow: 'none',
	'&.Mui-disabled': {
		backgroundColor: '#FFF',
		color: theme.palette.disabledButtonAccentColor,
		borderColor: theme.palette.disabledButtonAccentColor,
	},
};

type Props = {
	onBack?: () => void;
	showBack?: boolean;
	onForward: () => void;
	forwardDisabled?: boolean;
	backDisabled?: boolean;
};
export const BackForward = ({
	showBack = true,
	onBack,
	onForward,
	forwardDisabled = false,
	backDisabled = false,
}: Props) => {
	const router = useRouter();

	const handleBack = () => {
		if (onBack) {
			onBack();
		} else {
			void router.back();
		}
	};

	return (
		<>
			<Stack
				position={'fixed'}
				bottom={44}
				width={'100%'}
				textAlign={'center'}
				alignItems={'center'}
				justifyContent={'center'}
				zIndex={2}
				spacing={3}
				direction={'row'}
				left={0}
			>
				<Fab
					onClick={handleBack}
					disabled={backDisabled}
					data-cy="soc-interview-back-button"
					variant="circular"
					sx={{ ...buttonStyle, visibility: showBack ? 'visible' : 'hidden' }}
				>
					<ArrowBack />
				</Fab>
				<Fab
					onClick={onForward}
					disabled={forwardDisabled}
					data-cy="soc-interview-next-button"
					variant="circular"
					sx={buttonStyle}
				>
					<ArrowForward />
				</Fab>
			</Stack>
			<Box
				sx={{ position: 'fixed', bottom: 0, height: '72px', left: 0, right: 0 }}
				zIndex={1}
				boxShadow={
					'0px 2px 4px -1px rgba(0, 0, 0, 0.20), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12);'
				}
				borderRadius={'16px 16px 0px 0px;'}
				bgcolor={'#FFF'}
			></Box>
		</>
	);
};
