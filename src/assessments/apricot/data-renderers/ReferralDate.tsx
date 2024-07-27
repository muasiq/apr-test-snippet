import { Box } from '@mui/material';
import { formatDate } from '~/common/utils/dateFormat';
import { DataRenderer } from './DataRenderer';
import { PatientDataProps } from './PatientDataProps';

const label = 'Referral Date';

function getValue({ patientData }: PatientDataProps) {
	return patientData.PatientReferralSource?.referralDate?.toISOString() ?? '';
}

export function getSerializedValue(props: PatientDataProps) {
	return { label, value: formatDate(getValue(props)) };
}

export const Input = ({ patientData, print }: PatientDataProps) => {
	return (
		<Box ml={2}>
			<DataRenderer
				label={label}
				name="referralDate"
				type="date"
				value={getValue({ patientData })}
				print={print}
			/>
		</Box>
	);
};
