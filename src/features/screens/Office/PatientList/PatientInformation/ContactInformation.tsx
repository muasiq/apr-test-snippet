import { Box, Grid, Typography } from '@mui/material';
import { Control } from 'react-hook-form';
import { FormPatternFormatField, FormTextField } from '~/features/ui/form-inputs';
import { CreatePatientInput } from '../../../../../server/api/routers/patient/patient.inputs';

type Props = {
	control: Control<CreatePatientInput>;
	formReadonly?: boolean;
};

export const ContactInformation = ({ control, formReadonly }: Props): JSX.Element => {
	return (
		<Box>
			<Typography variant="h6" mb={2}>
				Patient Contact Information
			</Typography>
			<Grid container spacing={2}>
				<Grid item xs={12} sm={6}>
					<FormPatternFormatField
						patternFormatProps={{
							format: '(###) ###-####',
							mask: '_',
						}}
						control={control}
						name="phoneNumber"
						label="Primary Phone"
						readOnly={formReadonly}
						data-cy="patient-phone-input"
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<FormPatternFormatField
						patternFormatProps={{
							format: '(###) ###-####',
							mask: '_',
						}}
						control={control}
						name="mobilePhoneNumber"
						label="Mobile Phone (Optional)"
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
						name="alternatePhoneNumber"
						label="Alternate Phone (Optional)"
						readOnly={formReadonly}
					/>
				</Grid>
				<Grid item xs={12}>
					<FormTextField
						multiline
						control={control}
						name="contactNotes"
						label="Notes (Optional)"
						readOnly={formReadonly}
					/>
				</Grid>
			</Grid>
		</Box>
	);
};
