import { LocalizationProvider } from '@mui/x-date-pickers';
import {
	DateRange,
	DateRangePicker as MaterialDateRangePicker,
	type DateRangePickerProps,
} from '@mui/x-date-pickers-pro';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { forwardRef } from 'react';
import { FieldError } from 'react-hook-form';

type FormInputDateRangeFieldProps = {
	error: FieldError;
	onChange: (value: DateRange<AdapterDateFns>) => void;
} & Omit<DateRangePickerProps<AdapterDateFns>, 'defaultValue'>;

export const DateRangePicker = forwardRef<HTMLInputElement, FormInputDateRangeFieldProps>(
	({ error, value, onChange, ...dateRangePickerProps }, ref) => {
		return (
			<LocalizationProvider dateAdapter={AdapterDateFns}>
				<MaterialDateRangePicker
					{...dateRangePickerProps}
					value={value ?? [null, null]}
					onChange={(newValue, _selectionString) => onChange(newValue)}
					ref={ref}
					slotProps={{
						textField: {
							error: !!error,
							helperText: error?.message ?? '',
							fullWidth: true,
						},
					}}
				/>
			</LocalizationProvider>
		);
	},
);

DateRangePicker.displayName = 'DateRangePicker';
