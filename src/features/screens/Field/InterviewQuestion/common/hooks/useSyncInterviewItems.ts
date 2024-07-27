import { UserRole } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useInterval } from 'usehooks-ts';
import { useIsOnline } from '~/common/hooks/useIsOnline';
import { ensureDbOpen } from '~/features/screens/Field/InterviewQuestion/common/utils/db';

export function useSyncInterviewItems(callback: () => Promise<void>) {
	const { status, data: userData } = useSession();
	const { isOnline } = useIsOnline();

	const shouldRunInterval = isOnline && status === 'authenticated' && userData?.user?.roles?.includes(UserRole.Nurse);

	useInterval(
		async () => {
			try {
				await ensureDbOpen();
				await callback();
			} catch (e) {
				console.error('error syncing', e);
			}
		},
		!!shouldRunInterval ? 1000 : null,
	);
}
