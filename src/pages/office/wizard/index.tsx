import { GetServerSideProps } from 'next';
import { UserActionPermissions } from '~/common/utils/permissions';
import { serverSidePermissionGuard } from '~/common/utils/serverSidePermissionGuard';
import { CreatePatientWizard } from '~/features/screens/Office/wizard';

const CreatePatientPage = () => {
	return <CreatePatientWizard />;
};

export const getServerSideProps: GetServerSideProps = serverSidePermissionGuard(
	UserActionPermissions.GENERATE_TEST_DATA,
);

export default CreatePatientPage;
