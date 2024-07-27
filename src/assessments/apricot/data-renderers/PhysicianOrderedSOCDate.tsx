import { Box, Stack } from '@mui/material';
import { DataRenderer } from './DataRenderer';
import { PatientDataProps } from './PatientDataProps';

const label = 'Date of Physician Ordered Start Of Care';

function getValue({ patientData }: PatientDataProps) {
	return patientData.physicianOrderedSOCDateNA ? 'N/A' : patientData.physicianOrderedSOCDate?.toISOString() ?? '';
}

export function getSerializedValue(props: PatientDataProps) {
	return { label, value: getValue(props) };
}

export const Input = ({ patientData, print }: PatientDataProps) => {
	return (
		<Stack ml={2} direction="row" alignItems="center" spacing={1}>
			<Box flexGrow={1}>
				<DataRenderer
					label={label}
					name="physicianOrderedSOCDate"
					type="date"
					value={patientData.physicianOrderedSOCDate?.toISOString() ?? ''}
					print={print}
				/>
			</Box>
			<DataRenderer
				label="N/A"
				name="physicianOrderedSOCDateNA"
				type="checkbox"
				value={!!patientData.physicianOrderedSOCDateNA}
				print={print}
			/>
		</Stack>
	);
};
