import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Pages } from '../../../common/utils/showNavBars';

export const SignedOut = () => {
	const { status } = useSession();
	const router = useRouter();

	if (status === 'unauthenticated' && !router.pathname.startsWith('/auth')) {
		void router.push(Pages.SIGN_IN);
	}

	return null;
};
