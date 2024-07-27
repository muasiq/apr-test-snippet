import { Box, Stack } from '@mui/material';
import { UserRole } from '@prisma/client';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { UserActionPermissions } from '../../../common/utils/permissions';
import { Pages } from '../../../common/utils/showNavBars';
import { PermissionGuard } from '../auth/PermissionGuard';
import { SignedIn } from '../auth/SignedIn';
import { UserButton } from '../auth/UserButton';
import { OrgSwitcher } from '../util/OrgSwitcher';
import { EnvIndicator } from './EnvIndicator';

export const NAVBAR_HEIGHT = '68px';
export const FULL_HEIGHT_MINUS_NAVBAR = `calc(100vh - ${NAVBAR_HEIGHT})`;

export const TopNav = () => {
	const { data: sessionData } = useSession();
	const homeHRef = sessionData?.user?.roles?.includes(UserRole.Nurse)
		? Pages.FIELD_SCHEDULE
		: Pages.OFFICE_PATIENT_LIST;

	return (
		<Stack direction={'row'} alignItems={'center'} py={2}>
			<Link href={homeHRef} passHref>
				<Box display="flex" alignItems="center" justifyContent={'flex-start'} ml={-2}>
					<Image src={'/logo.svg'} width={93} height={20} alt="logo" />
					<EnvIndicator />
				</Box>
			</Link>
			<PermissionGuard neededPermission={UserActionPermissions.SET_ACTIVE_ORG_ID}>
				<Box sx={{ width: '100%', maxWidth: 240 }} px={1}>
					<OrgSwitcher defaultOrganizationId={sessionData?.user.organizationId} />
				</Box>
			</PermissionGuard>

			<Box flexGrow={1} />
			<SignedIn>
				<UserButton />
			</SignedIn>
		</Stack>
	);
};
