import { Add, ArrowDropUp } from '@mui/icons-material';
import { SpeedDial, SpeedDialAction } from '@mui/material';
import { useState } from 'react';
import { DocumentIcon } from '~/features/ui/icons/DocumentIcon';
import { UploadIcon } from '~/features/ui/icons/UploadIcon';
import theme from '~/styles/theme';

const fabProps = {
	sx: {
		border: `2px solid ${theme.palette.primary.main}`,
		boxShadow: 'none',
		'&:hover,&:focus,&:active': {
			boxShadow: 'none',
		},
	},
};

const speedDialTooltipStyles = {
	fontSize: '10px',
	color: '#FFF',
	bgcolor: '#3B1F2BE5',
	px: 1,
	boxShadow: 'none',
};

type Props = {
	handleNewFileClick: () => void;
	handleFromApricotClick: () => void;
};
export const UploadMedicationSpeedDial = ({ handleNewFileClick, handleFromApricotClick }: Props) => {
	const [openSpeedDial, setOpenSpeedDial] = useState(false);

	return (
		<>
			<ArrowDropUp
				sx={{
					position: 'absolute',
					bottom: 105,
					left: 0,
					right: 0,
					ml: 'auto',
					mr: 'auto',
					color: theme.palette.primary.main,
				}}
			/>
			<SpeedDial
				data-cy="medication-upload-speed-dial"
				open={openSpeedDial}
				onClick={() => setOpenSpeedDial((prev) => !prev)}
				onClose={(_event, reason) => {
					if (reason === 'toggle' || reason === 'blur') {
						setOpenSpeedDial(false);
					}
				}}
				ariaLabel="Med List Upload"
				icon={<Add sx={{ fontSize: '31px' }} />}
				sx={{
					position: 'absolute',
					bottom: 36,
					left: 0,
					right: 0,
					ml: 'auto',
					mr: 'auto',
					'.MuiSpeedDial-fab': {
						width: 72,
						height: 72,
					},
				}}
				FabProps={{
					onMouseEnter: (e) => e.stopPropagation(),
					sx: {
						boxShadow: 'none',
						'&:focus, &:hover, &:active': {
							boxShadow: 'none',
						},
					},
				}}
			>
				{openSpeedDial && [
					<SpeedDialAction
						data-cy="speed-dial-referral"
						key={'from-apricot'}
						onClick={handleFromApricotClick}
						icon={<DocumentIcon />}
						tooltipTitle="Select Pages from Referral Doc"
						tooltipOpen
						sx={{
							'& .MuiSpeedDialAction-staticTooltipLabel': {
								width: '80px',
								...speedDialTooltipStyles,
							},
						}}
						FabProps={fabProps}
					/>,

					<SpeedDialAction
						data-cy="speed-dial-new-file"
						key={'new-file'}
						onClick={handleNewFileClick}
						icon={<UploadIcon />}
						tooltipTitle="New File"
						tooltipOpen
						sx={{
							'& .MuiSpeedDialAction-staticTooltipLabel': {
								width: '60px',
								...speedDialTooltipStyles,
							},
						}}
						FabProps={fabProps}
					/>,
				]}
			</SpeedDial>
		</>
	);
};
