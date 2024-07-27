import { Box } from '@mui/material';
import { Gender } from '@prisma/client';
import { DataRenderer } from './DataRenderer';
import type { PatientDataProps } from './PatientDataProps';

const options = Object.values(Gender).map((g) => ({ value: g, label: g }));

const label = 'Gender';

const getValue = ({ patientData }: PatientDataProps) => {
	return patientData.gender ?? '';
};

export function getSerializedValue(props: PatientDataProps) {
	return { label, value: getValue(props) };
}

export const Input = ({ patientData, print }: PatientDataProps) => {
	return (
		<Box ml={2}>
			<DataRenderer
				label={label}
				name="gender"
				type="select"
				value={getValue({ patientData })}
				options={options}
				print={print}
			/>
		</Box>
	);
};
