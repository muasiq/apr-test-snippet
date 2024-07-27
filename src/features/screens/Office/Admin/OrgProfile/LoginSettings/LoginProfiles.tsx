import { GridRenderCellParams } from '@mui/x-data-grid/models/params/gridCellParams';
import { useAlert } from '~/common/hooks/useAlert';
import { api, RouterOutputs } from '~/common/utils/api';
import { trpc } from '~/common/utils/trpc';
import { CardWrappedEditableTable } from '~/features/ui/Tables/CardWrappedEditableTable';
import PasswordEditCell from '~/features/ui/Tables/PasswordEditCell';
import PasswordRenderCell from '~/features/ui/Tables/PasswordRenderCell';

type LoginProfileData = RouterOutputs['organization']['getLoginProfiles']['0'];

export function LoginProfiles() {
	const trpcUtils = trpc.useUtils();
	const alert = useAlert();

	const loginProfilesQuery = api.organization.getLoginProfiles.useQuery();

	const updateOneMutation = api.organization.updateLoginProfile.useMutation({
		onSuccess: () => {
			void trpcUtils.organization.getLoginProfiles.invalidate();
			alert.addSuccessAlert({
				message: 'Login Profile Saved',
			});
		},
		onError: () => {
			alert.addErrorAlert({
				message: 'Error saving Login Profile',
			});
		},
	});

	const deleteOneMutation = api.organization.deleteLoginProfile.useMutation({
		onSuccess: () => {
			void trpcUtils.organization.getLoginProfiles.invalidate();
			alert.addSuccessAlert({
				message: 'Login Profile Deleted',
			});
		},
		onError: () => {
			alert.addErrorAlert({
				message: 'Error deleting Login Profile',
			});
		},
	});

	return (
		<CardWrappedEditableTable<LoginProfileData>
			title="EMR Login Profiles"
			subheader="Manage the pool of EMR login profiles that are used for data integration"
			columns={columns}
			data={{ list: loginProfilesQuery.data ?? [], count: loginProfilesQuery.data?.length ?? 0 }}
			onEdit={updateOneMutation.mutateAsync}
			startEditField="firstName"
			onDelete={deleteOneMutation.mutateAsync}
			onAdd={updateOneMutation.mutateAsync}
			clientSideOnlyTable
		/>
	);
}

const columns = [
	{
		field: 'firstName',
		headerName: 'First Name',
		editable: true,
		flex: 1,
	},
	{
		field: 'lastName',
		headerName: 'Last Name',
		editable: true,
		flex: 1,
	},
	{
		field: 'hchbUsername',
		headerName: 'HCHB Username',
		editable: true,
		flex: 1,
	},
	{
		field: 'hchbPassword',
		headerName: 'HCHB Password',
		editable: true,
		flex: 1,
		renderCell: (params: GridRenderCellParams) => <PasswordRenderCell {...params} />,
		renderEditCell: (params: GridRenderCellParams) => <PasswordEditCell {...params} />,
	},
	{
		field: 'pointcareUserId',
		headerName: 'Pointcare UserId',
		editable: true,
		flex: 1,
	},
	{
		field: 'pointcarePassword',
		headerName: 'Pointcare Password',
		editable: true,
		flex: 1,
		renderCell: (params: GridRenderCellParams) => <PasswordRenderCell {...params} />,
		renderEditCell: (params: GridRenderCellParams) => <PasswordEditCell {...params} />,
	},
	{
		field: 'mainLogin',
		headerName: 'Main Login',
		editable: true,
		type: 'boolean',
		flex: 1,
	},
];
