import { useRouter } from 'next/router';
import { useEffect } from 'react';

type Props = {
	enabled?: boolean;
	message?: string;
	onConfirm?: () => void;
	onCancel?: () => void;
};

export const useUnsavedInputAlert = ({ enabled, message, onConfirm, onCancel }: Props) => {
	const router = useRouter();

	useEffect(() => {
		const onRouteChangeStart = (nextUrl: string) => {
			const url = new URL(nextUrl, window.location.origin);
			const queryParams = url.searchParams;
			const timeout = queryParams.get('timeout');

			if (enabled && timeout !== 'true') {
				const confirmed = confirm(message ?? 'You have unsaved changes, are you sure you want to leave?');
				if (!confirmed) {
					router.events.emit('routeChangeError', '', '', { shallow: false });
					onCancel?.();
					throw 'routeChange aborted by user. Ignore this error';
				} else {
					onConfirm?.();
				}
			}
		};
		const onPageUnload = (e: BeforeUnloadEvent) => {
			if (enabled) {
				e.preventDefault();
			}
		};

		router.events.on('routeChangeStart', onRouteChangeStart);
		window.addEventListener('beforeunload', onPageUnload);

		return () => {
			router.events.off('routeChangeStart', onRouteChangeStart);
			window.removeEventListener('beforeunload', onPageUnload);
		};
	}, [enabled, router, message, onConfirm, onCancel]);
};
