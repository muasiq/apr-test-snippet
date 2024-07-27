import { Box, Grid, Typography } from '@mui/material';
import { Control } from 'react-hook-form';
import { FormPatternFormatField, FormSelect, FormTextField } from '~/features/ui/form-inputs';
import { CreatePatientInput } from '../../../../../server/api/routers/patient/patient.inputs';

type Props = {
	control: Control<CreatePatientInput>;
	formReadonly?: boolean;
	facilityTypeOptions: string[];
};

export const ReferralSource = ({ control, formReadonly, facilityTypeOptions }: Props): JSX.Element => {
	return (
		<Box>
			<Typography variant="h6" mb={2}>
				Referral Source
			</Typography>
			<Grid container spacing={2}>
				<Grid item xs={12} sm={6}>
					<FormTextField
						control={control}
						name="PatientReferralSource.contactName"
						label="Contact Name"
						readOnly={formReadonly}
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<FormPatternFormatField
						patternFormatProps={{
							format: '(###) ###-####',
							mask: '_',
						}}
						control={control}
						name="PatientReferralSource.contactPhone"
						label="Contact Phone"
						readOnly={formReadonly}
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<FormTextField
						control={control}
						name="PatientReferralSource.facilityName"
						label="Facility Name (Optional)"
						readOnly={formReadonly}
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<FormSelect
						control={control}
						name="PatientReferralSource.facilityType"
						label="Facility Type"
						freeSolo
						options={facilityTypeOptions.map((v) => ({ value: v, label: v }))}
						readOnly={formReadonly}
					/>
				</Grid>
			</Grid>
		</Box>
	);
};
