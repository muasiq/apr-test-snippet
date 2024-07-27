import { Box } from '@mui/material';
import { DataRenderer } from './DataRenderer';
import { PatientDataProps } from './PatientDataProps';

const label = 'Drive Time';

function getValue({ patientData }: PatientDataProps) {
	return patientData.NurseInterview?.minutesSpentDriving ?? '';
}

export function getSerializedValue(props: PatientDataProps) {
	return { label, value: getValue(props) };
}

export const Input = ({ patientData, print }: PatientDataProps) => {
	return (
		<Box ml={2}>
			<DataRenderer
				label={label}
				name="minutesSpentDriving"
				type="text"
				value={getValue({ patientData })}
				print={print}
			/>
		</Box>
	);
};
