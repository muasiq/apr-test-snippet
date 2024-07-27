import { GridPaginationModel, GridSortModel } from '@mui/x-data-grid-pro';
import { State } from '@prisma/client';
import { useState } from 'react';
import { useAlert } from '~/common/hooks/useAlert';
import { RouterInputs, RouterOutputs, api } from '~/common/utils/api';
import { trpc } from '~/common/utils/trpc';
import { CardWrappedEditableTable } from '~/features/ui/Tables/CardWrappedEditableTable';

type FacilityData = RouterOutputs['organization']['getAssociatedFacilities']['list']['0'];

export function AssociatedFacilities() {
	const trpcUtils = trpc.useUtils();
	const alert = useAlert();
	const [searchText, setSearchText] = useState('');
	const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ pageSize: 10, page: 0 });
	const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'updatedAt', sort: 'desc' }]);
	const queryInputs: RouterInputs['organization']['getAssociatedFacilities'] = {
		page: paginationModel.page,
		pageSize: paginationModel.pageSize,
		searchText,
		sortBy: sortModel[0]?.field as 'updatedAt' | 'name' | undefined,
		sortDirection: sortModel[0]?.sort as 'asc' | 'desc' | undefined,
	};

	const facilitiesQuery = api.organization.getAssociatedFacilities.useQuery(queryInputs, { keepPreviousData: true });

	const facilityAddMutation = api.organization.addAssociatedFacility.useMutation({
		onSuccess: () => {
			void trpcUtils.organization.getAssociatedFacilities.invalidate();
			alert.addSuccessAlert({ message: 'Associated Facility Saved' });
		},
		onError: (e) => {
			alert.addErrorAlert({ message: 'Error saving Associated Facility' });
		},
	});

	const facilityUpdateMutation = api.organization.updateAssociatedFacility.useMutation({
		onSuccess: () => {
			void trpcUtils.organization.getAssociatedFacilities.invalidate(queryInputs);
			alert.addSuccessAlert({ message: 'Associated Facility updated' });
		},
		onError: () => {
			alert.addErrorAlert({ message: 'Error saving Associated Facility' });
		},
	});

	const facilityRemoveMutation = api.organization.removeAssociatedFacility.useMutation({
		onSuccess: () => {
			void trpcUtils.organization.getAssociatedFacilities.invalidate();
			alert.addSuccessAlert({ message: 'Associated Facility Saved' });
		},
		onError: () => {
			alert.addErrorAlert({ message: 'Error removing Associated Facility' });
		},
	});

	return (
		<CardWrappedEditableTable<FacilityData>
			title="Associated Facilities"
			subheader="Manage Associated Facilities"
			columns={columns}
			data={facilitiesQuery.data ?? { list: [], count: 0 }}
			onEdit={facilityUpdateMutation.mutateAsync}
			startEditField="name"
			onDelete={facilityRemoveMutation.mutateAsync}
			onAdd={facilityAddMutation.mutateAsync}
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
	{
		field: 'street',
		headerName: 'Street',
		editable: true,
		flex: 1,
	},
	{
		field: 'city',
		headerName: 'City',
		editable: true,
		flex: 1,
	},
	{
		field: 'state',
		headerName: 'State',
		type: 'singleSelect',
		valueOptions: Object.values(State),
		editable: true,
		flex: 1,
	},
	{
		field: 'zip',
		headerName: 'Zip',
		editable: true,
		flex: 1,
	},
	{
		field: 'facilityType',
		headerName: 'Facility Type',
		editable: true,
		flex: 1,
	},
	{
		field: 'phone',
		headerName: 'Phone (Optional)',
		editable: true,
		flex: 1,
	},
	{
		field: 'fax',
		headerName: 'Fax (optional)',
		editable: true,
		flex: 1,
	},
];
