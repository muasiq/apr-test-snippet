import * as Sentry from '@sentry/react';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

function SentryUserManager() {
	const { data: session } = useSession();

	useEffect(() => {
		if (session?.user?.email) {
			Sentry.setUser({
				email: session.user.email,
				id: session.user.id,
			});
		} else {
			Sentry.setUser(null);
		}
	}, [session?.user]);
	return null;
}

export { SentryUserManager };
