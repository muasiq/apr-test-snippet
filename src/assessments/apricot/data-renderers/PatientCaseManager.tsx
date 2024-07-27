import { Box } from '@mui/material';
import { DataRenderer } from './DataRenderer';
import { PatientDataProps } from './PatientDataProps';

const label = 'Patient Case Manager';

function getValue({ patientData }: PatientDataProps) {
	return patientData.SOCVisitCaseManager?.name ?? '';
}

export function getSerializedValue(props: PatientDataProps) {
	return { label, value: getValue(props) };
}

export const Input = ({ patientData, print }: PatientDataProps) => {
	return (
		<Box ml={2}>
			<DataRenderer
				label={label}
				name="caseManager"
				type="text"
				value={getValue({ patientData })}
				print={print}
			/>
		</Box>
	);
};
