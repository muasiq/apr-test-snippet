import { Box, Grid, Stack, Typography } from '@mui/material';
import { ConfigurationType, Gender } from '@prisma/client';
import { Control, useWatch } from 'react-hook-form';
import {
	FormDatePicker,
	FormInlineCheckbox,
	FormPatternFormatField,
	FormSelect,
	FormTextField,
} from '~/features/ui/form-inputs';
import { CreatePatientInput, UpdatePatientInput } from '../../../../../server/api/routers/patient/patient.inputs';

type Props = {
	control: Control<CreatePatientInput | UpdatePatientInput>;
	configurationType?: ConfigurationType;
	formReadonly?: boolean;
};
export const BasicInformation = ({ control, formReadonly = false }: Props): JSX.Element => {
	const showId = useWatch({ control, name: 'id' });
	const isSocialSecurityUnknown = useWatch({ control, name: 'socialSecurityUnknown' });

	return (
		<Box>
			<Typography mb={2} variant="h6">
				Basic Information
			</Typography>
			<Grid container spacing={2}>
				<Grid item xs={12} sm={6}>
					<FormTextField
						data-cy="patient-first-name-input"
						control={control}
						name="firstName"
						label="First Name"
						readOnly={formReadonly}
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<FormTextField
						data-cy="patient-middle-name-input"
						control={control}
						name="middleName"
						label="Middle Initial (Optional)"
						readOnly={formReadonly}
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<FormTextField
						data-cy="patient-last-name-input"
						control={control}
						name="lastName"
						label="Last Name"
						readOnly={formReadonly}
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<FormTextField
						data-cy="patient-suffix-input"
						control={control}
						name="suffix"
						label="Suffix (Optional)"
						readOnly={formReadonly}
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<FormDatePicker
						dataCy="patient-dob-input"
						control={control}
						name="dateOfBirth"
						label="Date of Birth"
						readOnly={formReadonly}
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<FormSelect
						data-cy="patient-gender-input"
						control={control}
						name="gender"
						label="Gender"
						options={Object.values(Gender).map((v) => ({ value: v, label: v }))}
						readOnly={formReadonly}
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<Stack direction="row" alignItems="center">
						<FormPatternFormatField
							data-cy="patient-social-security-input"
							disabled={!!isSocialSecurityUnknown}
							patternFormatProps={{
								format: '###-##-####',
								mask: '_',
							}}
							control={control}
							name="socialSecurityNumber"
							label="Social Security Number"
							readOnly={formReadonly}
						/>
						<Box pr={1.5}>
							<FormInlineCheckbox
								control={control}
								label="Unknown"
								name="socialSecurityUnknown"
								readOnly={formReadonly}
							/>
						</Box>
					</Stack>
				</Grid>
				<Grid item xs={12} sm={6}>
					<FormTextField
						data-cy="emr-id-input"
						control={control}
						name="EMRIdentifier"
						label={'Episode ID'}
						readOnly={formReadonly}
					/>
				</Grid>
				{showId && (
					<Grid item xs={12} sm={6}>
						<FormTextField data-cy="patient-id" control={control} name="id" label="Apricot ID" readOnly />
					</Grid>
				)}
			</Grid>
		</Box>
	);
};
