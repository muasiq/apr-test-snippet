import { Grid, Stack, Typography } from '@mui/material';
import { CopyButton } from '~/features/ui/buttons/CopyButton';
import { addressFormat } from '../../../common/utils/addressFormat';
import { DataRenderer } from './DataRenderer';
import { PatientDataProps } from './PatientDataProps';

const label = 'Patient Address';

function getValue({ patientData }: PatientDataProps) {
	return addressFormat(patientData);
}

export function getSerializedValue(props: PatientDataProps) {
	return { label, value: getValue(props) };
}

export const Input = ({ patientData, print }: PatientDataProps) => {
	return (
		<Stack
			direction={print ? 'row' : 'column'}
			pl={2}
			spacing={print ? 2 : 0}
			alignItems={print ? 'start' : 'stretch'}
		>
			<Stack
				direction="row"
				alignItems="center"
				flexShrink={0}
				pt={print ? 2 : 0}
				pb={2}
				justifyContent="space-between"
			>
				<Typography variant={print ? 'body1' : 'body1b'}>{label}</Typography>
				{!print && <CopyButton getTextToCopy={() => getValue({ patientData })} />}
			</Stack>
			<Grid container spacing={2}>
				<Grid item xs={12} sm={6}>
					<DataRenderer
						name="address1"
						label="Street Address"
						hideHeading
						value={patientData.address1 ?? ''}
						print={print}
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<DataRenderer name="city" label="City" hideHeading value={patientData.city ?? ''} print={print} />
				</Grid>
				<Grid item xs={12} sm={6}>
					<DataRenderer
						name="state"
						label="State"
						hideHeading
						value={patientData.state ?? ''}
						print={print}
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<DataRenderer name="zip" label="Zip" hideHeading value={patientData.zip ?? ''} />
				</Grid>
			</Grid>
		</Stack>
	);
};
