import { Container, Stack, Typography } from '@mui/material';
import { compact } from 'lodash';
import { useSession } from 'next-auth/react';
import { api } from '~/common/utils/api';
import { UserActionPermissions, hasActionPermission } from '~/common/utils/permissions';
import { OrgProfileTabs } from '~/common/utils/showNavBars';
import { Branches } from '~/features/screens/Office/Admin/OrgProfile/Branches';
import { EMRConfiguration } from '~/features/screens/Office/Admin/OrgProfile/EMRConfiguration';
import { LoginSettings } from '~/features/screens/Office/Admin/OrgProfile/LoginSettings';
import { ReferralSources } from '~/features/screens/Office/Admin/OrgProfile/ReferralSources';
import { PermissionGuard } from '~/features/ui/auth/PermissionGuard';
import { RouterBasedTabs, TabOptions } from '~/features/ui/layouts/RouterBasedTabs';
import { LoadingSpinner } from '~/features/ui/loading/LoadingSpinner';

export function OrgProfile(): JSX.Element {
	const { data: session } = useSession();

	const hasAttachmentTypePermission = hasActionPermission(
		UserActionPermissions.MANAGE_ATTACHMENT_TYPES,
		session?.user.roles,
	);
	const hasPhysicalAssessmentPermission = hasActionPermission(
		UserActionPermissions.MANAGE_PHYSICAL_ASSESSMENT_CATEGORIES,
		session?.user.roles,
	);

	const orgQuery = api.organization.getUserOrganization.useQuery();

	if (orgQuery.isLoading || !orgQuery.data) return <LoadingSpinner />;

	const tabOptions: TabOptions = compact([
		{
			value: OrgProfileTabs.LOGIN_SETTINGS,
			label: 'Login Settings',
			renderer: () => <LoginSettings org={orgQuery.data} />,
		},
		{
			value: OrgProfileTabs.BRANCHES,
			label: 'Branches',
			renderer: () => <Branches />,
		},
		{
			value: OrgProfileTabs.REFERRAL_SOURCES,
			label: 'Physicians and Facilities',
			renderer: () => <ReferralSources />,
		},

		hasAttachmentTypePermission || hasPhysicalAssessmentPermission
			? {
					value: OrgProfileTabs.EMR_CONFIG,
					label: 'EMR Configuration',
					renderer: () => <EMRConfiguration />,
				}
			: null,
	]);

	return (
		<PermissionGuard neededPermission={UserActionPermissions.MANAGE_LOCATIONS}>
			<Container maxWidth="xl">
				<Stack sx={{ flexGrow: 1, marginY: '0.5em' }} direction={'column'} spacing={6}>
					<Typography variant="h4">{orgQuery.data.name} Organization Settings</Typography>
					<RouterBasedTabs tabOptions={tabOptions} />
				</Stack>
			</Container>
		</PermissionGuard>
	);
}
