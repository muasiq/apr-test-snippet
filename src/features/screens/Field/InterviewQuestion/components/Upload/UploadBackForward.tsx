import { ArrowBack, ArrowForward, Upload } from '@mui/icons-material';
import { Box, CircularProgress, Fab, Stack, Typography } from '@mui/material';
import { AnimatedCheckIcon } from '~/features/ui/icons/lottie/AnimatedCheckIcon';
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
	onBack: () => void;
	onForward: () => void;
	forwardDisabled?: boolean;
	onUploadClick: () => void;
	isUploading: boolean;
	loadSuccessIcon: boolean;
};
export const UploadBackForward = ({
	onBack,
	onForward,
	forwardDisabled = false,
	onUploadClick,
	isUploading,
	loadSuccessIcon,
}: Props) => {
	const renderNextIcon = () => {
		if (loadSuccessIcon) {
			return <AnimatedCheckIcon />;
		} else if (isUploading) {
			return <CircularProgress size={28} />;
		}
		return <ArrowForward />;
	};
	return (
		<>
			<Stack
				position={'fixed'}
				mt={-4.5}
				bottom={20}
				width={'100%'}
				textAlign={'center'}
				alignItems={'center'}
				justifyContent={'center'}
				zIndex={2}
				spacing={2}
				direction={'row'}
				left={0}
			>
				<Fab onClick={() => onBack()} data-cy="soc-interview-back-button" variant="circular" sx={buttonStyle}>
					<ArrowBack />
				</Fab>
				<Stack>
					<Fab
						onClick={onUploadClick}
						data-cy="upload-button"
						color="primary"
						sx={{
							color: 'primary',
							mt: 1.75,
							width: '72px',
							height: '72px',
							boxShadow: 'none',
							'&.Mui-disabled': {
								backgroundColor: '#FFF',
								color: theme.palette.disabledButtonAccentColor,
								border: `2px solid ${theme.palette.disabledButtonAccentColor}`,
							},
						}}
					>
						<Upload />
					</Fab>
					<Typography variant="caption">Upload</Typography>
				</Stack>
				<Fab
					onClick={onForward}
					disabled={forwardDisabled}
					data-cy="soc-interview-next-button"
					variant="circular"
					sx={buttonStyle}
				>
					{renderNextIcon()}
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
