import { Box, Stack } from '@mui/material';
import { DataRenderer } from './DataRenderer';
import { PatientDataProps } from './PatientDataProps';

const label = 'Social Security Number';

function getValue({ patientData }: PatientDataProps) {
	if (!!patientData.socialSecurityUnknown) {
		return 'Unknown';
	}
	return patientData.socialSecurityNumber ?? '';
}

export function getSerializedValue(props: PatientDataProps) {
	return { label, value: getValue(props) };
}

export const Input = ({ patientData, print }: PatientDataProps) => {
	return (
		<Stack pl={2} direction="row" alignItems="center">
			<Box flexGrow={1}>
				<DataRenderer
					label={label}
					name="ssn"
					type="pattern"
					format="###-##-####"
					value={patientData.socialSecurityNumber ?? ''}
					print={print}
				/>
			</Box>
			<DataRenderer
				label="Unknown"
				name="ssnUnknown"
				type="checkbox"
				value={!!patientData.socialSecurityUnknown}
				print={print}
			/>
		</Stack>
	);
};
