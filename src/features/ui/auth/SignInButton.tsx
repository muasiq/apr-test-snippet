import { Button, type ButtonProps } from '@mui/material';
import { signIn } from 'next-auth/react';

type Props = {
	label?: string;
} & ButtonProps;
export const SignInButton = ({ label, ...props }: Props) => {
	return (
		<Button color={props.color ?? 'inherit'} {...props} onClick={() => signIn()}>
			{label ?? 'Sign in'}
		</Button>
	);
};
