import { Box } from '@mui/material';
import { formatHour } from '~/common/utils/dateFormat';
import { DataRenderer } from './DataRenderer';
import { PatientDataProps } from './PatientDataProps';

const label = 'SOC Visit Start Time';

function getValue({ patientData }: PatientDataProps) {
	return patientData.SOCVisitTime ? formatHour(patientData.SOCVisitTime) : 'N/A';
}

export function getSerializedValue(props: PatientDataProps) {
	return { label, value: getValue(props) };
}

export const Input = ({ patientData, print }: PatientDataProps) => {
	return (
		<Box ml={2}>
			<DataRenderer
				label={label}
				name="socVisitStartTime"
				type="text"
				value={getValue({ patientData })}
				print={print}
				canCopy={false}
			/>
		</Box>
	);
};
