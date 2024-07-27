import { zodResolver } from '@hookform/resolvers/zod';
import { Autocomplete, Stack, TextField } from '@mui/material';
import { Controller, FieldPath, useForm } from 'react-hook-form';
import { useAlert } from '~/common/hooks/useAlert';
import { RouterOutputs, api } from '~/common/utils/api';
import { FixedBottomSaveButton } from '~/features/ui/buttons/FixedBottomSaveButton';
import { ExpandableCardWithHeaders } from '~/features/ui/cards/ExpandableCardWithHeaders';
import { additionalDropdownConfigurationSchema } from '~/server/api/routers/organization/organization.inputs';

type DropdownConfigInput = RouterOutputs['organization']['getAdditionalDropdownConfiguration'];

type Props = {
	additionalDropdownConfiguration: DropdownConfigInput;
};
export function AdditionalDropdownConfiguration({ additionalDropdownConfiguration }: Props): JSX.Element {
	const alert = useAlert();
	const updateAdditionalDropdownsMutation = api.organization.updateAdditionalDropdownConfiguration.useMutation({
		onSuccess: () => {
			alert.addSuccessAlert({ message: 'Additional Dropdown Configuration Saved' });
		},
		onError: (e: unknown) => {
			console.error('error saving additional dropdown configuration', e);
			alert.addErrorAlert({ message: 'Error saving Additional Dropdown Configuration' });
		},
	});

	const form = useForm<DropdownConfigInput>({
		resolver: zodResolver(additionalDropdownConfigurationSchema),
		defaultValues: additionalDropdownConfiguration,
	});

	return (
		<>
			<ExpandableCardWithHeaders
				title="Additional Dropdown Options"
				subheader="Manage various options used during patient intake and documentation"
				height="100%"
			>
				<Stack direction="column" spacing={2}>
					{fieldValueLabelList.map(({ field, label }) => {
						return (
							<Controller
								key={field}
								name={field}
								control={form.control}
								render={({ field: { value, onChange }, fieldState: { error } }) => (
									<Autocomplete
										multiple
										fullWidth
										freeSolo
										disableClearable={true}
										value={value as string[]}
										onChange={(_, newValue) => {
											onChange(newValue);
										}}
										options={[] as string[]}
										renderInput={(params) => (
											<TextField
												label={label}
												{...params}
												error={!!error}
												helperText={error ? error.message : ''}
											/>
										)}
									/>
								)}
							/>
						);
					})}
					<FixedBottomSaveButton
						width="100%"
						show={form.formState.isDirty}
						isLoading={updateAdditionalDropdownsMutation.isLoading}
						onClick={async () => {
							await form.handleSubmit(
								async (values) => {
									await updateAdditionalDropdownsMutation.mutateAsync(values);
									form.reset(form.getValues());
								},
								(error) => console.log(error),
							)();
						}}
					/>
				</Stack>
			</ExpandableCardWithHeaders>
		</>
	);
}

const fieldValueLabelList: { field: FieldPath<DropdownConfigInput>; label: string }[] = [
	{ field: 'additionalMedicationDescriptors', label: 'Additional Medication Descriptors' },
	{ field: 'advanceDirectiveType', label: 'Advance Directive Type' },
	{ field: 'advanceDirectiveContents', label: 'Advance Directive Contents' },
	{ field: 'attachmentOptions', label: 'Attachment Options' },
	{ field: 'attachmentLocations', label: 'Attachment Locations' },
	{ field: 'emergencyContactType', label: 'Emergency Contact Type' },
	{ field: 'facilityType', label: 'Facility Type' },
	{ field: 'medicationFrequency', label: 'Medication Frequency' },
	{ field: 'medicationRoute', label: 'Medication Route' },
	{ field: 'patientContactRelationship', label: 'Patient Contact Relationship' },
	{ field: 'patientContactAvailability', label: 'Patient Contact Availability' },
	{ field: 'payorType', label: 'Payor Type' },
	{ field: 'serviceLocations', label: 'Service Locations' },
	{ field: 'supplyDeliveryMethod', label: 'Supply Delivery Method' },
	{ field: 'vaccinationType', label: 'Vaccination Type' },
	{ field: 'vaccinationSource', label: 'Vaccination Source' },
];
