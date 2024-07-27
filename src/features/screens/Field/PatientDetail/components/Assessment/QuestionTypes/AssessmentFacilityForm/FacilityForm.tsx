import { Grid } from '@mui/material';
import { State } from '@prisma/client';
import { useEffect, useState } from 'react';
import { Control, UseFormGetValues, UseFormResetField, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { api } from '~/common/utils/api';
import { FormAutocomplete, FormPatternFormatField, FormSelect, FormTextField } from '~/features/ui/form-inputs';
import { AssessmentCheckInput } from '~/server/api/routers/assessment/assessment.inputs';
import { WithCopyWrapper } from '../WithCopyWrapper';

export const FacilityForm = ({
	index,
	isLoading,
	readOnly,
	canCopy,
	control,
	watch,
	getValues,
	setValue,
	resetField,
}: {
	orgName?: string;
	index: number;
	isLoading: boolean;
	readOnly: boolean;
	canCopy: boolean;
	control: Control<AssessmentCheckInput>;
	watch: UseFormWatch<AssessmentCheckInput>;
	getValues: UseFormGetValues<AssessmentCheckInput>;
	setValue: UseFormSetValue<AssessmentCheckInput>;
	resetField: UseFormResetField<AssessmentCheckInput>;
}) => {
	const fieldName = `checkedResponse.choice.facilities.${index}` as const;
	const [name, setName] = useState('');

	const selectedName = watch(`${fieldName}.name`);
	const facilitiesQuery = api.organization.getAssociatedFacilities.useQuery(
		{ page: 0, pageSize: 100, searchText: name },
		{ enabled: !readOnly },
	);

	useEffect(() => {
		if (!facilitiesQuery.data) return;

		const selectedFacility = facilitiesQuery.data.list?.find((item) => item.name === selectedName);

		if (selectedFacility) {
			setValue(`${fieldName}.address`, selectedFacility.street ?? '');
			setValue(`${fieldName}.city`, selectedFacility.city ?? '');
			selectedFacility.state && setValue(`${fieldName}.state`, selectedFacility.state);
			setValue(`${fieldName}.phone`, (selectedFacility.phone ?? '').replace(/\D/g, ''));
			setValue(`${fieldName}.fax`, (selectedFacility.fax ?? '').replace(/\D/g, ''));
			setValue(`${fieldName}.type`, selectedFacility.facilityType ?? '');
		} else {
			resetField(`${fieldName}.address`);
			resetField(`${fieldName}.city`);
			resetField(`${fieldName}.state`);
			resetField(`${fieldName}.phone`);
			resetField(`${fieldName}.fax`);
			resetField(`${fieldName}.type`);
		}

		if (!selectedFacility && selectedName) {
			resetField(`${fieldName}.name`);
		}
	}, [fieldName, selectedName, setValue, resetField, facilitiesQuery.data]);

	return (
		<Grid container spacing={2}>
			<Grid item xs={6}>
				<FormAutocomplete
					inputValue={name}
					onInputChange={(event, value) => setName(value)}
					data-cy={`custom-facility-name-${index}`}
					readOnly={readOnly}
					disabled={isLoading}
					control={control}
					name={`${fieldName}.name`}
					label="Name"
					options={facilitiesQuery.data?.list?.map((item) => ({ id: item.name, label: item.name })) ?? []}
				/>
			</Grid>

			<Grid item xs={6}>
				<FormSelect
					data-cy={`custom-facility-type-${index}`}
					readOnly={true}
					disabled={isLoading}
					control={control}
					name={`${fieldName}.type`}
					freeSolo
					label="Type"
					options={[]}
				/>
			</Grid>
			<Grid item xs={6}>
				<FormTextField
					data-cy={`custom-facility-contact-name-${index}`}
					readOnly={readOnly}
					disabled={isLoading}
					control={control}
					name={`${fieldName}.contactName`}
					label="Contact Name"
				/>
			</Grid>
			<Grid item xs={6}>
				<FormTextField
					data-cy={`custom-facility-address-${index}`}
					readOnly
					disabled={isLoading}
					control={control}
					name={`${fieldName}.address`}
					label="Address"
				/>
			</Grid>

			<Grid item xs={6}>
				<FormTextField
					data-cy={`custom-facility-city-${index}`}
					readOnly
					disabled={isLoading}
					control={control}
					name={`${fieldName}.city`}
					label="City"
				/>
			</Grid>
			<Grid item xs={6}>
				<FormSelect
					data-cy={`custom-facility-state-${index}`}
					readOnly
					disabled={isLoading}
					control={control}
					name={`${fieldName}.state`}
					label="State"
					options={Object.values(State).map((item) => ({ value: item, label: item }))}
				/>
			</Grid>
			<Grid item xs={6}>
				<WithCopyWrapper canCopy={canCopy} getValue={() => getValues(`${fieldName}.phone`) ?? ''}>
					<FormPatternFormatField
						data-cy={`custom-facility-phone-${index}`}
						patternFormatProps={{
							format: '(###) ###-####',
							mask: '_',
						}}
						control={control}
						name={`${fieldName}.phone`}
						label="Phone"
						readOnly
					/>
				</WithCopyWrapper>
			</Grid>
			<Grid item xs={6}>
				<WithCopyWrapper canCopy={canCopy} getValue={() => getValues(`${fieldName}.fax`) ?? ''}>
					<FormPatternFormatField
						data-cy={`custom-facility-fax-${index}`}
						patternFormatProps={{
							format: '(###) ###-####',
							mask: '_',
						}}
						control={control}
						name={`${fieldName}.fax`}
						label="Fax"
						readOnly
					/>
				</WithCopyWrapper>
			</Grid>
		</Grid>
	);
};
