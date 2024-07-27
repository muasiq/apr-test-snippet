import { ArrowForward } from '@mui/icons-material';
import { Box, Card, CardContent, IconButton, Stack, Typography } from '@mui/material';
import { type RouterOutputs } from '~/common/utils/api';
import { formatPhoneNumber } from '~/common/utils/phoneNumberFormat';
import { PatientStatusChip } from '~/features/ui/chips/PatientStatusChip';
import theme from '~/styles/theme';

type Props = {
	patient: RouterOutputs['patient']['getById'];
	setOpenPatientDetails: () => void;
};

export const PatientDetailCard = ({ patient, setOpenPatientDetails }: Props) => {
	return (
		<Card
			sx={{
				width: '100%',
				bgcolor: theme.palette.glass,
				border: '2px solid #FFF',
				boxShadow: 'none',
				borderRadius: '24px',
				py: 3,
				px: 2,
			}}
		>
			<CardContent
				sx={{
					p: 0,
					'&.MuiCardContent-root:last-child': {
						pb: 0,
					},
				}}
			>
				<Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
					<Stack spacing={1}>
						<Typography variant="h5">
							{patient.firstName} {patient.lastName}
						</Typography>
						<PatientStatusChip status={patient.status} patientId={patient.id} />
						{patient.address1 && (
							<Box>
								<a
									target="_blank"
									href={`https://maps.google.com/maps?q=${patient.address1?.split(' ').join('+')}${
										patient.address2 ? `+${patient.address2.split(' ').join('+')}` : ''
									},+${patient.city},+${patient.state}+${patient.zip}`}
								>
									<Typography variant="body2">{patient.address1}</Typography>
									<Typography variant="body2">{patient.address2}</Typography>
									<Typography variant="body2">
										{patient.city}, {patient.state} {patient.zip}
									</Typography>
								</a>
							</Box>
						)}
						{patient.phoneNumber && (
							<Typography color={'primary'} variant="subtitle2">
								<a href={`tel:${patient.phoneNumber}`}> {formatPhoneNumber(patient.phoneNumber)}</a>
							</Typography>
						)}
					</Stack>
					<IconButton
						data-cy="patient-detail-card-open-button"
						onClick={() => setOpenPatientDetails()}
						size="small"
						disableRipple
						sx={{
							color: 'primary.main',
							bgcolor: 'primary.light',
							borderRadius: '50%',
							'&:hover': {
								bgcolor: 'primary.light',
								color: 'primary.main',
							},
						}}
					>
						<ArrowForward />
					</IconButton>
				</Stack>
			</CardContent>
		</Card>
	);
};
