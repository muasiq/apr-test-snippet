import { Card, CardActionArea, CardContent, Stack, Typography } from '@mui/material';
import { Patient } from '@prisma/client';
import Link from 'next/link';
import { forwardRef } from 'react';
import { formatDate } from '~/common/utils/dateFormat';
import theme from '~/styles/theme';
import { PatientStatusChip } from '../../chips/PatientStatusChip';

type Props = {
	patient: Patient;
	isLastCard?: boolean;
};
export const PatientListCard = forwardRef<HTMLAnchorElement, Props>(({ patient, isLastCard }, ref) => {
	return (
		<Link href={`/field/patient/${patient.id}`} key={patient.id} passHref ref={ref}>
			<Card
				data-cy="patient-list-card"
				sx={{
					bgcolor: theme.palette.glass,
					borderBottom: !isLastCard ? '2px solid #FFF' : 'none',
					borderRadius: 0,
					boxShadow: 'none',
				}}
			>
				<CardActionArea>
					<CardContent
						sx={{
							p: 2,
						}}
					>
						<Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
							<Stack>
								<Typography variant="body1">
									{patient.firstName} {patient.lastName}
								</Typography>
								<Typography color={theme.palette.text.secondary} variant="body2">
									{formatDate(patient.dateOfBirth)}
								</Typography>
							</Stack>
							<Stack direction={'row'} alignItems={'center'} spacing={4}>
								<PatientStatusChip size="medium" status={patient.status} />
							</Stack>
						</Stack>
					</CardContent>
				</CardActionArea>
			</Card>
		</Link>
	);
});
PatientListCard.displayName = 'PatientListCard';
