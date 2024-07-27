import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { Workbox } from 'workbox-window';
import { ConfirmDialog } from '../Dialog/ConfirmDialog';
import { useMixpanel } from '../layouts/Mixpanel/useMixpanel';

declare global {
	interface Window {
		workbox: Workbox;
	}
}

const AppUpdatePrompt = () => {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const mixpanel = useMixpanel();

	const pathname = useRef(router.pathname);
	pathname.current = router.pathname;

	useEffect(() => {
		if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.workbox !== undefined) {
			const wb = window.workbox;

			const promptNewVersionAvailable = () => {
				mixpanel?.track('App Update Available');
				if (['/field/schedule', '/patient/list'].includes(pathname.current)) {
					handleUpdate();
				} else {
					setIsDialogOpen(true);
				}
			};

			wb.addEventListener('waiting', promptNewVersionAvailable);

			void wb.register();

			return () => {
				wb.removeEventListener('waiting', promptNewVersionAvailable);
			};
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleUpdate = () => {
		setIsLoading(true);
		if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.workbox !== undefined) {
			const wb = window.workbox;

			// force reload if controlling event not fired
			const forceReloadTimeout = setTimeout(() => window.location.reload(), 5000);

			wb.addEventListener('controlling', () => {
				clearTimeout(forceReloadTimeout);
				window.location.reload();
			});

			wb.messageSkipWaiting();
		} else {
			window.location.reload();
		}
	};

	const handleClose = () => {
		setIsDialogOpen(false);
		setIsLoading(false);
	};

	return (
		<>
			<ConfirmDialog
				open={isDialogOpen}
				title="Update Available"
				body="A newer version of this web app is available, reload to update?"
				onConfirm={handleUpdate}
				onClose={handleClose}
				isLoading={isLoading}
				confirmButtonLabel="Update Now"
			/>
		</>
	);
};

export default AppUpdatePrompt;
