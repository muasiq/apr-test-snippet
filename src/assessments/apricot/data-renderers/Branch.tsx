import { Box } from '@mui/material';
import { DataRenderer } from './DataRenderer';
import type { PatientDataProps } from './PatientDataProps';

const label = 'Branch';

function getValue({ patientData }: PatientDataProps) {
	return patientData.Location?.name ?? '';
}

export function getSerializedValue(props: PatientDataProps) {
	return { label, value: getValue(props) };
}

export const Input = ({ patientData, print }: PatientDataProps) => {
	return (
		<Box ml={2}>
			<DataRenderer label={label} name="branch" type="text" value={getValue({ patientData })} print={print} />
		</Box>
	);
};
