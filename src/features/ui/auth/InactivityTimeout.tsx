/* eslint-disable @typescript-eslint/unbound-method */
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { useIdleTimer } from 'react-idle-timer';
import { INACTIVITY_TIMEOUT } from '~/common/constants/constants';
import { Pages } from '../../../common/utils/showNavBars';

export function InactivityTimeout() {
	const { data: session } = useSession();
	const router = useRouter();

	const onIdle = useCallback(async () => {
		const params = new URLSearchParams();
		if (router.pathname !== Pages.SIGN_IN.toString()) params.set('callback', router.asPath);
		if (session?.user?.email) params.set('email', session.user.email);
		params.set('timeout', 'true');
		await router.push(`${Pages.SIGN_IN}?${params.toString()}`);
		await signOut({ redirect: false });
	}, [router, session?.user?.email]);

	useIdleTimer({
		timeout: INACTIVITY_TIMEOUT,
		crossTab: true,
		leaderElection: true,
		syncTimers: 200,
		disabled: process.env.NEXT_PUBLIC_APRICOT_ENV === 'development',
		onIdle,
	});

	return <></>;
}
