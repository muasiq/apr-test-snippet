import * as drive from '@googleapis/drive';
import 'dotenv/config';

const credentials = JSON.parse(process.env.GOOGLE_CLOUD_SHEETS_SERVICE_ACCOUNT_KEY ?? '{}') as {
	client_email: string;
	private_key: string;
};

const scopes = ['https://www.googleapis.com/auth/drive'];

const auth = new drive.auth.JWT({
	email: credentials.client_email,
	key: credentials.private_key,
	scopes,
});

export const client = drive.drive({
	version: 'v3',
	auth,
});

export async function listDocs(folder: string) {
	const response = await client.files.list({
		pageSize: 150,
		includeItemsFromAllDrives: true,
		supportsAllDrives: true,
		q: `'${folder}' in parents and trashed=false and mimeType='application/vnd.google-apps.spreadsheet'`,
	});

	return response.data.files;
}

export async function convertToSheet(file: drive.drive_v3.Schema$File) {
	await client.files.copy({
		supportsAllDrives: true,
		fileId: file.id!,
		requestBody: {
			mimeType: 'application/vnd.google-apps.spreadsheet',
		},
	});
}
