import { Box, Checkbox, FormLabel } from '@mui/material';
import { forwardRef, useId } from 'react';
import { FieldError } from 'react-hook-form';

type Props = {
	label: string;
	readOnly?: boolean;
	required?: boolean;
	'data-cy'?: string;
	value: boolean;
	onChange: (value: boolean) => void;
	error: FieldError;
};

export const InlineCheckbox = forwardRef<HTMLButtonElement, Props>(
	({ label, readOnly = false, required = false, 'data-cy': dataCy, value, error, onChange }, ref) => {
		const id = useId();

		return (
			<Box sx={{ display: 'flex', alignItems: 'center' }}>
				<Checkbox
					id={id}
					checked={value ?? false}
					required={required}
					data-cy={dataCy}
					onChange={(e) => {
						onChange(e.target.checked);
					}}
					readOnly={readOnly}
					sx={{ color: error ? 'red' : 'inherit', flexShrink: 0 }}
					ref={ref}
				/>
				<FormLabel htmlFor={id}>{label}</FormLabel>
			</Box>
		);
	},
);

InlineCheckbox.displayName = 'InlineCheckbox';
