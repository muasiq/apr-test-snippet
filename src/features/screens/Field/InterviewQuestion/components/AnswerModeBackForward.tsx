import { ArrowBack, ArrowForward, Keyboard } from '@mui/icons-material';
import { Box, Fab, SpeedDial, SpeedDialAction, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { WaveformIcon } from '~/features/ui/icons/WaveformIcon';
import theme from '../../../../../styles/theme';

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
	onForward: (dictate: boolean) => void;
	onBackward?: () => void;
};
export const AnswerModeBackForward = ({ onForward, onBackward }: Props) => {
	const router = useRouter();
	const { dictate: dictateQueryParam } = router.query as { dictate: string };
	const [open, setOpen] = useState(false);
	const [dictate, setDictate] = useState(dictateQueryParam === undefined || dictateQueryParam === 'true');

	const handleArrowBackClick = () => {
		if (onBackward) {
			onBackward();
		} else {
			router.back(); //TODO: This should go back to the correct question, not be router.back()
		}
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
				{!open && (
					<Fab
						onClick={handleArrowBackClick}
						data-cy="soc-interview-back-button"
						variant="circular"
						sx={buttonStyle}
					>
						<ArrowBack />
					</Fab>
				)}
				<Stack>
					<SpeedDial
						open={open}
						onOpen={() => setOpen(true)}
						onClose={() => setOpen(false)}
						ariaLabel="answer mode"
						icon={dictate ? <WaveformIcon /> : <Keyboard />}
						sx={{
							'.MuiSpeedDial-fab': {
								width: 72,
								height: 72,
								'.MuiSvgIcon-root': {
									fontSize: '31px',
								},
							},
						}}
						data-cy="soc-interview-answer-mode"
					>
						{open && [
							<SpeedDialAction
								onClick={() => {
									setDictate(true);
									setOpen(false);
								}}
								tooltipOpen={true}
								icon={<WaveformIcon customColor="grayText" />}
								key={'record'}
								tooltipTitle={'Voice'}
								data-cy="soc-interview-answer-mode-voice"
							/>,
							<SpeedDialAction
								onClick={() => {
									setDictate(false);
									setOpen(false);
								}}
								tooltipOpen={true}
								icon={<Keyboard sx={{ color: 'grayText' }} />}
								key={'type'}
								tooltipTitle={'Type'}
								sx={{ color: 'green' }}
								data-cy="soc-interview-answer-mode-text"
							/>,
						]}
					</SpeedDial>
					<Typography variant="caption">{dictate ? 'Voice Mode' : 'Text Mode'}</Typography>
				</Stack>
				{!open && (
					<Fab
						onClick={() => onForward(dictate)}
						data-cy="soc-interview-next-button"
						variant="circular"
						sx={buttonStyle}
					>
						<ArrowForward />
					</Fab>
				)}
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
