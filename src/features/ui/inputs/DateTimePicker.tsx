import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker as MaterialDateTimePicker, type DateTimePickerProps } from '@mui/x-date-pickers/DateTimePicker';
import { forwardRef } from 'react';
import { FieldError } from 'react-hook-form';

type FormInputDateFieldProps = {
	error: FieldError;
} & Omit<DateTimePickerProps<AdapterDateFns>, 'defaultValue'>;

export const DateTimePicker = forwardRef<HTMLInputElement, FormInputDateFieldProps>(
	({ error, ...textFieldProps }, ref) => {
		console.log(textFieldProps);
		return (
			<LocalizationProvider dateAdapter={AdapterDateFns}>
				<MaterialDateTimePicker
					{...textFieldProps}
					slotProps={{
						textField: {
							error: !!error,
							helperText: error ? error.message : '',
							fullWidth: true,
							ref,
						},
					}}
				/>
			</LocalizationProvider>
		);
	},
);

DateTimePicker.displayName = 'DateTimePicker';
