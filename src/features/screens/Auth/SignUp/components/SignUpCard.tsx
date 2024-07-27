import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Fade, Stack, Typography } from '@mui/material';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAlert } from '~/common/hooks/useAlert';
import { api } from '~/common/utils/api';
import { getDeviceInfo } from '~/common/utils/deviceInfo';
import { AuthCard } from '~/features/ui/cards/Auth/AuthCard';
import { FormTextField } from '~/features/ui/form-inputs';
import { LoadingButton } from '~/features/ui/loading/LoadingButton';
import { CreateUserInput, createUserInputSchema } from '~/server/api/routers/user/user.inputs';

type Props = {
	email: string;
	token: string;
};

export const SignUpCard = ({ email, token }: Props) => {
	const [loading, setLoading] = useState(false);
	const [isPasswordStep, setIsPasswordStep] = useState(true);
	const alert = useAlert();

	const { control, handleSubmit, trigger } = useForm<CreateUserInput>({
		resolver: zodResolver(createUserInputSchema),
		defaultValues: {
			email: email,
			token: token,
			password: '',
			firstName: '',
			lastName: '',
			device: getDeviceInfo(),
		},
	});

	const createUser = api.user.createUser.useMutation();

	const onSubmit = (data: CreateUserInput) => {
		setLoading(true);
		createUser.mutate(
			{ ...data },
			{
				onSuccess: async ({ deviceId }) => {
					await signIn('credentials', {
						email: data.email,
						password: data.password,
						deviceId,
						callbackUrl: '/',
					});
				},
				onError: (error) => {
					alert.addErrorAlert({
						title: 'Error creating account',
						message: error.message,
					});
					setLoading(false);
				},
			},
		);
	};

	const onContinue = async () => {
		const isPasswordValid = await trigger('password');

		if (isPasswordValid) setIsPasswordStep(false);
	};

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				if (isPasswordStep) {
					void onContinue();
				} else {
					void handleSubmit(onSubmit)(e);
				}
			}}
		>
			<AuthCard>
				<Box pt={4} pb={3}>
					<Typography variant="h5">Sign Up</Typography>
				</Box>

				<Stack spacing={2}>
					<Fade in={isPasswordStep} mountOnEnter unmountOnExit exit={false}>
						<Stack spacing={2}>
							<Typography variant="body2" color="textSecondary">
								Create a new password for Apricot
							</Typography>
							<FormTextField disabled label={'Email'} control={control} name={'email'} type="email" />
							<FormTextField
								label={'Password'}
								control={control}
								name="password"
								InputProps={{ type: 'password' }}
							/>
						</Stack>
					</Fade>

					<Fade in={!isPasswordStep} mountOnEnter unmountOnExit exit={false}>
						<Stack spacing={2}>
							<Typography variant="body2" color="textSecondary">
								Lastly, please enter your name
							</Typography>
							<FormTextField label={'First Name'} control={control} name={'firstName'} />
							<FormTextField label={'Last Name'} control={control} name={'lastName'} />
						</Stack>
					</Fade>

					<Stack direction={'row'} spacing={2}>
						{!isPasswordStep && (
							<Button variant="outlined" onClick={() => setIsPasswordStep(true)} fullWidth>
								Back
							</Button>
						)}

						<LoadingButton
							type="submit"
							isLoading={loading}
							label={isPasswordStep ? 'Continue' : 'Create Account'}
							variant="contained"
							fullWidth
						/>
					</Stack>
				</Stack>
			</AuthCard>
		</form>
	);
};
