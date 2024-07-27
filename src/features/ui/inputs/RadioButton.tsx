import { Box, FormControl, FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material';
import { forwardRef } from 'react';
import { FieldError } from 'react-hook-form';

export type RadioOptionType = {
	label: string;
	value: string | boolean;
};

export type DefaultFieldValues = Record<string, string | number | boolean | null>;

type RadioButtonProps = {
	label: string;
	options: RadioOptionType[];
	row?: boolean;
	required?: boolean;
	error: FieldError;
};

export const RadioButton = forwardRef<unknown, RadioButtonProps>(
	({ label, options, row = false, required = false, error, ...props }, ref) => {
		return (
			<FormControl error={!!error} fullWidth>
				<Box sx={{ display: 'flex', alignItems: 'center' }}>
					<Typography color={error ? 'error' : 'inherit'}>{label}</Typography>
					{required && (
						<Typography component="span" color={error ? 'error' : 'inherit'}>
							&nbsp;*
						</Typography>
					)}
				</Box>

				<RadioGroup {...props} row={row} ref={ref}>
					{options.map((option, index) => (
						<FormControlLabel
							key={index}
							value={option.value}
							control={<Radio sx={{ color: error ? 'red' : 'inherit' }} />}
							label={option.label}
							sx={{ color: error ? 'red' : 'inherit' }}
						/>
					))}
				</RadioGroup>
				{error && (
					<Typography color="error" variant="caption" sx={{ pl: 2 }}>
						{error.message}
					</Typography>
				)}
			</FormControl>
		);
	},
);

RadioButton.displayName = 'RadioButton';
