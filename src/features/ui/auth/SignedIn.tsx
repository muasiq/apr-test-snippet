import { useSession } from 'next-auth/react';
import { type PropsWithChildren } from 'react';

export const SignedIn = ({ children }: PropsWithChildren) => {
	const { status, data } = useSession();

	if (status === 'authenticated' && data.user) return <>{children}</>;

	return null;
};
