import { Box } from '@mui/material';
import { formatDate } from '~/common/utils/dateFormat';
import { DataRenderer } from './DataRenderer';
import type { PatientDataProps } from './PatientDataProps';

const label = 'Patient Date of Birth';

function getValue({ patientData }: PatientDataProps) {
	return patientData.dateOfBirth.toISOString();
}

export function getSerializedValue(props: PatientDataProps) {
	return { label, value: formatDate(getValue(props)) };
}

export const Input = ({ patientData, print }: PatientDataProps) => {
	return (
		<Box ml={2}>
			<DataRenderer label={label} name="dob" type="date" value={getValue({ patientData })} print={print} />
		</Box>
	);
};
