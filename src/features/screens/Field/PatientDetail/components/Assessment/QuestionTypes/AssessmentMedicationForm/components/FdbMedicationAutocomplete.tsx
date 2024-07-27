import { Autocomplete, AutocompleteProps, CircularProgress, TextField, type TextFieldProps } from '@mui/material';
import { orderBy } from 'lodash';
import React, { useCallback, useState } from 'react';
import { FieldError } from 'react-hook-form';
import stringSimilarity from 'string-similarity-js';

import { useDebounceValue } from 'usehooks-ts';
import { customDrugs, FdbDrugType } from '~/common/constants/medication';
import { api, RouterOutputs } from '~/common/utils/api';
import { getSavedDispensableDrugFormat, parseMedication } from '~/common/utils/medication';
import { MedicationSchema } from '~/server/api/routers/assessment/assessment.inputs';

const OPTION_TYPES = {
	unlisted: 'unlisted',
	dispensableDrug: 'dispensableDrug',
	customDrug: 'customDrug',
} as const;
export const UNLISTED_OPTION = { type: OPTION_TYPES.unlisted, id: 'unlisted', name: 'Unlisted Medication' } as const;

type DispensableDrug = RouterOutputs['medication']['search']['results'][0];
type CustomDrug = (typeof customDrugs)[0];

type Value = { type: string; id: string; name: string };
type Option =
	| { type: typeof OPTION_TYPES.unlisted; label: string; value: string; inputValue: string }
	| { type: typeof OPTION_TYPES.dispensableDrug; label: string; value: string; drug: DispensableDrug }
	| { type: typeof OPTION_TYPES.customDrug; label: string; value: string; drug: CustomDrug };
type FormAutocompleteProps = {
	error?: FieldError;
	label: string;
	onChange: (values: Partial<MedicationSchema>, type: Option['type']) => void;
	textFieldProps?: TextFieldProps;
	value?: Value | null;
} & Omit<AutocompleteProps<Option, false, false, false>, 'onChange' | 'options' | 'renderInput' | 'value'>;

function getOption(drug: DispensableDrug): Option {
	return {
		type: OPTION_TYPES.dispensableDrug,
		label: drug.DispensableDrugDesc,
		value: drug.DispensableDrugID,
		drug,
	};
}

function getOutput(option: Option) {
	if (option.type === OPTION_TYPES.unlisted) {
		const { drugName, strength, route } = parseMedication(option.inputValue);
		return { name: drugName ?? '', route: route ?? '', strength: strength ?? '', fdb: null };
	}

	if (option.type === OPTION_TYPES.dispensableDrug) {
		const { drug } = option;
		return {
			name: drug.DispensableDrugDesc,
			route: drug.RouteDesc,
			strength: '',
			fdb: getSavedDispensableDrugFormat(drug),
		};
	}

	const {
		drug: { id, name, route, availableDoseUnits },
	} = option;

	return { name, route, strength: '', fdb: { type: FdbDrugType.CUSTOM_DRUG, id, name, availableDoseUnits } };
}

export const FdbMedicationAutocomplete = ({
	error,
	label,
	onChange,
	textFieldProps,
	value,
	...autocompleteProps
}: FormAutocompleteProps) => {
	const [open, setOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useDebounceValue('', 500);

	const enabled = open && searchTerm.length >= 2;

	const sortResults = useCallback(
		(res: RouterOutputs['medication']['search']) => {
			const sorted = orderBy(
				res.results,
				(drug) => stringSimilarity(drug.DispensableDrugDesc, searchTerm),
				'desc',
			);
			return sorted.map((drug) => getOption(drug));
		},
		[searchTerm],
	);

	const selectedOption = React.useMemo(
		() => (value ? { label: value.name, value: value.id } : '') as Option,
		[value],
	);

	const {
		data: options,
		isFetching,
		isLoading,
	} = api.medication.search.useQuery({ term: searchTerm }, { enabled, select: sortResults });

	return (
		<Autocomplete
			{...autocompleteProps}
			multiple={false}
			open={enabled}
			onOpen={() => {
				setOpen(true);
			}}
			onClose={() => {
				setOpen(false);
				setSearchTerm('');
			}}
			popupIcon={null}
			isOptionEqualToValue={(option, value) =>
				typeof option !== 'string' &&
				typeof value !== 'string' &&
				value.value !== UNLISTED_OPTION.id &&
				option.value === value.value
			}
			getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
			options={options ?? []}
			loading={isFetching}
			blurOnSelect={true}
			onChange={(_, newValue) => {
				if (typeof newValue === 'string' || !newValue) return;
				onChange(getOutput(newValue), newValue.type);
			}}
			onInputChange={(_evt, newValue, reason) => {
				setSearchTerm(reason === 'input' ? newValue : '');
			}}
			value={selectedOption}
			filterOptions={(options, params) => {
				if (!isLoading && params.inputValue) {
					const inputLower = params.inputValue.toLowerCase();
					return [
						...options,
						...(inputLower.length > 2
							? customDrugs
									.filter((d) => d.name.toLowerCase().includes(inputLower))
									.map((d) => ({
										type: OPTION_TYPES.customDrug,
										label: d.name,
										value: d.id,
										drug: d,
									}))
							: []),
						{
							type: OPTION_TYPES.unlisted,
							label: `Add "${params.inputValue}" as an unlisted medication`,
							value: UNLISTED_OPTION.id,
							inputValue: params.inputValue,
						},
					];
				}

				return options;
			}}
			renderInput={(params) => (
				<TextField
					{...params}
					{...textFieldProps}
					label={label}
					error={!!error}
					helperText={error ? error.message : ''}
					InputProps={{
						...params.InputProps,
						endAdornment: (
							<React.Fragment>
								{isFetching ? <CircularProgress color="inherit" size={20} /> : null}
								{params.InputProps.endAdornment}
							</React.Fragment>
						),
					}}
				/>
			)}
		/>
	);
};
