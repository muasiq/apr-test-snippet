import { TextField, type InputBaseComponentProps, type TextFieldProps } from '@mui/material';
import React, { forwardRef, type ElementType } from 'react';
import { FieldError } from 'react-hook-form';
import { NumericFormat } from 'react-number-format';
import { type NumberFormatValues, type NumericFormatProps } from 'react-number-format/types/types';

interface NumberFormatCustomProps {
	onChange: (event: { target: { name: string; value: string } }) => void;
	name: string;
	numericFormatProps: NumericFormatProps;
}

const NumberFormatCustom = React.forwardRef<HTMLInputElement, NumberFormatCustomProps>(
	({ onChange, name, numericFormatProps, ...other }, ref) => {
		const onValueChange = (values: NumberFormatValues) => {
			onChange({
				target: {
					name: name,
					value: values.value,
				},
			});
		};

		return <NumericFormat {...other} getInputRef={ref} onValueChange={onValueChange} {...numericFormatProps} />;
	},
);

NumberFormatCustom.displayName = 'NumberFormatCustom';

type FormNumberFieldProps = {
	label: string;
	numericFormatProps: NumericFormatProps;
	error: FieldError;
} & Omit<TextFieldProps, 'defaultValue'>;

export const CurrencyField = forwardRef<HTMLInputElement, FormNumberFieldProps>(
	({ label, numericFormatProps, error, name, onChange, ...textFieldProps }, ref) => {
		return (
			<TextField
				{...textFieldProps}
				label={label}
				error={!!error}
				helperText={error ? error.message : ''}
				fullWidth
				ref={ref}
				InputProps={{
					inputComponent: NumberFormatCustom as unknown as ElementType<InputBaseComponentProps>,
					inputProps: {
						onChange,
						name,
						numericFormatProps,
					},
				}}
			/>
		);
	},
);

CurrencyField.displayName = 'CurrencyField';
