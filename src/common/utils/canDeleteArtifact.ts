import { UserRole } from '@prisma/client';
import { DataAccessPermissions, UserActionPermissions, getDataAccessLevelForPermission } from './permissions';

export const canDeleteArtifact = (
	userId?: string | null,
	userRoles?: UserRole[] | null,
	userThatUploadedId?: string | null,
): boolean => {
	const accessLevel = getDataAccessLevelForPermission(UserActionPermissions.DELETE_ARTIFACTS, userRoles);
	if (!accessLevel) return false;
	if (accessLevel === DataAccessPermissions.MINE) {
		return userThatUploadedId === userId;
	}
	return true;
};
