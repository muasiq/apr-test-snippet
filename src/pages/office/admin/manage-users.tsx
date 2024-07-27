import { GetServerSideProps } from 'next';
import { ManageUsersScreen } from '~/features/screens/Office/Admin/ManageUsers';
import { UserActionPermissions } from '../../../common/utils/permissions';
import { serverSidePermissionGuard } from '../../../common/utils/serverSidePermissionGuard';

const ManageUsersPage = () => {
	return <ManageUsersScreen />;
};

export const getServerSideProps: GetServerSideProps = serverSidePermissionGuard(UserActionPermissions.ADD_REMOVE_USERS);

export default ManageUsersPage;
