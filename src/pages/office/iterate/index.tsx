import { GetServerSideProps } from 'next';
import { UserActionPermissions } from '../../../common/utils/permissions';
import { serverSidePermissionGuard } from '../../../common/utils/serverSidePermissionGuard';
import { PromptIterateScreen } from '../../../features/screens/Office/PromptIterate';

const PromptIteratePage = () => {
	return <PromptIterateScreen />;
};

export const getServerSideProps: GetServerSideProps = serverSidePermissionGuard(
	UserActionPermissions.VIEW_PROMPT_ITERATION_SCREEN,
);

export default PromptIteratePage;
