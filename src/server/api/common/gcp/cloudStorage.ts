import { Storage } from '@google-cloud/storage';
import { addMinutes } from 'date-fns';
import { env } from '../../../../env.mjs';

const shouldMockCloudStorage = env.GOOGLE_CLOUD_PROJECT_ID === 'localhost';
const storage = setupStorage();

export const cloudStorage = {
	async createSignedURL(directory: string, action: 'read' | 'write', viewOnly = false, fileName?: string) {
		const expires = addMinutes(Date.now(), 5); //  5 minutes

		let responseDisposition = viewOnly ? 'inline' : 'attachment';
		if (fileName && !viewOnly) {
			responseDisposition = `attachment; filename="${fileName}"`;
		}

		const [url] = await storage.bucket(env.GOOGLE_CLOUD_STORAGE_BUCKET).file(directory).getSignedUrl({
			action: action,
			expires,
			version: 'v4',
			responseDisposition,
		});

		const resolvedUrl = shouldMockCloudStorage
			? url.replace('https://storage.googleapis.com', env.GOOGLE_CLOUD_STORAGE_ENDPOINT ?? '')
			: url;

		return { signedUrl: resolvedUrl, expires };
	},
	bucket() {
		return storage.bucket(env.GOOGLE_CLOUD_STORAGE_BUCKET);
	},
	location(directory: string) {
		return `gs://${env.GOOGLE_CLOUD_STORAGE_BUCKET}/${directory}`;
	},
};

function setupStorage() {
	if (shouldMockCloudStorage) {
		return new Storage({
			apiEndpoint: env.GOOGLE_CLOUD_STORAGE_ENDPOINT,
			projectId: env.GOOGLE_CLOUD_PROJECT_ID,
			credentials: {
				client_email: env.GOOGLE_CLOUD_STORAGE_SERVICE_ACCOUNT,
				private_key: env.GOOGLE_CLOUD_STORAGE_SERVICE_ACCOUNT_KEY.replace(/\\n/g, '\n'),
			},
		});
	}
	return new Storage({
		projectId: env.GOOGLE_CLOUD_PROJECT_ID,
		credentials: {
			client_email: env.GOOGLE_CLOUD_STORAGE_SERVICE_ACCOUNT,
			private_key: env.GOOGLE_CLOUD_STORAGE_SERVICE_ACCOUNT_KEY.replace(/\\n/g, '\n'),
		},
	});
}
