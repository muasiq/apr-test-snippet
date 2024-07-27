import { Box } from '@mui/material';
import { getVitalSignMeasurementTime } from '~/assessments/apricot/data-renderers/util';
import { formatHour } from '~/common/utils/dateFormat';
import { DataRenderer } from './DataRenderer';
import type { PatientDataProps } from './PatientDataProps';

const label = 'Vital Signs Measurement Time';

function getValue({ patientData }: PatientDataProps) {
	const measurementTime = getVitalSignMeasurementTime(patientData);
	return measurementTime ? formatHour(measurementTime) : 'N/A';
}

export function getSerializedValue(props: PatientDataProps) {
	return { label, value: getValue(props) };
}

export const Input = ({ patientData, print }: PatientDataProps) => {
	return (
		<Box ml={2}>
			<DataRenderer
				label={label}
				name="VitalSignMeasurementTime"
				type="text"
				value={getValue({ patientData })}
				print={print}
				canCopy={false}
			/>
		</Box>
	);
};
