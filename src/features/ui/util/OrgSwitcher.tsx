import { MenuItem, TextField } from '@mui/material';
import { useRouter } from 'next/router';
import { useCallback, useEffect } from 'react';
import { useSessionStorage } from 'usehooks-ts';
import { ACTIVE_ORG_SESSION_STORAGE_KEY } from '~/common/constants/constants';
import { api } from '~/common/utils/api';
import { UserActionPermissions } from '~/common/utils/permissions';
import { Pages } from '~/common/utils/showNavBars';
import { PermissionGuard } from '~/features/ui/auth/PermissionGuard';
import { trpc } from '../../../common/utils/trpc';

export type OrgSwitcherProp = {
	defaultOrganizationId?: number;
};

const routesToShowSwitcherOn = [
	Pages.FIELD_PATIENT_LIST,
	Pages.OFFICE_PATIENT_LIST,
	Pages.ADMIN_MANAGE_ORG,
	Pages.ADMIN_MANAGE_USERS,
	Pages.FIELD_SCHEDULE,
	Pages.PROMPT_ITERATION,
];

export const OrgSwitcher = ({ defaultOrganizationId }: OrgSwitcherProp) => {
	const router = useRouter();
	const { patientId } = router.query;
	const [sessionStorageActiveOrganizationId, setSessionStorageActiveOrganizationId] = useSessionStorage(
		ACTIVE_ORG_SESSION_STORAGE_KEY,
		defaultOrganizationId,
	);
	const organizations = api.organization.getAll.useQuery();
	const patientQuery = api.patient.getById.useQuery(
		{ id: Number(patientId), includes: {} },
		{ enabled: !!patientId },
	);
	const utils = trpc.useUtils();

	const setActiveOrgId = useCallback(
		(id: number) => {
			setSessionStorageActiveOrganizationId(id);
			void utils.invalidate();
		},
		[setSessionStorageActiveOrganizationId, utils],
	);

	const onOrgChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const orgId = Number(event.target.value);
		setActiveOrgId(orgId);
	};

	useEffect(() => {
		const orgId = patientQuery.data?.organizationId;
		if (patientId && orgId && orgId !== sessionStorageActiveOrganizationId) {
			setActiveOrgId(orgId);
		}
	}, [patientQuery.data?.organizationId, patientId, sessionStorageActiveOrganizationId, setActiveOrgId]);

	if (!routesToShowSwitcherOn.includes(router.pathname as Pages)) {
		return null;
	}

	return (
		<PermissionGuard neededPermission={UserActionPermissions.SEE_ORG_SWITCHER}>
			<TextField
				value={sessionStorageActiveOrganizationId ?? ''}
				onChange={onOrgChange}
				fullWidth
				size="small"
				select
				placeholder="Select Organization"
			>
				{(organizations.data ?? []).map((option) => (
					<MenuItem key={option.id} value={option.id}>
						{option.name}
					</MenuItem>
				))}
			</TextField>
		</PermissionGuard>
	);
};
