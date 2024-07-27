import { Box } from '@mui/material';
import { DataRenderer } from './DataRenderer';
import type { PatientDataProps } from './PatientDataProps';

const label = 'Patient Name';

function getValue({ patientData }: PatientDataProps) {
	return `${patientData.firstName} ${patientData.lastName}`;
}

export function getSerializedValue(props: PatientDataProps) {
	return { label, value: getValue(props) };
}

export const Input = ({ patientData, print }: PatientDataProps) => {
	return (
		<Box ml={2}>
			<DataRenderer label={label} name="name" type="text" value={getValue({ patientData })} print={print} />
		</Box>
	);
};
