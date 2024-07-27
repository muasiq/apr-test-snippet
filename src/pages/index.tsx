import { UserRole } from '@prisma/client';
import { GetServerSideProps } from 'next';
import { Pages } from '../common/utils/showNavBars';
import { getServerAuthSession } from '../server/auth';

const HomePage = () => {
	return null;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
	const session = await getServerAuthSession(context);
	const userRoles = session?.user.roles;
	if (!userRoles?.length) {
		return {
			redirect: {
				destination: Pages.SIGN_IN,
				permanent: true,
			},
		};
	}
	if (userRoles.includes(UserRole.Nurse) && userRoles.length === 1) {
		return {
			redirect: {
				destination: Pages.FIELD_SCHEDULE,
				permanent: true,
			},
		};
	} else {
		return {
			redirect: {
				destination: Pages.OFFICE_PATIENT_LIST,
				permanent: true,
			},
		};
	}
};

export default HomePage;
