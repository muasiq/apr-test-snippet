import { TextField, type InputBaseComponentProps, type TextFieldProps } from '@mui/material';
import { forwardRef, type ElementType } from 'react';
import { FieldError } from 'react-hook-form';
import { PatternFormat } from 'react-number-format';
import { type NumberFormatValues, type PatternFormatProps } from 'react-number-format/types/types';

interface NumberFormatCustomProps {
	onChange: (event: { target: { name: string; value: string } }) => void;
	name: string;
	patternFormatProps: PatternFormatProps;
}

type PatternFormatFieldProps = {
	label: string;
	readOnly?: boolean;
	patternFormatProps?: PatternFormatProps;
	error: FieldError;
} & Omit<TextFieldProps, 'defaultValue'>;

const NumberFormatCustom = forwardRef<HTMLInputElement, NumberFormatCustomProps>(
	({ onChange, name, patternFormatProps, ...other }, ref) => {
		const onValueChange = (values: NumberFormatValues) => {
			onChange({
				target: {
					name: name,
					value: values.value,
				},
			});
		};

		return <PatternFormat {...other} {...patternFormatProps} getInputRef={ref} onValueChange={onValueChange} />;
	},
);

NumberFormatCustom.displayName = 'NumberFormatCustom';

export const PatternFormatField = forwardRef<HTMLInputElement, PatternFormatFieldProps>(
	({ name, label, patternFormatProps, readOnly = false, onChange, error, ...textFieldProps }, ref) => {
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
						onChange: onChange,
						name: name,
						patternFormatProps: patternFormatProps,
						readOnly,
					},
				}}
			/>
		);
	},
);

PatternFormatField.displayName = 'PatternFormatField';
