import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowBack } from '@mui/icons-material';
import { Box, Button, Collapse, IconButton, Stack, Typography } from '@mui/material';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAlert } from '~/common/hooks/useAlert';
import { useVerifiedDevice } from '~/common/hooks/useVerifiedDevice';
import { api } from '~/common/utils/api';
import { getDeviceInfo } from '~/common/utils/deviceInfo';
import { AuthCard } from '~/features/ui/cards/Auth/AuthCard';
import { FormTextField } from '~/features/ui/form-inputs';
import { LoadingButton } from '~/features/ui/loading/LoadingButton';
import { primaryTextFieldStyles } from '~/features/ui/textfield/textfield.styles';
import { VerificationMethod } from '~/server/api/routers/user/user.inputs';
import { AuthErrorCode } from '~/server/authErrorCodes';

export const signInSchema = z.object({
	email: z.string().email(),
	password: z.string().min(1),
});
export type SignInInput = z.infer<typeof signInSchema>;

export const verificationSchema = z.object({
	code: z.string().min(1),
});
export type VerificationInput = z.infer<typeof verificationSchema>;

export const SignInCard = () => {
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [credentialMismatch, setCredentialMismatch] = useState(false);
	const [unverifiedDevice, setUnverifiedDevice] = useState(false);
	const [showEmailVerificationSent, setShowEmailVerificationSent] = useState(false);
	const [forgotPassword, setForgotPassword] = useState(false);
	const { addDevice, getDevice, removeDevice } = useVerifiedDevice();

	const alert = useAlert();
	const router = useRouter();

	const { control, handleSubmit, getValues, setValue, getFieldState, trigger, setFocus } = useForm<SignInInput>({
		resolver: zodResolver(signInSchema),
	});
	const verificationForm = useForm<VerificationInput>({
		resolver: zodResolver(verificationSchema),
	});

	const { mutateAsync: doesUserEmailExist } = api.user.doesUserEmailExist.useMutation();
	const { mutateAsync: sendEmailVerification } = api.user.sendEmailVerification.useMutation();
	const { mutate: resetPasswordMutate } = api.user.sendResetPasswordEmail.useMutation();
	const verifyDevice = api.user.verifyNewDevice.useMutation({
		onSuccess: async (device) => {
			const { email, password } = getValues();
			addDevice({ email, deviceId: device.id });
			alert.addSuccessAlert({
				title: 'Device verified!',
				message: 'You are now signed in.',
			});
			await signIn('credentials', {
				email,
				password,
				callbackUrl: '/',
				deviceId: device.id,
				redirect: false,
			});
			void router.push('/');
		},
		onError: (error) => {
			if (error.data?.code && ['CONFLICT', 'NOT_FOUND'].includes(error.data?.code)) {
				alert.addErrorAlert({
					message: error.message,
				});
			}
			alert.addErrorAlert({
				message: 'Error verifying device',
			});
		},
	});

	const verifyEmail = async () => {
		const email = getValues('email');
		setLoading(true);
		try {
			const result = await doesUserEmailExist({ email });
			if (!result) {
				setShowEmailVerificationSent(true);
				await sendEmailVerification({
					email,
					verificationMethod: VerificationMethod.VERIFY_EMAIL,
				});
			}
			setLoading(false);
		} catch (error) {
			if (error instanceof Error) {
				if (!error.message.includes('no valid organization')) {
					alert.addErrorAlert({
						message: 'Error verifying email - ',
					});
				}
			}
			setLoading(false);
		}

		setShowPassword(true);
	};

	useEffect(() => {
		const email = router.query.email;
		if (typeof email === 'string') {
			setValue('email', decodeURIComponent(email));
			void verifyEmail();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [router.query.email]);

	useEffect(() => {
		if (router.query.timeout === 'true') {
			alert.addInfoAlert({
				message: 'You are logged out due to inactivity.',
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [router.query.timeout]);

	useEffect(() => {
		if (showPassword) {
			setFocus('password');
		}
	}, [setFocus, showPassword]);

	const onSubmit = async (data: SignInInput) => {
		const { deviceId } = getDevice(data.email) ?? {};
		try {
			setCredentialMismatch(false);
			setLoading(true);
			const result = await signIn('credentials', {
				email: data.email,
				password: data.password,
				callbackUrl: '/',
				redirect: false,
				deviceId,
			});
			if (result?.ok) {
				void router.push(decodeURIComponent((router.query.callback as string) ?? '/'));
			} else if (result?.error === AuthErrorCode.CREDENTIALS_MISMATCH) {
				setCredentialMismatch(true);
			} else if (result?.error === AuthErrorCode.DEVICE_NOT_VERIFIED) {
				if (deviceId) removeDevice(deviceId);
				await sendEmailVerification({
					email: data.email,
					verificationMethod: VerificationMethod.VERIFY_DEVICE,
				});
				setUnverifiedDevice(true);
			}
		} finally {
			setLoading(false);
		}
	};

	const handleForgotPasswordClick = () => {
		setForgotPassword(true);
		setShowEmailVerificationSent(true);

		const email = getValues('email');

		resetPasswordMutate({ email });
	};

	const handleDeviceVerification = verificationForm.handleSubmit((data) => {
		verifyDevice.mutate({
			email: getValues('email'),
			token: data.code,
			device: getDeviceInfo(),
		});
	});

	if (showEmailVerificationSent) {
		return (
			<AuthCard>
				<IconButton
					onClick={() => {
						setShowEmailVerificationSent(false);
						setShowPassword(false);
						setForgotPassword(false);
					}}
				>
					<ArrowBack color="primary" />
				</IconButton>
				<Stack pt={4} pb={3} spacing={3}>
					<Typography variant="h5" textAlign={'center'}>
						Check your email
					</Typography>
					<Typography variant="body1" textAlign={'center'}>
						{forgotPassword
							? 'If you have an account with us, you will receive an email shortly with a link to reset your password.'
							: 'If you have an organization with us, you will receive an email shortly with a link to verify your email.'}
					</Typography>
				</Stack>
			</AuthCard>
		);
	}

	if (unverifiedDevice) {
		return (
			<form onSubmit={handleDeviceVerification}>
				<AuthCard>
					<Stack pt={4} spacing={3}>
						<Typography variant="h5">Check your email</Typography>
						<Typography variant="body1">
							It looks like you might be signing in from a new device. Please enter the verification code
							sent to your email.
						</Typography>

						<FormTextField
							data-cy="verification-code-input"
							control={verificationForm.control}
							sx={primaryTextFieldStyles}
							label="Verification Code"
							name="code"
						/>
						<LoadingButton
							data-cy="verify-device-button"
							disabled={verifyDevice.isSuccess}
							type="submit"
							isLoading={verifyDevice.isLoading}
							label={'Verify Device'}
							variant="contained"
							fullWidth
						/>
					</Stack>
				</AuthCard>
			</form>
		);
	}

	return (
		<form
			onSubmit={async (e) => {
				e.preventDefault();
				if (showPassword) {
					void handleSubmit(onSubmit)(e);
				} else {
					await trigger('email');
					if (!getFieldState('email').invalid) {
						void verifyEmail();
					}
				}
			}}
		>
			<AuthCard>
				<Box pt={4} pb={3}>
					<Typography variant="h5">{showPassword ? 'Sign In' : 'Get Started'}</Typography>
				</Box>
				<Stack spacing={2}>
					<FormTextField
						data-cy="email-input"
						label={'Email'}
						control={control}
						name={'email'}
						type="email"
						sx={primaryTextFieldStyles}
					/>
					<Collapse in={showPassword} unmountOnExit>
						<FormTextField
							data-cy="password-input"
							label={'Password'}
							control={control}
							name="password"
							InputProps={{
								type: 'password',
							}}
							sx={primaryTextFieldStyles}
						/>
					</Collapse>
					<Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
						<Box>
							{credentialMismatch && (
								<Typography variant="body2" color="error.main">
									Email or password is incorrect.
								</Typography>
							)}
						</Box>
						<Box>
							{showPassword && (
								<Button
									variant="text"
									disableRipple
									sx={{
										textDecoration: 'underline',
										'&:hover': {
											textDecoration: 'underline',
											bgcolor: 'transparent',
										},
									}}
									onClick={handleForgotPasswordClick}
								>
									<Typography variant="body2">Forgot password?</Typography>
								</Button>
							)}
						</Box>
					</Stack>

					<LoadingButton
						data-cy="sign-in-button"
						type="submit"
						isLoading={loading}
						label={showPassword ? 'Sign In' : 'Continue'}
						variant="contained"
						fullWidth
					/>
				</Stack>
			</AuthCard>
		</form>
	);
};
