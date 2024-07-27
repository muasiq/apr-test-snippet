import { Autocomplete, AutocompleteProps, Box, Grid, Stack, TextField, Typography } from '@mui/material';
import { ProviderType, ReferringPhysician } from '@prisma/client';
import { forwardRef, useEffect, useState } from 'react';
import { ArrayPath, Control, Controller, FieldError, useFieldArray } from 'react-hook-form';
import { useDebounceValue } from 'usehooks-ts';
import { api } from '~/common/utils/api';
import { AddAndRemoveButtons } from '~/features/screens/Field/PatientDetail/components/AddAndRemoveButtons';
import { FormPatternFormatField, FormSelect, FormTextField } from '~/features/ui/form-inputs';
import { providerTypeToText } from '../../../../../common/utils/providerTypeToText';
import { CreatePatientInput } from '../../../../../server/api/routers/patient/patient.inputs';
import { getAddButtonTextForFieldArray } from './util/fieldArrayUtil';

type Props = {
	control: Control<CreatePatientInput>;
	formReadonly?: boolean;
};
export const AssociatedPhysician = ({ control, formReadonly }: Props): JSX.Element => {
	const { fields, append, remove } = useFieldArray({
		control,
		name: 'PatientAssociatedPhysicians' as ArrayPath<CreatePatientInput>,
	});

	const addButtonText = getAddButtonTextForFieldArray(fields, 'Provider', undefined, !!fields.length);

	function handleAdd() {
		append({ name: '', phone: '', type: undefined, notes: '' });
	}

	return (
		<Stack rowGap={2}>
			<Typography variant="h6">Associated Providers</Typography>
			{fields.map((_, index) => (
				<Box key={index}>
					<Grid container spacing={2}>
						<Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
							<Typography>{index === 0 ? 'Primary Provider' : `Secondary Provider ${index}`}</Typography>
						</Grid>
						<Grid item xs={12} sm={6}>
							<Controller
								name={`PatientAssociatedPhysicians.${index}.name`}
								control={control}
								render={({ field, fieldState: { error } }) => (
									<PhysicianAutocomplete {...field} error={error} />
								)}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<FormPatternFormatField
								patternFormatProps={{
									format: '(###) ###-####',
									mask: '_',
								}}
								control={control}
								data-cy="provider-phone-input"
								name={`PatientAssociatedPhysicians.${index}.phone`}
								label="Phone"
								readOnly={formReadonly}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<FormSelect
								control={control}
								data-cy="provider-type-input"
								name={`PatientAssociatedPhysicians.${index}.providerType`}
								label="Provider Type"
								options={Object.values(ProviderType)
									.filter((v) => v !== ProviderType.ReferringPhysician)
									.map((v) => ({
										value: v,
										label: providerTypeToText(v),
									}))}
								readOnly={formReadonly}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<FormSelect
								control={control}
								data-cy="provider-referring-physician-input"
								name={`PatientAssociatedPhysicians.${index}.referringPhysician`}
								label="Referring Physician?"
								options={Object.values(ReferringPhysician).map((v) => ({ value: v, label: v }))}
								readOnly={formReadonly}
							/>
						</Grid>
						<Grid item xs={12}>
							<FormTextField
								multiline
								control={control}
								name={`PatientAssociatedPhysicians.${index}.notes`}
								label="Notes (Optional)"
								readOnly={formReadonly}
							/>
						</Grid>
					</Grid>
					<Box mt={1}>
						<AddAndRemoveButtons
							handleAdd={handleAdd}
							handleRemove={() => remove(index)}
							addText={addButtonText}
							readOnly={!!formReadonly}
							shouldShowRemove={fields.length > 1}
							shouldShowAdd={index === fields.length - 1}
						/>
					</Box>
				</Box>
			))}
			{fields.length === 0 && (
				<Box mt={1}>
					<AddAndRemoveButtons
						handleAdd={handleAdd}
						addText={addButtonText}
						readOnly={!!formReadonly}
						shouldShowRemove={false}
						shouldShowAdd={true}
					/>
				</Box>
			)}
		</Stack>
	);
};

type PhysicianAutocompleteProps = Omit<
	AutocompleteProps<string, false, false, true>,
	'onChange' | 'renderInput' | 'options'
> & {
	onChange: (val?: string) => void;
	error?: FieldError;
};

export const PhysicianAutocomplete = forwardRef<HTMLInputElement, PhysicianAutocompleteProps>(
	({ value, onChange, error }, ref) => {
		const [name, setName] = useState('');
		const [debouncedName, setDebouncedName] = useDebounceValue<string>(name, 200);
		const physiciansQuery = api.organization.getAssociatedPhysicians.useQuery({
			searchText: debouncedName,
			page: 0,
			pageSize: 100,
			sortBy: 'name',
			sortDirection: 'asc',
		});

		useEffect(() => {
			setDebouncedName(name);
		}, [name, setDebouncedName]);

		return (
			<Autocomplete
				value={value ?? ''}
				freeSolo
				inputValue={name}
				onInputChange={(event, value) => {
					setName(value);
					physiciansQuery.data?.count === 0 ? onChange(value) : null;
				}}
				onChange={(_, newValue) => (typeof newValue === 'string' ? onChange(newValue) : onChange(newValue?.id))}
				options={
					physiciansQuery.data?.list.map((item) => ({
						id: item.name,
						label: item.name,
					})) ?? []
				}
				renderInput={(params) => (
					<TextField
						{...params}
						label="Full Name"
						data-cy="provider-fullname-input"
						error={!!error}
						helperText={error ? error.message : ''}
						inputRef={ref}
					/>
				)}
			/>
		);
	},
);

PhysicianAutocomplete.displayName = 'PhysicianAutocomplete';
