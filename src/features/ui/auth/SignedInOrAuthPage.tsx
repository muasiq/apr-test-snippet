import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { type PropsWithChildren } from 'react';

export const SignedInOrAuthPage = ({ children }: PropsWithChildren) => {
	const { status, data } = useSession();
	const router = useRouter();

	const isAuthRoute = router.pathname.startsWith('/auth');

	if ((status === 'authenticated' && data.user) || isAuthRoute) return <>{children}</>;

	return null;
};
