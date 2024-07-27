import { useMediaQuery, useTheme } from '@mui/material';
import {
	GridColDef,
	GridRenderCellParams,
	GridValueFormatterParams,
	GridValueGetterParams,
} from '@mui/x-data-grid-pro';
import { Patient, PatientStatus } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useMemo } from 'react';
import { addressFormat } from '../../../../common/utils/addressFormat';
import { formatDateShort, formatTimeAgo } from '../../../../common/utils/dateFormat';
import { DataAccessPermissions, UserActionPermissions, hasPermission } from '../../../../common/utils/permissions';
import { PatientWithJoins } from '../../../../server/api/routers/patient/patient.types';
import { PatientStatusChip } from '../../../ui/chips/PatientStatusChip';

export function useOfficePatientListTable() {
	const { data: sessionData } = useSession();
	const theme = useTheme();
	const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
	const canSeeMultipleOrgs = hasPermission(
		DataAccessPermissions.FULL_SYSTEM,
		UserActionPermissions.VIEW_PATIENTS,
		sessionData?.user.roles,
	);
	const columns = useMemo(() => {
		const columns: GridColDef[] = [
			{
				field: 'id',
				headerName: 'ID',
			},
			{
				field: 'name',
				headerName: 'Name',
				flex: 1,
				valueGetter: (params: GridValueGetterParams<Patient>) =>
					`${params.row.firstName} ${params.row.lastName}`,
			},
			{
				field: 'status',
				headerName: 'Status',
				flex: 1,
				renderCell: (params: GridRenderCellParams<Patient, PatientStatus>) => (
					<PatientStatusChip status={params.value!} />
				),
			},
			{ field: 'address', headerName: 'Address', flex: 1, valueGetter: addressGetter },
			{
				field: 'Location.name',
				headerName: 'Branch',
				flex: 1,
				valueGetter: (params: GridValueGetterParams<PatientWithJoins>) => params.row.Location?.name,
			},
			{
				field: 'SOCVisitCaseManager.name',
				headerName: 'Nurse',
				flex: 1,
				valueGetter: (params: GridValueGetterParams<PatientWithJoins>) => params.row.SOCVisitCaseManager?.name,
			},
			{
				field: 'SOCVisitDate',
				headerName: 'SOC Date',
				valueFormatter: (params: GridValueFormatterParams<Date>) => formatDateShort(params.value),
				flex: 1,
			},
			{
				field: 'updatedAt',
				headerName: 'Last Updated',
				valueGetter: (params: GridValueGetterParams<PatientWithJoins>) => formatTimeAgo(params.row.updatedAt),
				flex: 1,
			},
		];
		if (isSmallScreen) {
			return columns.filter((col) => {
				return ['name', 'status', 'SOCVisitDate'].includes(col.field);
			});
		}
		if (canSeeMultipleOrgs) {
			return [
				...columns,

				{
					field: 'Organization.name',
					headerName: 'Organization',
					flex: 1,
					valueGetter: (params: GridValueGetterParams<PatientWithJoins>) => params.row.Organization?.name,
				},
			];
		}
		return columns;
	}, [isSmallScreen, canSeeMultipleOrgs]);
	return { columns };
}

function addressGetter(params: GridValueGetterParams<Patient>) {
	if (!params.row.address1) return '';
	return addressFormat(params.row);
}
