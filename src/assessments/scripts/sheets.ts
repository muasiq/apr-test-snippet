import 'dotenv/config';
import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';

const credentials = JSON.parse(process.env.GOOGLE_CLOUD_SHEETS_SERVICE_ACCOUNT_KEY ?? '{}') as {
	client_email: string;
	private_key: string;
};

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive.file'];

const jwt = new JWT({
	email: credentials.client_email,
	key: credentials.private_key,
	scopes: SCOPES,
});

export function connectToSpreadsheet(docId: string) {
	const doc = new GoogleSpreadsheet(docId, jwt);
	return doc;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getSheetData = async <T extends Record<string, any>>(docId: string, sheetName: string) => {
	const doc = connectToSpreadsheet(docId);
	await doc.loadInfo();
	const sheet = doc.sheetsByTitle[sheetName];
	if (!sheet) {
		throw new Error(`Sheet with name ${sheetName} not found`);
	}
	await sheet.loadCells();
	const rows = await sheet.getRows<T>();
	return { sheet, rows };
};
