import { TextField as MaterialTextField, type TextFieldProps } from '@mui/material';
import { ChangeEvent, forwardRef } from 'react';
import { FieldError } from 'react-hook-form';

type FormValue = string | string[];

export type DefaultFieldValues = Record<string, FormValue | number | boolean | null>;

type FormTextFieldProps = {
	label: string;
	type?: 'text' | 'number' | 'email' | 'tel';
	readOnly?: boolean;
	error?: FieldError;
	onChange: (value: FormValue | number | null) => void;
} & Omit<TextFieldProps, 'defaultValue'>;

export const TextField = forwardRef<HTMLInputElement, FormTextFieldProps>(
	({ onChange, value, error, label, type, readOnly, ...textFieldProps }, ref) => {
		const handleNumberChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			const value = event.target.value;
			const validNumberRegex = /^\d*\.?\d*$/;
			if (validNumberRegex.test(value) || value === '') {
				if (value.startsWith('.') || value.endsWith('.')) {
					onChange(value);
					return;
				}
				const numericValue = value === '' ? null : Number(value.trim());
				onChange(numericValue);
			}
		};

		return (
			<MaterialTextField
				InputProps={{ readOnly }}
				{...textFieldProps}
				inputRef={ref}
				value={value ?? ''}
				onChange={type === 'number' ? handleNumberChange : onChange}
				label={label}
				error={!!error}
				helperText={error ? error.message : ''}
				fullWidth
			/>
		);
	},
);

TextField.displayName = 'TextField';
