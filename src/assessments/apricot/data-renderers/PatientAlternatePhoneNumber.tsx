import { Box } from '@mui/material';
import { formatPhoneNumber } from '~/common/utils/phoneNumberFormat';
import { DataRenderer } from './DataRenderer';
import type { PatientDataProps } from './PatientDataProps';

const label = 'Patient Alternate Phone Number';

function getValue({ patientData }: PatientDataProps) {
	return patientData.alternatePhoneNumber ?? '';
}

export function getSerializedValue(props: PatientDataProps) {
	return { label, value: formatPhoneNumber(getValue(props)) };
}

export function Input({ patientData, print }: PatientDataProps) {
	return (
		<Box ml={2}>
			<DataRenderer
				label={label}
				name="patientData.alternatePhoneNumber"
				type="pattern"
				format="(###) ###-####"
				value={getValue({ patientData })}
				print={print}
			/>
		</Box>
	);
}
