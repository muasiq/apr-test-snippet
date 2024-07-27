import { MenuItem, Stack, TextField } from '@mui/material';
import { DataGridPro, GridSortModel } from '@mui/x-data-grid-pro';
import { PatientStatus } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { UserActionPermissions, hasActionPermission } from '~/common/utils/permissions';
import { useAlert } from '../../../../common/hooks/useAlert';
import useDebounce from '../../../../common/hooks/useDebounce';
import { api } from '../../../../common/utils/api';
import { patientStatusEnumToText } from '../../../../common/utils/patientStatusToText';
import { GetInfiniteInput } from '../../../../server/api/routers/patient/patient.inputs';
import { PatientWithJoins } from '../../../../server/api/routers/patient/patient.types';
import { PatientDetailTabs } from '../PatientDetail/components/PatientDetailTabView';
import { NewPatientDrawer } from './NewPatientDrawer';
import { useOfficePatientListTable } from './OfficePatientListTable.hook';
import { OfficePatientTableDetail } from './OfficePatientTableDetail';

export const OfficePatientListTable = (): JSX.Element => {
	const { columns } = useOfficePatientListTable();
	const { data: sessionData } = useSession();
	const router = useRouter();
	const alert = useAlert();
	const [paginationModel, setPaginationModel] = useState({
		page: 0,
		pageSize: 10,
	});

	const [search, setSearch] = useState<string>(router.query.search as string);

	const [statusFilter, setStatusFilter] = useState<PatientStatus | 'all'>(
		(router.query.status as PatientStatus) || 'all',
	);

	const [sortModel, setSortModel] = useState<GridSortModel>([
		{
			field: 'SOCVisitDate',
			sort: 'desc',
		},
	]);

	const debouncedSearchInput = useDebounce(search, 500);

	const { data, fetchNextPage, isLoading, isFetchingNextPage, isError, error } =
		api.patient.getInfinite.useInfiniteQuery(
			{
				limit: paginationModel.pageSize,
				name: debouncedSearchInput,
				filters: statusFilter !== 'all' ? { [statusFilter]: true } : null,
				orderBy: {
					field: (sortModel[0] as GetInfiniteInput['orderBy'])?.field ?? 'SOCVisitDate',
					sortOrder: sortModel[0]?.sort ?? 'desc',
				},
			},
			{
				getNextPageParam: (lastPage) => lastPage.nextCursor,
			},
		);

	const resetPaginationModel = () => {
		setPaginationModel((model) => ({ ...model, page: 0 }));
	};

	useEffect(() => {
		if (isError) {
			console.error('Error fetching patient list', error);
			alert.addErrorAlert({
				title: 'Error',
				message: 'Error Fetching Patient List',
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isError, error]);

	const rowCount = data?.pages[0]?.count ?? 0;

	useEffect(() => {
		resetPaginationModel();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [statusFilter, debouncedSearchInput, paginationModel.pageSize]);

	useEffect(() => {
		void router.push({
			pathname: router.pathname,
			query: {
				...router.query,
				search: search,
				status: statusFilter,
			},
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [search, statusFilter]);

	const patients = useMemo(() => {
		return data?.pages[paginationModel.page]?.items ?? [];
	}, [data, paginationModel]);

	const canAssignQa = hasActionPermission(UserActionPermissions.MANAGE_QA, sessionData?.user?.roles);
	const canAssignDataEntry = hasActionPermission(UserActionPermissions.MANAGE_DATAENTRY, sessionData?.user?.roles);
	const canResetPatient = hasActionPermission(UserActionPermissions.RESET_PATIENT, sessionData?.user?.roles);

	// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
	const canOpenDetail = canAssignDataEntry || canAssignQa || canResetPatient;

	return (
		<>
			<Stack direction="row" spacing={2} mb={2}>
				<TextField
					sx={{ width: 300 }}
					data-cy="search-patient"
					label="Search"
					placeholder="Patient Name..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				></TextField>
				<TextField
					sx={{ minWidth: 200 }}
					data-cy="status-patient"
					select
					value={statusFilter}
					label="Status"
					onChange={(e) => {
						setStatusFilter(e.target.value as PatientStatus | 'all');
					}}
				>
					<MenuItem key={1} value={'all'}>
						All
					</MenuItem>
					{Object.values(PatientStatus).map((status) => {
						return (
							<MenuItem key={status} value={status}>
								{patientStatusEnumToText(status)}
							</MenuItem>
						);
					})}
				</TextField>
			</Stack>

			<DataGridPro
				sx={{ '--DataGrid-overlayHeight': '300px' }}
				loading={isLoading || isFetchingNextPage}
				rows={patients as PatientWithJoins[]}
				columns={columns}
				autoPageSize
				disableRowSelectionOnClick
				disableColumnMenu
				pagination
				sortModel={sortModel}
				sortingMode="server"
				sortingOrder={['desc', 'asc']}
				onSortModelChange={(newSortModel) => {
					if (newSortModel.length === 0) return;
					resetPaginationModel();
					setSortModel(newSortModel);
				}}
				paginationMode="server"
				rowCount={rowCount}
				onRowClick={(row) => {
					void router.push({
						pathname: `/office/patient/${row.id}`,
						query: `currentTab=${PatientDetailTabs.INFORMATION}`,
					});
				}}
				getDetailPanelContent={
					canOpenDetail
						? ({ row }) => (
								<OfficePatientTableDetail
									canAssignDataEntry={canAssignDataEntry}
									canAssignQa={canAssignQa}
									canResetPatient={canResetPatient}
									patient={row}
								/>
							)
						: undefined
				}
				getDetailPanelHeight={() => 100}
				paginationModel={paginationModel}
				onPaginationModelChange={async (newModel) => {
					if (newModel.page > paginationModel.page) {
						await fetchNextPage();
					}
					const minPageSize = Math.max(newModel.pageSize, 5);
					setPaginationModel({ ...newModel, pageSize: minPageSize });
				}}
				initialState={{
					pagination: {
						paginationModel,
					},
				}}
				pageSizeOptions={[10]}
			/>
			<NewPatientDrawer />
		</>
	);
};
