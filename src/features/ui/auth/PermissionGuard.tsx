import { useSession } from 'next-auth/react';
import { UserActionPermissions, hasActionPermission } from '../../../common/utils/permissions';

type Props = {
	neededPermission: UserActionPermissions;
} & React.PropsWithChildren;
export const PermissionGuard = ({ children, neededPermission }: Props): JSX.Element | null => {
	const { data: userData } = useSession();
	const userRoles = userData?.user?.roles;

	if (hasActionPermission(neededPermission, userRoles)) {
		return <>{children}</>;
	}
	return null;
};
