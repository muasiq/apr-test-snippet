import { Text, View } from '@react-pdf/renderer';
import { jsx } from 'react/jsx-runtime';
import { formatDate } from '~/common/utils/dateFormat';
import { PatientWithJoins } from '~/server/api/routers/patient/patient.types';
import { styles } from '../styles';

export function Header({ patientData }: { patientData: PatientWithJoins }) {
	return jsx(View, {
		style: styles.header,
		fixed: true,
		children: [
			jsx(View, {
				key: 'info',
				style: styles.headerText,
				children: [
					jsx(Text, {
						key: 'patient-name',
						style: { color: '#000', marginBottom: 2 },
						children: `${patientData.firstName} ${patientData.lastName}`,
					}),
					jsx(Text, {
						key: 'visit-date',
						children: `SOC: ${formatDate(patientData.SOCVisitDate?.toISOString())}`,
					}),
					jsx(Text, {
						key: 'apr-id',
						children: `APR ID: #${patientData.id}`,
					}),
					jsx(Text, {
						key: 'emr-id',
						children: `SOC ID: #${patientData.EMRIdentifier}`,
					}),
				],
			}),
			jsx(Text, {
				key: 'visit-type',
				style: styles.pill,
				children: 'START OF CARE',
			}),
		],
	});
}
