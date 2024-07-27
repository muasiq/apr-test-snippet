import { Box } from '@mui/material';
import { getSocVisitEndTime } from '~/assessments/apricot/data-renderers/util';
import { formatHour } from '~/common/utils/dateFormat';
import { DataRenderer } from './DataRenderer';
import type { PatientDataProps } from './PatientDataProps';

const label = 'SOC Visit End Time';

function getValue({ patientData }: PatientDataProps) {
	const endTime = getSocVisitEndTime(patientData);
	return endTime ? formatHour(endTime) : 'N/A';
}

export function getSerializedValue(props: PatientDataProps) {
	return { label, value: getValue(props) };
}

export const Input = ({ patientData, print }: PatientDataProps) => {
	return (
		<Box ml={2}>
			<DataRenderer
				label={label}
				name="socVisitEndTime"
				type="text"
				value={getValue({ patientData })}
				print={print}
				canCopy={false}
			/>
		</Box>
	);
};
