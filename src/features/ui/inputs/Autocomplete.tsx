import {
	Autocomplete as MaterialAutocomplete,
	TextField,
	type AutocompleteProps,
	type TextFieldProps,
} from '@mui/material';
import { forwardRef, useState } from 'react';
import { FieldError } from 'react-hook-form';

type OptionType = { id: string; label: string };

type FormAutocompleteProps = {
	label: string;
	options: OptionType[];
	textFieldProps?: TextFieldProps;
	error: FieldError;
	onChange: (value: string | null) => void;
} & Omit<AutocompleteProps<OptionType, boolean, boolean, boolean>, 'renderInput'>;

export const Autocomplete = forwardRef<HTMLInputElement, FormAutocompleteProps>(
	(
		{ label, options, textFieldProps, inputValue, onInputChange, value, onChange, error, ...autocompleteProps },
		ref,
	) => {
		const [innerInputValue, setInnerInputValue] = useState('');
		const passedInputValue = inputValue ?? innerInputValue;

		return (
			<MaterialAutocomplete
				{...autocompleteProps}
				value={value ?? null}
				inputValue={
					passedInputValue
						? options.find((o) => o.id === passedInputValue)?.label ?? passedInputValue
						: passedInputValue
				}
				onInputChange={onInputChange ?? ((_, newInputValue) => setInnerInputValue(newInputValue))}
				onChange={(_, newValue) => {
					if (typeof newValue === 'string' || !newValue) {
						onChange(newValue);
						return;
					}
					const resolvedNewValue = newValue as unknown as OptionType;
					onChange(resolvedNewValue?.id);
				}}
				options={options}
				isOptionEqualToValue={(option, value) => option.id === (value as unknown as string)}
				getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
				renderInput={(params) => (
					<TextField
						{...params}
						{...textFieldProps}
						inputRef={ref}
						label={label}
						error={!!error}
						helperText={error ? error.message : ''}
					/>
				)}
			/>
		);
	},
);

Autocomplete.displayName = 'Autocomplete';
