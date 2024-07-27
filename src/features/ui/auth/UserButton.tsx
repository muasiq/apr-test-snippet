import { Avatar, Button, ButtonProps, List, ListItem, Popover, Stack, Typography } from '@mui/material';
import { UserRole } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { appVersion } from '~/common/utils/version';
import theme from '~/styles/theme';
import { UserActionPermissions } from '../../../common/utils/permissions';
import { Pages, fieldAppOpen, onHomePage, onPage } from '../../../common/utils/showNavBars';
import { If } from '../util/If';
import { PermissionGuard } from './PermissionGuard';

export const UserButton = () => {
	const router = useRouter();
	const { data: sessionData, status } = useSession();

	const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);

	const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		if (!event) return;
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const getInitials = (): string | null | undefined => {
		if (sessionData?.user.name) {
			const names = sessionData?.user.name.split(' ');
			if (names.length === 1 && names[0]) {
				return names[0].charAt(0);
			} else if (names.length === 2 && names[0] && names[1]) {
				return names[0].charAt(0) + names[1].charAt(0);
			}
		} else {
			return null;
		}
	};

	const handleSwitchAppViewClick = () => {
		void router.push(fieldAppOpen(router.pathname) ? Pages.OFFICE_PATIENT_LIST : Pages.FIELD_SCHEDULE);
	};

	const handleHomeClick = () => {
		const roles = sessionData?.user?.roles;
		const home =
			roles?.includes(UserRole.Nurse) && roles?.length === 1 ? Pages.FIELD_SCHEDULE : Pages.OFFICE_PATIENT_LIST;
		void router.push(home);
	};

	if (status !== 'authenticated') return null;

	return (
		<>
			<Avatar
				data-cy="initials-button"
				sx={{ cursor: 'pointer', bgcolor: theme.palette.primary.main }}
				onClick={handleClick}
				src={sessionData?.user.image ?? ''}
			>
				{getInitials()}
			</Avatar>

			<Popover
				id={'user-button-popover'}
				open={!!anchorEl}
				anchorEl={anchorEl}
				onClose={handleClose}
				onClick={handleClose}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'left',
				}}
			>
				<List sx={{ p: 0, m: 0 }}>
					<If condition={!onHomePage(router.pathname)}>
						<UserButtonListItem
							permissionNeeded={UserActionPermissions.VIEW_PATIENTS}
							label={'Home'}
							onClick={handleHomeClick}
						/>
					</If>
					<If condition={!onPage(router.pathname, Pages.PROFILE)}>
						<ListItem sx={{ p: 0, m: 0 }}>
							<Button
								data-cy="profile-button"
								onClick={() => void router.push(Pages.PROFILE)}
								fullWidth
								sx={{
									p: 1.5,
									borderRadius: 0,
								}}
							>
								Profile
							</Button>
						</ListItem>
					</If>
					<If condition={fieldAppOpen(router.pathname)}>
						<UserButtonListItem
							data-cy="switch-view-button"
							permissionNeeded={UserActionPermissions.CREATE_PATIENT}
							label={'Office view'}
							onClick={handleSwitchAppViewClick}
						/>
					</If>
					<If condition={!fieldAppOpen(router.pathname)}>
						<UserButtonListItem
							data-cy="switch-view-button"
							permissionNeeded={UserActionPermissions.START_RESUME_SOC_ASSESSMENT_BUTTON_VISIBLE}
							label={'Nurse view'}
							onClick={handleSwitchAppViewClick}
						/>
					</If>
					<If condition={!onPage(router.pathname, Pages.ADMIN_MANAGE_USERS)}>
						<UserButtonListItem
							data-cy="manage-users-button"
							permissionNeeded={UserActionPermissions.ADD_REMOVE_USERS}
							label={'Manage Users'}
							onClick={() => void router.push(Pages.ADMIN_MANAGE_USERS)}
						/>
					</If>
					<If condition={!onPage(router.pathname, Pages.ADMIN_MANAGE_ORG)}>
						<UserButtonListItem
							data-cy="manage-org-button"
							permissionNeeded={UserActionPermissions.MANAGE_LOCATIONS}
							label={'Manage Org'}
							onClick={() => void router.push(Pages.ADMIN_MANAGE_ORG)}
						/>
					</If>
					<If condition={!onPage(router.pathname, Pages.PATIENT_STATS)}>
						<UserButtonListItem
							data-cy="stats-button"
							permissionNeeded={UserActionPermissions.VIEW_STATS_PAGE}
							label={'Stats'}
							onClick={() => void router.push(Pages.PATIENT_STATS)}
						/>
					</If>
					<If condition={!onPage(router.pathname, Pages.PROMPT_ITERATION)}>
						<UserButtonListItem
							data-cy="prompt-iteration-button"
							permissionNeeded={UserActionPermissions.VIEW_PROMPT_ITERATION_SCREEN}
							label={'Prompt Iteration'}
							onClick={() => void router.push(Pages.PROMPT_ITERATION)}
						/>
					</If>
					<Stack px={1} alignItems={'center'}>
						<Typography variant="helper">v{appVersion}</Typography>
					</Stack>
				</List>
			</Popover>
		</>
	);
};

type UserButtonListItemProps = {
	permissionNeeded: UserActionPermissions;
	label: string;
} & ButtonProps;

const UserButtonListItem = ({ permissionNeeded, label, ...muiButtonProps }: UserButtonListItemProps) => {
	return (
		<PermissionGuard neededPermission={permissionNeeded}>
			<ListItem sx={{ p: 0, m: 0 }}>
				<Button
					{...muiButtonProps}
					fullWidth
					sx={{
						p: 1.5,
						borderRadius: 0,
					}}
				>
					{label}
				</Button>
			</ListItem>
		</PermissionGuard>
	);
};
