import { zodResolver } from '@hookform/resolvers/zod';
import { Container, Divider, Stack, TextField, Typography } from '@mui/material';
import { UserRole } from '@prisma/client';
import { startCase } from 'lodash';
import { useForm } from 'react-hook-form';
import { FormTextField } from '~/features/ui/form-inputs';
import { If } from '~/features/ui/util/If';
import { useAlert } from '../../../common/hooks/useAlert';
import { api } from '../../../common/utils/api';
import { UpdateUserInput, updateUserSchema } from '../../../server/api/routers/user/user.inputs';
import { SignOutButton } from '../../ui/auth/SignOutButton';
import { LoadingButton } from '../../ui/loading/LoadingButton';

export const ProfilePage = () => {
	const alert = useAlert();
	const user = api.user.getCurrentUser.useQuery();
	const { control, handleSubmit, formState } = useForm<UpdateUserInput>({
		resolver: zodResolver(updateUserSchema),
		values: {
			name: user.data?.name ?? '',
			pointcareId: user.data?.pointcareId,
		},
	});
	const updateUser = api.user.updateUser.useMutation({
		onSuccess: () => {
			alert.addSuccessAlert({ message: 'Profile updated successfully' });
		},
		onError: (error) => {
			alert.addErrorAlert({ title: 'Error updating profile', message: error.message });
		},
	});

	const onSubmit = (data: UpdateUserInput) => {
		updateUser.mutate(data);
	};

	return (
		<Container>
			<Stack spacing={2}>
				<Typography variant="h3">Profile</Typography>
				<FormTextField label={'Name'} control={control} name={'name'} />
				<If condition={!!user.data?.roles.includes(UserRole.Nurse)}>
					<FormTextField label={'Pointcare ID'} control={control} name={'pointcareId'} />
				</If>

				<TextField label={'Email'} value={user.data?.email ?? ''} fullWidth inputProps={{ readOnly: true }} />
				<TextField
					label={'Organization'}
					value={user.data?.Organization.name ?? ''}
					fullWidth
					inputProps={{ readOnly: true }}
				/>
				<TextField
					label={'Branch'}
					value={user.data?.Locations.map((l) => l.name).join(', ') ?? ''}
					fullWidth
					inputProps={{ readOnly: true }}
				/>
				<TextField
					label={'Roles'}
					value={user.data?.roles.map((r) => startCase(r)).join(', ') ?? ''}
					fullWidth
					inputProps={{ readOnly: true }}
				/>

				<LoadingButton
					disabled={!formState.isDirty}
					onClick={handleSubmit(onSubmit)}
					isLoading={updateUser.isLoading}
					label={'Update'}
					variant="contained"
					fullWidth
				/>
				<Divider />
				<SignOutButton variant="contained" fullWidth data-cy="sign-out-button" />
			</Stack>
		</Container>
	);
};
