import { Box } from '@mui/material';
import { formatDate } from '~/common/utils/dateFormat';
import { DataRenderer } from './DataRenderer';
import { PatientDataProps } from './PatientDataProps';

const label = 'SOC Visit Date';

function getValue({ patientData }: PatientDataProps) {
	return patientData.SOCVisitDate?.toISOString() ?? '';
}

export function getSerializedValue(props: PatientDataProps) {
	return { label, value: formatDate(getValue(props)) };
}

export const Input = ({ patientData, print }: PatientDataProps) => {
	return (
		<Box ml={2}>
			<DataRenderer
				label={label}
				name="socVisitDate"
				type="date"
				value={getValue({ patientData })}
				print={print}
			/>
		</Box>
	);
};
