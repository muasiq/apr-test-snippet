import { Button, ButtonProps } from '@mui/material';
import { PropsWithChildren } from 'react';
import theme from '~/styles/theme';

export function SecondaryIconTextButton({ ...props }: ButtonProps & PropsWithChildren): JSX.Element {
	return (
		<>
			<Button {...props} variant="text" sx={{ color: theme.palette.secondary.main, ...props.sx }}>
				{props.children}
			</Button>
		</>
	);
}
