import * as Sentry from '@sentry/react';
import { useState } from 'react';
import { useAlert } from '~/common/hooks/useAlert';
import { api } from '~/common/utils/api';

const MAX_REFETCH_ATTEMPTS = 3;

type Params = {
	artifactId: number;
	artifactUrl: string;
};
export function useSignedUrl({ artifactId, artifactUrl }: Params) {
	const alert = useAlert();
	const [signedUrl, setSignedUrl] = useState({ url: artifactUrl, refetchAmount: 0 });
	const [alertedOfErrorAlready, setAlertedOfErrorAlready] = useState(false);

	const { mutateAsync } = api.patientArtifact.getSignedImageUrlId.useMutation({
		onSuccess: (data) => {
			setSignedUrl((prev) => ({
				url: data.signedUrl,
				refetchAmount: prev.refetchAmount + 1,
			}));
		},
		onError: () => {
			alert.addErrorAlert({
				title: 'Something went wrong',
				message: 'We are unable to fetch the artifact at this time. Please try again later.',
			});
		},
	});

	async function refetchSignedUrl() {
		if (alertedOfErrorAlready) return;
		if (signedUrl.refetchAmount > MAX_REFETCH_ATTEMPTS) {
			Sentry.captureException(new Error(`Excessive refetch attempts for artifact: ${artifactId}`), {
				extra: {
					refetchAmount: signedUrl.refetchAmount,
					artifactId,
					error: 'Max refetch attempts reached',
				},
			});
			alert.addErrorAlert({
				title: 'Something went wrong',
				message: 'We are unable to fetch the artifact at this time. Please try again later.',
			});
			setAlertedOfErrorAlready(true);
			return;
		}
		await mutateAsync({
			id: artifactId,
			viewOnly: true,
		});
	}

	return { signedUrl, refetchSignedUrl };
}
