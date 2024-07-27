import { Box } from '@mui/material';
import { DataRenderer } from './DataRenderer';
import { PatientDataProps } from './PatientDataProps';

const label = 'Time in Home';

function getValue({ patientData }: PatientDataProps) {
	const time = patientData.NurseInterview?.minutesSpentWithPatient ?? 0;

	const hours = Math.floor(time / 60);
	const minutes = time % 60;

	const formatted = (hours ? `${hours}h ` : '') + `${minutes}m`;

	return time ? formatted : 'NA';
}

export function getSerializedValue(props: PatientDataProps) {
	return { label, value: getValue(props) };
}

export const Input = ({ patientData, print }: PatientDataProps) => {
	return (
		<Box ml={2}>
			<DataRenderer
				label={label}
				name="minutesSpentWithPatient"
				type="text"
				value={getValue({ patientData })}
				print={print}
			/>
		</Box>
	);
};
