import { Add } from '@mui/icons-material';
import { CircularProgress, Fab, Stack, Typography } from '@mui/material';
import { ReactElement } from 'react';
import { RecordIcon } from '~/features/ui/icons/RecordIcon';
import { StopOutlinedIcon } from '~/features/ui/icons/StopOutlinedIcon';
import theme from '~/styles/theme';
import { RecorderStatus } from '../hooks/useAudioRecorder';

type Props = {
	hasTextResponse: boolean;
	onClick: () => void;
	disabled: boolean;
	status: RecorderStatus;
};
const ICON_FONT_SIZE = '31px';
export const DictationActionButton = ({ hasTextResponse, disabled, onClick, status }: Props) => {
	const recordButton = (): { text: string; fabColor: string; icon: ReactElement } => {
		if (status === 'loading') {
			return {
				text: 'Loading...',
				fabColor: 'primary',
				icon: <CircularProgress sx={{ color: '#FFF', fontSize: ICON_FONT_SIZE }} />,
			};
		} else if (status === 'paused') {
			return {
				text: 'Add More',
				fabColor: 'primary',
				icon: <Add sx={{ fontSize: ICON_FONT_SIZE }} />,
			};
		} else if (status === 'recording') {
			return {
				text: 'Stop',
				fabColor: 'error',
				icon: <StopOutlinedIcon sx={{ fontSize: ICON_FONT_SIZE }} />,
			};
		}
		return {
			text: hasTextResponse ? 'Answered with Text' : 'Record',
			fabColor: 'primary',
			icon: (
				<RecordIcon
					customColor={disabled ? theme.palette.disabledButtonAccentColor : undefined}
					sx={{ fontSize: ICON_FONT_SIZE }}
				/>
			),
		};
	};

	return (
		<Stack>
			<Fab
				data-cy="mic-button"
				onClick={onClick}
				disabled={disabled}
				color="primary"
				sx={{
					color: recordButton().fabColor,
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
				{recordButton().icon}
			</Fab>
			<Typography
				maxWidth={70}
				variant="caption"
				sx={{
					color: disabled ? theme.palette.disabledButtonAccentColor : 'inherit',
				}}
			>
				{recordButton().text}
			</Typography>
		</Stack>
	);
};
