import { Box, Grid, Typography } from '@mui/material';
import { startCase } from 'lodash';
import { useEffect, useState } from 'react';
import { useController, type Control, type UseFormGetValues, type UseFormSetValue } from 'react-hook-form';
import { addressFormat } from '~/common/utils/addressFormat';
import { ParsedPlaceDetails } from '~/common/utils/googlePlaces';
import { FormSelect, FormTextField } from '~/features/ui/form-inputs';
import { AutocompleteAddress } from '~/features/ui/inputs/AutocompleteAddress';
import type { CreatePatientInput } from '~/server/api/routers/patient/patient.inputs';

type Props = {
	control: Control<CreatePatientInput>;
	formReadonly?: boolean;
	serviceLocationTypeOptions: string[];
	getValues: UseFormGetValues<CreatePatientInput>;
	setValue: UseFormSetValue<CreatePatientInput>;
};

export const ServiceLocation = ({ control, formReadonly, serviceLocationTypeOptions, getValues, setValue }: Props) => {
	const [addressValue, setAddressValue] = useState('');

	const address1Control = useController({ name: 'address1', control });

	useEffect(() => {
		const values = getValues();
		setAddressValue(addressFormat(values, { singleLine: true }));
	}, [getValues]);

	return (
		<Box>
			<Typography variant="h6" mb={2}>
				Service Location
			</Typography>
			<Grid container spacing={2}>
				<Grid item xs={12}>
					<FormSelect
						freeSolo
						control={control}
						name="serviceLocationType"
						label="Service Location Type"
						data-cy="service-location-type"
						options={serviceLocationTypeOptions.map((type) => ({
							label: startCase(type),
							value: type,
						}))}
						readOnly={formReadonly}
					/>
				</Grid>
				<Grid item xs={12}>
					<AutocompleteAddress
						onChange={(addressComponents: ParsedPlaceDetails) => {
							setValue('address1', addressComponents.name, { shouldDirty: true });
							setValue('city', addressComponents.city, { shouldDirty: true });
							setValue('county', addressComponents.county, { shouldDirty: true });
							setValue('state', addressComponents.state, { shouldDirty: true });
							setValue('zip', addressComponents.zip, { shouldDirty: true });
							setAddressValue(
								addressFormat({ ...getValues(), ...addressComponents }, { singleLine: true }),
							);
						}}
						name="address1"
						label="Address"
						value={addressValue}
						error={addressValue ? undefined : address1Control.fieldState.error}
						data-cy="patient-address"
					/>
				</Grid>
				<Grid item xs={12}>
					<FormTextField multiline control={control} name="serviceLocationNotes" label="Notes (Optional)" />
				</Grid>
			</Grid>
		</Box>
	);
};
