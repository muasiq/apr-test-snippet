import { TextField } from '@mui/material';
import { forwardRef } from 'react';
import { kalam } from '../../../styles/theme';

type Props = {
	value: string;
	onChange?: (value: string) => void;
	showError?: boolean;
	helperText?: string;
	readOnly?: boolean;
};

export const SignatureTextField = forwardRef<HTMLInputElement, Props>(
	({ value, onChange, showError, helperText, readOnly = false }, ref) => {
		return (
			<TextField
				data-cy="signature-text-field"
				placeholder="Sign here"
				value={value}
				onChange={(e) => onChange && onChange(e.target.value)}
				error={showError}
				helperText={showError ? helperText : ''}
				InputProps={{
					readOnly,
					sx: {
						bgcolor: 'white',
					},
				}}
				inputProps={{
					style: {
						textAlign: 'center',
						fontFamily: kalam.style.fontFamily,
					},
					ref,
				}}
			/>
		);
	},
);

SignatureTextField.displayName = 'SignatureTextField';
