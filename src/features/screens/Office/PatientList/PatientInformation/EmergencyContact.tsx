import { Box, Grid, Stack, Typography } from '@mui/material';
import { State } from '@prisma/client';
import { startCase } from 'lodash';
import { ArrayPath, Control, Path, useFieldArray } from 'react-hook-form';
import { AddAndRemoveButtons } from '~/features/screens/Field/PatientDetail/components/AddAndRemoveButtons';
import { FormPatternFormatField, FormSelect, FormSelectChips, FormTextField } from '~/features/ui/form-inputs';
import { CreatePatientInput } from '../../../../../server/api/routers/patient/patient.inputs';
import { If } from '../../../../ui/util/If';
import { getAddButtonTextForFieldArray } from './util/fieldArrayUtil';

type Props = {
	control: Control<CreatePatientInput>;
	formReadonly?: boolean;
	emergencyContactTypeOptions: string[];
	relationshipTypeOptions: string[];
	availabilityTypeOptions: string[];
};

export const EmergencyContact = ({
	control,
	formReadonly,
	emergencyContactTypeOptions,
	relationshipTypeOptions,
	availabilityTypeOptions,
}: Props): JSX.Element => {
	const { fields, append, remove } = useFieldArray({
		control,
		name: 'PatientEmergencyContacts' as ArrayPath<CreatePatientInput>,
	});

	const addButtonText = getAddButtonTextForFieldArray(fields, 'Contact', undefined, true);

	return (
		<Stack rowGap={2}>
			<Typography variant="h6">Additional Patient Contacts</Typography>
			<If condition={!fields.length}>
				<AddAndRemoveButtons
					handleAdd={() => void append({ firstName: '', lastName: '', phone: '' })}
					addText={addButtonText}
					readOnly={!!formReadonly}
					shouldShowRemove={false}
					shouldShowAdd={true}
				/>
			</If>
			{fields.map((_, index) => (
				<Box key={index}>
					<Grid container spacing={2} key={`PatientEmergencyContacts-${index}`}>
						<Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
							<Typography>Contact {index + 1}</Typography>
						</Grid>
						<Grid item xs={12} sm={6}>
							<FormTextField
								data-cy="emergency-contact-first-name"
								control={control}
								name={`PatientEmergencyContacts[${index}].firstName` as Path<CreatePatientInput>}
								label="First Name"
								readOnly={formReadonly}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<FormTextField
								data-cy="emergency-contact-last-name"
								control={control}
								name={`PatientEmergencyContacts[${index}].lastName` as Path<CreatePatientInput>}
								label="Last Name"
								readOnly={formReadonly}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<FormSelectChips
								data-cy="emergency-contact-type"
								multiple
								control={control}
								name={`PatientEmergencyContacts[${index}].type` as Path<CreatePatientInput>}
								label="Contact Type"
								freeSolo
								options={emergencyContactTypeOptions.map((c) => ({
									label: startCase(c),
									value: c,
								}))}
								readOnly={formReadonly}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<FormSelect
								control={control}
								name={`PatientEmergencyContacts[${index}].relationship` as Path<CreatePatientInput>}
								label="Relationship"
								freeSolo
								options={relationshipTypeOptions.map((v) => ({
									value: v,
									label: v,
								}))}
								readOnly={formReadonly}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<FormPatternFormatField
								data-cy="emergency-contact-number"
								patternFormatProps={{
									format: '(###) ###-####',
									mask: '_',
								}}
								control={control}
								name={`PatientEmergencyContacts[${index}].phone` as Path<CreatePatientInput>}
								label="Primary Phone"
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
								name={`PatientEmergencyContacts[${index}].homePhone` as Path<CreatePatientInput>}
								label="Home Phone (Optional)"
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
								name={`PatientEmergencyContacts[${index}].mobilePhone` as Path<CreatePatientInput>}
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
								name={`PatientEmergencyContacts[${index}].alternatePhone` as Path<CreatePatientInput>}
								label="Alternate Phone (Optional)"
								readOnly={formReadonly}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<FormTextField
								control={control}
								name={`PatientEmergencyContacts[${index}].address` as Path<CreatePatientInput>}
								label="Address (Optional)"
								readOnly={formReadonly}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<FormTextField
								control={control}
								name={`PatientEmergencyContacts[${index}].city` as Path<CreatePatientInput>}
								label="City (Optional)"
								readOnly={formReadonly}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<FormSelect
								control={control}
								name={`PatientEmergencyContacts[${index}].state` as Path<CreatePatientInput>}
								label="State (Optional)"
								options={Object.values(State).map((v) => ({ value: v, label: v }))}
								readOnly={formReadonly}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<FormTextField
								control={control}
								name={`PatientEmergencyContacts[${index}].zip` as Path<CreatePatientInput>}
								label="Zip (Optional)"
								readOnly={formReadonly}
							/>
						</Grid>

						<Grid item xs={12}>
							<FormSelectChips
								multiple
								control={control}
								freeSolo
								name={`PatientEmergencyContacts[${index}].availability` as Path<CreatePatientInput>}
								label="Availability (Optional)"
								options={availabilityTypeOptions.map((c) => ({
									label: c,
									value: c,
								}))}
								readOnly={formReadonly}
							/>
						</Grid>
						<Grid item xs={12}>
							<FormTextField
								multiline
								control={control}
								name={`PatientEmergencyContacts[${index}].notes` as Path<CreatePatientInput>}
								label="Notes (Optional)"
								readOnly={formReadonly}
							/>
						</Grid>
					</Grid>
					<Box mt={1}>
						<AddAndRemoveButtons
							handleAdd={() => void append({ firstName: '', lastName: '', phone: '' })}
							handleRemove={() => void remove(index)}
							addText={addButtonText}
							readOnly={!!formReadonly}
							shouldShowAdd={index === fields.length - 1}
						/>
					</Box>
				</Box>
			))}
		</Stack>
	);
};
