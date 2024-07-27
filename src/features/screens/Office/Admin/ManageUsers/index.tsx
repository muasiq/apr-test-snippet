import { Box, Chip, Fade, FormControl, MenuItem, Select, Stack, Typography } from '@mui/material';
import { DataGridPro, GridComparatorFn } from '@mui/x-data-grid-pro';
import { UserRole } from '@prisma/client';
import { isEqual, startCase } from 'lodash';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useAlert } from '~/common/hooks/useAlert';
import { RouterOutputs, api } from '~/common/utils/api';
import { trpc } from '~/common/utils/trpc';
import { LoadingButton } from '~/features/ui/loading/LoadingButton';
import { ChangeUserLocationInput, ChangeUserRoleInput } from '~/server/api/routers/user/user.inputs';
import { allowedRolesToEdit } from '../../../../../common/utils/permissions';

function sortSelectedAnswers(sel: Array<string | number>): Array<string | number> {
	return sel.sort((a, b) => {
		if (typeof a === 'number' && typeof b === 'number') {
			return a - b;
		} else if (typeof a === 'string' && typeof b === 'string') {
			return a.localeCompare(b);
		} else {
			return typeof a === 'string' ? 1 : -1;
		}
	});
}

export const ManageUsersScreen = () => {
	const { data: sessionData } = useSession();

	const [roleEditedUsers, setRoleEditedUsers] = useState<ChangeUserRoleInput>({ changes: [] });
	const [branchEditedUsers, setBranchEditedUsers] = useState<ChangeUserLocationInput>({ changes: [] });

	const alert = useAlert();
	const { data: allUsersData, isLoading } = api.user.getAll.useQuery();
	const branches = api.organization.getLocations.useQuery();
	const changeUserRoleMutation = api.user.changeUserRole.useMutation({
		onSuccess: () => {
			setRoleEditedUsers({ changes: [] });
			void utils.user.getAll.invalidate();
		},
		onError: (error) => {
			alert.addErrorAlert({
				title: 'Error',
				message: error.message,
			});
		},
	});
	const changeUserLocationMutation = api.user.changeUserLocation.useMutation({
		onSuccess: () => {
			setBranchEditedUsers({ changes: [] });
			void utils.user.getAll.invalidate();
		},
		onError: (error) => {
			alert.addErrorAlert({
				title: 'Error',
				message: error.message,
			});
		},
	});
	const utils = trpc.useUtils();

	const handleRoleChange = (userId: string, newRoles: UserRole[]) => {
		if (!allUsersData) return;

		const updatedUsers = roleEditedUsers.changes.filter((user) => user.userId !== userId);
		const user = allUsersData.find((user) => user.id === userId);
		const changes = { changes: updatedUsers };

		if (user && isEqual(user.roles, newRoles)) {
			setRoleEditedUsers(changes);
			return;
		}

		updatedUsers.push({ userId, roles: newRoles });

		setRoleEditedUsers(changes);
	};

	const handleBranchChange = (userId: string, newBranches: number[]) => {
		if (!allUsersData) return;

		const updatedUsers = branchEditedUsers.changes.filter((user) => user.userId !== userId);
		const user = allUsersData.find((user) => user.id === userId);
		const changes = { changes: updatedUsers };

		if (
			user &&
			isEqual(
				user.Locations.map((l) => l.id),
				newBranches,
			)
		) {
			setBranchEditedUsers(changes);
			return;
		}

		updatedUsers.push({ userId, branches: newBranches });
		setBranchEditedUsers(changes);
	};

	const handleSaveChanges = async () => {
		await Promise.all([
			changeUserRoleMutation.mutateAsync(roleEditedUsers),
			changeUserLocationMutation.mutateAsync(branchEditedUsers),
		]);
	};

	const roleOptions = allowedRolesToEdit(sessionData?.user?.roles);

	const canEditUserBranch = (user: RouterOutputs['user']['getAll'][number]) => {
		const editableRoles = [UserRole.Nurse, UserRole.BranchAdmin, UserRole.BranchOffice] as UserRole[];
		return user.roles.some((role) => editableRoles.includes(role));
	};

	const customOrgSortComparator: GridComparatorFn<{ name: string }> = (v1, v2) => v1.name.localeCompare(v2.name);
	const customBranchSortComparator: GridComparatorFn<Array<{ id: number; name: string; organizationId: number }>> = (
		v1,
		v2,
	) => {
		const sortKey = (v: Array<{ id: number; name: string; organizationId: number }>) => {
			if (!v.length) {
				return '';
			}
			return v[0]!.name;
		};
		const r1 = sortKey(v1);
		const r2 = sortKey(v2);
		return r1.localeCompare(r2);
	};

	const customMultipleFieldSortComparator: GridComparatorFn<Array<string | undefined>> = (v1, v2) => {
		const sortKey = (v: Array<string | undefined>) => {
			if (!v.length) {
				return '';
			}
			return v[0];
		};
		const r1 = sortKey(v1);
		const r2 = sortKey(v2);
		return r1!.localeCompare(r2!);
	};

	const unsavedChanges = !!(roleEditedUsers.changes.length || branchEditedUsers.changes.length);

	return (
		<>
			<Box bgcolor={'glass'}>
				<Stack direction={'row'} justifyContent={'space-between'} p={2}>
					<Typography variant={'h5'}>Manage Users</Typography>

					<Fade in={unsavedChanges}>
						<Box>
							<LoadingButton
								color="primary"
								variant="contained"
								onClick={handleSaveChanges}
								label={`Save Changes (${
									roleEditedUsers.changes.length + branchEditedUsers.changes.length
								})`}
								isLoading={changeUserRoleMutation.isLoading || changeUserLocationMutation.isLoading}
							/>
						</Box>
					</Fade>
				</Stack>
				<DataGridPro
					rows={allUsersData ?? []}
					loading={isLoading}
					disableRowSelectionOnClick
					columns={[
						{ field: 'name', headerName: 'Name', flex: 1 },
						{ field: 'email', headerName: 'Email', flex: 1 },
						{
							field: 'Organization',
							headerName: 'Organization',
							flex: 1,
							sortComparator: customOrgSortComparator,
							renderCell: (params) => (
								<Typography variant="body2">{params.row.Organization.name}</Typography>
							),
						},
						{
							field: 'Locations',
							headerName: 'Branches',
							flex: 1,
							sortComparator: customBranchSortComparator,
							renderCell: (params) => {
								return canEditUserBranch(params.row) ? (
									<FormControl fullWidth>
										<Select
											multiple
											value={
												branchEditedUsers.changes.find((user) => user.userId === params.row.id)
													?.branches ?? params.row.Locations.map((location) => location.id)
											}
											onChange={(e) =>
												handleBranchChange(params.row.id, e.target.value as number[])
											}
											renderValue={(selected) => (
												<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
													{sortSelectedAnswers(selected).map((value) => (
														<Chip
															key={value}
															size="small"
															label={
																branches.data?.find((b) => b.id === value)?.name ?? ''
															}
														/>
													))}
												</Box>
											)}
											sx={{
												'.MuiOutlinedInput-notchedOutline': { border: 'none' },
											}}
										>
											{branches.data
												?.filter((l) => l.organizationId === params.row.organizationId)
												.map((branch) => (
													<MenuItem key={branch.id} value={branch.id}>
														<Typography variant="body2">{branch.name}</Typography>
													</MenuItem>
												))}
										</Select>
									</FormControl>
								) : (
									' '
								);
							},
						},
						{
							field: 'roles',
							headerName: 'Roles',
							flex: 1,
							sortComparator: customMultipleFieldSortComparator,
							renderCell: (params) => {
								return (
									<FormControl fullWidth>
										<Select
											multiple
											value={
												roleEditedUsers.changes.find((user) => user.userId === params.row.id)
													?.roles ?? params.row.roles
											}
											onChange={(e) =>
												handleRoleChange(params.row.id, e.target.value as UserRole[])
											}
											renderValue={(selected) => (
												<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
													{selected.map((value) => (
														<Chip key={value} size="small" label={startCase(value)} />
													))}
												</Box>
											)}
											sx={{
												'.MuiOutlinedInput-notchedOutline': {
													border: 'none',
												},
											}}
										>
											{roleOptions.map((role) => (
												<MenuItem key={role} value={role}>
													<Typography variant="body2">{role}</Typography>
												</MenuItem>
											))}
										</Select>
									</FormControl>
								);
							},
						},
					]}
				/>
			</Box>
		</>
	);
};
