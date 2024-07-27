import { Card, CardActionArea, CardContent, Typography } from '@mui/material';
import { Patient } from '@prisma/client';
import Link from 'next/link';
import { formatDate } from '~/common/utils/dateFormat';

type Props = {
	patient: Patient;
	isLast: boolean;
};
export const ApricotAccordionPatientDetailItem = ({ patient, isLast }: Props) => {
	return (
		<Link href={`/field/patient/${patient.id}?step=1`}>
			<Card
				sx={{
					borderTop: '2px solid #FFF',
					borderRadius: 0,
					boxShadow: 'none',
					borderBottomLeftRadius: isLast ? '14px' : 0,
					borderBottomRightRadius: isLast ? '14px' : 0,
				}}
			>
				<CardActionArea>
					<CardContent>
						<Typography variant="body1">
							{patient.firstName} {patient.lastName}
						</Typography>
						<Typography variant="body2" color={'text.secondary'}>
							{formatDate(patient.SOCVisitDate)}
						</Typography>
					</CardContent>
				</CardActionArea>
			</Card>
		</Link>
	);
};
