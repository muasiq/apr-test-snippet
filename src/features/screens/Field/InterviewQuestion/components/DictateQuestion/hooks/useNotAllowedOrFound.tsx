import { useCallback } from 'react';
import { useAlert } from '~/common/hooks/useAlert';

export function useNotAllowedOrFound() {
	const alert = useAlert();

	return useCallback(
		(message: DOMException) => {
			if (message.name === 'NotAllowedError' || message.name === 'PermissionDeniedError') {
				alert.addErrorAlert({
					title: 'Microphone Access Denied',
					message:
						'You have denied access to your microphone. Please enable microphone access in your browser settings to use this feature.',
				});
			} else {
				alert.addErrorAlert({
					title: 'Error',
					message: message.message,
				});
			}
		},
		[alert],
	);
}
