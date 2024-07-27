import { GridPaginationModel, GridSortModel } from '@mui/x-data-grid-pro';
import { useState } from 'react';
import { useAlert } from '~/common/hooks/useAlert';
import { RouterInputs, RouterOutputs, api } from '~/common/utils/api';
import { trpc } from '~/common/utils/trpc';
import { CardWrappedEditableTable } from '~/features/ui/Tables/CardWrappedEditableTable';

type PhysicianData = RouterOutputs['organization']['getAssociatedPhysicians']['list']['0'];

export function AssociatedPhysician() {
	const trpcUtils = trpc.useUtils();
	const alert = useAlert();
	const [searchText, setSearchText] = useState('');
	const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ pageSize: 10, page: 0 });
	const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'updatedAt', sort: 'desc' }]);
	const queryInputs: RouterInputs['organization']['getAssociatedPhysicians'] = {
		page: paginationModel.page,
		pageSize: paginationModel.pageSize,
		searchText,
		sortBy: sortModel[0]?.field as 'updatedAt' | 'name' | undefined,
		sortDirection: sortModel[0]?.sort as 'asc' | 'desc' | undefined,
	};

	const physiciansQuery = api.organization.getAssociatedPhysicians.useQuery(queryInputs, { keepPreviousData: true });

	const physicianAddMutation = api.organization.addAssociatedPhysician.useMutation({
		onSuccess: () => {
			void trpcUtils.organization.getAssociatedPhysicians.invalidate();
			alert.addSuccessAlert({ message: 'Associated Physician Saved' });
		},
		onError: () => {
			alert.addErrorAlert({ message: 'Error saving Associated Physician' });
		},
	});

	const physicianUpdateMutation = api.organization.updateAssociatedPhysician.useMutation({
		onSuccess: () => {
			void trpcUtils.organization.getAssociatedPhysicians.invalidate(queryInputs);
			alert.addSuccessAlert({ message: 'Associated Physician updated' });
		},
		onError: () => {
			alert.addErrorAlert({ message: 'Error saving Associated Physician' });
		},
	});

	const physicianRemoveMutation = api.organization.removeAssociatedPhysician.useMutation({
		onSuccess: () => {
			void trpcUtils.organization.getAssociatedPhysicians.invalidate();
			alert.addSuccessAlert({ message: 'Associated Physician Removed' });
		},
		onError: () => {
			alert.addErrorAlert({ message: 'Error removing Associated Physician' });
		},
	});

	return (
		<CardWrappedEditableTable<PhysicianData>
			title="Associated Physicians"
			subheader="Manage Associated Physicians"
			columns={columns}
			data={physiciansQuery.data ?? { list: [], count: 0 }}
			onEdit={physicianUpdateMutation.mutateAsync}
			startEditField="name"
			onDelete={physicianRemoveMutation.mutateAsync}
			onAdd={physicianAddMutation.mutateAsync}
			searchText={searchText}
			setSearchText={setSearchText}
			paginationModel={paginationModel}
			setPaginationModel={setPaginationModel}
			sortModel={sortModel}
			setSortModel={setSortModel}
		/>
	);
}

const columns = [
	{
		field: 'name',
		headerName: 'Name',
		editable: true,
		flex: 1,
	},
];
