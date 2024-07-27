import { drive_v3 } from '@googleapis/drive';
import { client, convertToSheet } from '../../../scripts/docs';

export async function convertExcelFilesInDriveToSheet(driveFolderId: string) {
	const response = await client.files.list({
		pageSize: 150,
		includeItemsFromAllDrives: true,
		supportsAllDrives: true,
		q: `'${driveFolderId}' in parents and trashed=false and mimeType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'`,
	});

	const alreadyExistingSheetFiles = await client.files.list({
		pageSize: 150,
		includeItemsFromAllDrives: true,
		supportsAllDrives: true,
		q: `'${driveFolderId}' in parents and trashed=false`,
	});

	const results = response.data.files;
	if (!results?.length) {
		return;
	}

	for (const result of results) {
		const nameWithoutExtension = result.name?.replace('.xlsx', '');
		if (alreadyExistingSheetFiles.data.files?.some((file) => file.name === nameWithoutExtension)) {
			continue;
		}
		console.log(`Processing ${result.name}`);
		await processFile(result);
	}
}

async function processFile(file: drive_v3.Schema$File) {
	await convertToSheet(file);
}
