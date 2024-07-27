import { State } from '@prisma/client';
import { useAlert } from '~/common/hooks/useAlert';
import { RouterOutputs, api } from '~/common/utils/api';
import { trpc } from '~/common/utils/trpc';
import { CardWrappedEditableTable } from '~/features/ui/Tables/CardWrappedEditableTable';

type LoginProfileData = RouterOutputs['organization']['getLocations']['0'];

export function Branches() {
	const trpcUtils = trpc.useUtils();
	const alert = useAlert();

	const branchesQuery = api.organization.getLocations.useQuery();

	const updateOneMutation = api.organization.updateLocation.useMutation({
		onSuccess: () => {
			void trpcUtils.organization.getLocations.invalidate();
			alert.addSuccessAlert({
				message: 'Branch Saved',
			});
		},

		onError: () => {
			alert.addErrorAlert({
				message: 'Error saving Branch',
			});
		},
	});

	const deleteOneMutation = api.organization.deleteLocation.useMutation({
		onSuccess: () => {
			void trpcUtils.organization.getLocations.invalidate();
			alert.addSuccessAlert({
				message: 'Branch Deleted',
			});
		},
		onError: () => {
			alert.addErrorAlert({
				message: 'Error deleting Branch',
			});
		},
	});
	return (
		<CardWrappedEditableTable<LoginProfileData>
			title="Branches"
			subheader="The branches in your organization"
			columns={columns}
			data={{ list: branchesQuery.data ?? [], count: branchesQuery.data?.length ?? 0 }}
			onEdit={updateOneMutation.mutateAsync}
			startEditField="name"
			onDelete={deleteOneMutation.mutateAsync}
			onAdd={updateOneMutation.mutateAsync}
			clientSideOnlyTable
			defaultExpanded
		/>
	);
}

const columns = [
	{
		field: 'name',
		headerName: 'Branch Name',
		editable: true,
		flex: 1,
	},
	{
		field: 'cmsBranchId',
		headerName: 'CMS Branch Id',
		editable: true,
		flex: 1,
	},
	{
		field: 'state',
		headerName: 'State',
		editable: true,
		flex: 1,
		type: 'singleSelect',
		valueOptions: Object.values(State).map((state) => ({
			label: state,
			value: state,
		})),
	},
];
