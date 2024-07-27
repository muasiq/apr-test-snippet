import { GridPaginationModel, GridSortModel } from '@mui/x-data-grid-pro';
import { useState } from 'react';
import { useAlert } from '~/common/hooks/useAlert';
import { RouterInputs, RouterOutputs, api } from '~/common/utils/api';
import { trpc } from '~/common/utils/trpc';
import { CardWrappedEditableTable } from '~/features/ui/Tables/CardWrappedEditableTable';

type SupplyData = RouterOutputs['organization']['getSupplies']['list']['0'];

export function Supplies() {
	const trpcUtils = trpc.useUtils();
	const alert = useAlert();
	const [searchText, setSearchText] = useState('');
	const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ pageSize: 10, page: 0 });
	const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'updatedAt', sort: 'desc' }]);
	const queryInputs: RouterInputs['organization']['getSupplies'] = {
		page: paginationModel.page,
		pageSize: paginationModel.pageSize,
		searchText,
		sortBy: sortModel[0]?.field as 'updatedAt' | 'name' | undefined,
		sortDirection: sortModel[0]?.sort as 'asc' | 'desc' | undefined,
	};

	const suppliesQuery = api.organization.getSupplies.useQuery(queryInputs, { keepPreviousData: true });

	const supplyAddMutation = api.organization.addSupply.useMutation({
		onSuccess: () => {
			void trpcUtils.organization.getSupplies.invalidate();
			alert.addSuccessAlert({ message: 'Supply Saved' });
		},
		onError: () => {
			alert.addErrorAlert({ message: 'Error saving Supply' });
		},
	});

	const supplyUpdateMutation = api.organization.updateSupply.useMutation({
		onSuccess: () => {
			void trpcUtils.organization.getSupplies.invalidate(queryInputs);
			alert.addSuccessAlert({ message: 'Supply updated' });
		},
		onError: () => {
			alert.addErrorAlert({ message: 'Error saving Supply' });
		},
	});

	const supplyRemoveMutation = api.organization.removeSupply.useMutation({
		onSuccess: () => {
			void trpcUtils.organization.getSupplies.invalidate();
			alert.addSuccessAlert({ message: 'Supply Saved' });
		},
		onError: () => {
			alert.addErrorAlert({ message: 'Error removing Supply' });
		},
	});

	return (
		<CardWrappedEditableTable<SupplyData>
			title="Supplies"
			subheader="Manage Supplies used by your organization"
			columns={columns}
			data={suppliesQuery.data ?? { list: [], count: 0 }}
			onEdit={supplyUpdateMutation.mutateAsync}
			startEditField="package"
			onDelete={supplyRemoveMutation.mutateAsync}
			onAdd={supplyAddMutation.mutateAsync}
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
		field: 'package',
		headerName: 'Package',
		editable: true,
		flex: 1,
	},
	{
		field: 'category',
		headerName: 'Category',
		editable: true,
		flex: 1,
	},
	{
		field: 'vendor',
		headerName: 'Vendor',
		editable: true,
		flex: 1,
	},
];
