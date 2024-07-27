import { GetServerSidePropsContext, PreviewData } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { getServerAuthSession } from '../../server/auth';
import { UserActionPermissions, hasActionPermission } from './permissions';

export const serverSidePermissionGuard =
	(permissionNeeded: UserActionPermissions) =>
	async (context: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>) => {
		const session = await getServerAuthSession(context);
		const userRoles = session?.user.roles;

		if (!hasActionPermission(permissionNeeded, userRoles)) {
			console.error(
				`Error - user ${session?.user.id} attempted to access ${
					context.resolvedUrl
				} with roles ${userRoles?.join(', ')}`,
			);
			return {
				redirect: {
					destination: '/office/patient/list',
					permanent: true,
				},
			};
		} else {
			return {
				props: {},
			};
		}
	};
