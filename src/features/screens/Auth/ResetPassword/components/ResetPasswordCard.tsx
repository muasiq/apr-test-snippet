import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAlert } from '~/common/hooks/useAlert';
import { api } from '~/common/utils/api';
import { AuthCard } from '~/features/ui/cards/Auth/AuthCard';
import { FormTextField } from '~/features/ui/form-inputs';
import { LoadingButton } from '~/features/ui/loading/LoadingButton';
import { ResetPasswordInput, resetPasswordInputSchema } from '~/server/api/routers/user/user.inputs';
import { Pages } from '../../../../../common/utils/showNavBars';

type Props = {
	email: string;
	token: string;
};

export const ResetPasswordCard = ({ email, token }: Props) => {
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const alert = useAlert();

	const { control, handleSubmit } = useForm<ResetPasswordInput>({
		resolver: zodResolver(resetPasswordInputSchema),
		defaultValues: {
			email: email,
			token: token,
			newPassword: '',
			confirmNewPassword: '',
		},
	});

	const { mutate } = api.user.resetPassword.useMutation({
		onSuccess: async () => {
			alert.addSuccessAlert({
				title: 'Success',
				message: 'Password reset successfully',
			});
			await router.push(Pages.SIGN_IN);
		},
		onError: (error) => {
			alert.addErrorAlert({
				title: 'Error creating account',
				message: error.message,
			});
			setLoading(false);
		},
	});

	const onSubmit = (data: ResetPasswordInput) => {
		setLoading(true);
		mutate(data);
	};

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				void handleSubmit(onSubmit)(e);
			}}
		>
			<AuthCard>
				<Box pt={4} pb={3}>
					<Typography variant="h5">Reset Password</Typography>
				</Box>

				<Stack spacing={2}>
					<Stack spacing={2}>
						<FormTextField
							disabled
							label={'Email'}
							control={control}
							name={'email'}
							InputProps={{ type: 'email' }}
						/>
						<FormTextField
							label={'New Password'}
							control={control}
							name={'newPassword'}
							InputProps={{ type: 'password' }}
							required
						/>
						<FormTextField
							label={'Confirm New Password'}
							control={control}
							name="confirmNewPassword"
							InputProps={{ type: 'password' }}
							required
						/>
					</Stack>

					<Stack direction={'row'} spacing={2}>
						<LoadingButton
							type="submit"
							isLoading={loading}
							label={'Reset Password'}
							variant="contained"
							fullWidth
						/>
					</Stack>
				</Stack>
			</AuthCard>
		</form>
	);
};
