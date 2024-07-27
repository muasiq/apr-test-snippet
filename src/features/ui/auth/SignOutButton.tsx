import { Button, type ButtonProps } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { ACTIVE_ORG_SESSION_STORAGE_KEY } from '~/common/constants/constants';
import { Pages } from '../../../common/utils/showNavBars';

type Props = {
	label?: string;
} & ButtonProps;
export const SignOutButton = ({ label, ...props }: Props) => {
	const router = useRouter();
	const queryClient = useQueryClient();
	return (
		<Button
			{...props}
			onClick={() => {
				queryClient.removeQueries();
				sessionStorage.removeItem(ACTIVE_ORG_SESSION_STORAGE_KEY);
				void signOut({
					redirect: false,
				});
				void router.push(Pages.SIGN_IN);
			}}
		>
			{label ?? 'Sign out'}
		</Button>
	);
};
