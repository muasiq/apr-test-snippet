import { Box } from '@mui/material';
import { getDriveEndTime } from '~/assessments/apricot/data-renderers/util';
import { formatHour } from '~/common/utils/dateFormat';
import { DataRenderer } from './DataRenderer';
import type { PatientDataProps } from './PatientDataProps';

const label = 'Drive End Time';

function getValue({ patientData }: PatientDataProps) {
	const driveEndTime = getDriveEndTime(patientData);
	return driveEndTime ? formatHour(driveEndTime) : 'N/A';
}

export function getSerializedValue(props: PatientDataProps) {
	return { label, value: getValue(props) };
}

export const Input = ({ patientData, print }: PatientDataProps) => {
	return (
		<Box ml={2}>
			<DataRenderer
				label={label}
				name="DriveEndTime"
				type="text"
				value={getValue({ patientData })}
				print={print}
				canCopy={false}
			/>
		</Box>
	);
};
