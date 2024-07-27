import {
	LocalizationProvider,
	TimePicker as MaterialTimePicker,
	TimeClock,
	type TimePickerProps,
} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { forwardRef } from 'react';
import { FieldError } from 'react-hook-form';

type TimeFieldProps = {
	label: string;
	inlinePicker?: boolean;
	error: FieldError;
	onChange: (value: AdapterDateFns | null) => void;
} & TimePickerProps<AdapterDateFns>;

export const TimePicker = forwardRef<HTMLInputElement, TimeFieldProps>(
	({ label, inlinePicker = false, error, onChange, value, ...timePickerProps }, ref) => {
		return (
			<LocalizationProvider dateAdapter={AdapterDateFns}>
				{inlinePicker ? (
					<TimeClock views={['hours', 'minutes']} ampmInClock value={value} onChange={onChange} ref={ref} />
				) : (
					<MaterialTimePicker
						{...timePickerProps}
						label={label}
						value={value}
						onChange={onChange}
						slotProps={{
							textField: {
								error: !!error,
								helperText: error ? error.message : '',
								fullWidth: true,
								ref,
							},
						}}
					/>
				)}
			</LocalizationProvider>
		);
	},
);

TimePicker.displayName = 'TimePicker';
