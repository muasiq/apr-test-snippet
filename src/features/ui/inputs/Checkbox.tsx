import { Box, FormControlLabel, Checkbox as MaterialCheckbox, Typography } from '@mui/material';
import { forwardRef } from 'react';
import { FieldError } from 'react-hook-form';

type CheckboxOption = {
	value: string;
	label: string;
};

type FormCheckboxProps = {
	label: string;
	options: CheckboxOption[];
	required?: boolean;
	row?: boolean;
	error: FieldError;
	value: string[];
	onChange: (value: string[]) => void;
};

export const Checkbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
	({ label, options, required = false, row = false, error, value, onChange }, ref) => {
		return (
			<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
				<Typography color={error ? 'error' : 'inherit'}>{required ? label + ' *' : label} </Typography>

				<Box
					sx={{
						display: 'flex',
						flexDirection: row ? 'row' : 'column',
						color: error ? 'red' : 'inherit',
					}}
				>
					{options.map((option) => (
						<FormControlLabel
							key={option.value}
							control={
								<MaterialCheckbox
									checked={((value ?? []) as string[] | string).includes(option.value)}
									onChange={() => {
										const newValue = (value ?? []).includes(option.value)
											? (value ?? []).filter((v: string) => v !== option.value)
											: [...(value ?? ([] as string[])), option.value];
										onChange(newValue);
									}}
									inputRef={ref}
									sx={{ color: error ? 'red' : 'inherit' }}
								/>
							}
							label={option.label}
						/>
					))}
				</Box>
				{error && (
					<Typography color="error" variant="caption" sx={{ pl: 2 }}>
						{error.message}
					</Typography>
				)}
			</Box>
		);
	},
);

Checkbox.displayName = 'Checkbox';
