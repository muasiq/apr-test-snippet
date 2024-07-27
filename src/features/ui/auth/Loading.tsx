import { useSession } from 'next-auth/react';
import { LoadingSpinner } from '../loading/LoadingSpinner';

export const Loading = () => {
	const { status } = useSession();

	if (status === 'loading') return <LoadingSpinner />;

	return null;
};
