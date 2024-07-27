import { SxProps } from '@mui/material';
import { DateCalendar, DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { type DatePickerProps } from '@mui/x-date-pickers/DatePicker';
import { parseISO } from 'date-fns';
import { isDate, isEmpty } from 'lodash';
import { forwardRef } from 'react';
import { FieldError } from 'react-hook-form';

type FormInputDateFieldProps = {
	readOnly?: boolean;
	dataCy?: string;
	inlinePicker?: boolean;
	calendarSx?: SxProps;
	size?: 'small' | 'medium';
	error: FieldError;
	value: string;
	onChange: (value: string) => void;
} & Omit<DatePickerProps<AdapterDateFns>, 'defaultValue'>;

export const DatePicker = forwardRef<HTMLInputElement, FormInputDateFieldProps>(
	(
		{ dataCy, readOnly = false, calendarSx = {}, inlinePicker = false, size = 'medium', value, error, ...props },
		ref,
	) => {
		const datePickerValue = (isDate(value)
			? value
			: isEmpty(value)
				? null
				: parseISO(value)) as unknown as AdapterDateFns;
		return (
			<LocalizationProvider dateAdapter={AdapterDateFns}>
				{/* https://stackoverflow.com/questions/69799310/cypress-testing-a-material-ui-datepicker-is-not-working-on-github-actions */}
				{/* using desktop date picker due to above issue */}

				{inlinePicker ? (
					<DateCalendar {...props} value={datePickerValue} sx={calendarSx} readOnly={readOnly} ref={ref} />
				) : (
					<DesktopDatePicker
						{...props}
						value={datePickerValue}
						sx={calendarSx}
						readOnly={readOnly}
						slotProps={{
							textField: {
								error: !!error,
								helperText: error ? error.message : '',
								fullWidth: true,
								size,
								ref,
								...(dataCy && { 'data-cy': dataCy }),
							},
						}}
					/>
				)}
			</LocalizationProvider>
		);
	},
);

DatePicker.displayName = 'DatePicker';
