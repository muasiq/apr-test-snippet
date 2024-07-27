import { MenuItem, TextField, type TextFieldProps } from '@mui/material';
import { forwardRef } from 'react';
import { FieldError } from 'react-hook-form';

export type SelectOptionType = {
	label: string | number;
	value: string | number;
};

export type DefaultFieldValues = Record<string, string | number | boolean | null>;

type SelectProps = {
	label: string;
	readOnly?: boolean;
	options: SelectOptionType[];
	multiple?: boolean;
	freeSolo?: boolean;
	error?: FieldError;
} & Omit<TextFieldProps, 'defaultValue'>;

export const Select = forwardRef<HTMLInputElement, SelectProps>(
	(
		{ label, options, readOnly = false, multiple = false, freeSolo = false, error, value, ...textFieldProps },
		ref,
	) => {
		return (
			<TextField
				{...textFieldProps}
				value={value ?? ''}
				fullWidth
				select
				label={label}
				error={!!error}
				helperText={error ? error.message : ''}
				ref={ref}
				SelectProps={{
					multiple,
					readOnly,
					renderValue: (value) => {
						const option = options.find((o) => o.value === value);
						if (option) {
							return option.label;
						}
						if (freeSolo) {
							return value as SelectOptionType['value'];
						}
						return null;
					},
					MenuProps: {
						PaperProps: {
							sx: {
								maxHeight: 600,
							},
						},
					},
				}}
			>
				{options.map((option) => (
					<MenuItem key={option.value} value={option.value} data-cy={`select-item-${option.value}`}>
						{option.label}
					</MenuItem>
				))}
			</TextField>
		);
	},
);

Select.displayName = 'Select';
