import * as crypto from 'crypto';
import fs from 'fs';
import { connectToSpreadsheet, getSheetData } from '../../../scripts/sheets';

export enum RowType {
	MULTI_SELECT = 'MultiSelect',
	SELECT = 'Select',
	TEXT = 'Text',
	DATE = 'Date',
	NUMERIC = 'Numeric',
	UNKNOWN = 'Unknown',
}

export function getAllKeys(file: object[]) {
	const keys = new Set<string>();
	for (const question of file) {
		for (const key of Object.keys(question)) {
			keys.add(key);
		}
	}
	return [...keys];
}
export async function clearSheet(docId: string, worksheet: string) {
	const doc = connectToSpreadsheet(docId);
	await doc.loadInfo();
	const existingSheet = doc.sheetsByTitle[worksheet];
	if (existingSheet) {
		await existingSheet.delete();
	}
	return doc;
}

export async function writeDataFile(docId: string, worksheet: string, savePath: string) {
	const { rows } = await getSheetData(docId, worksheet);
	const toWrite = rows.map((row) => {
		const plain = row.toObject();
		const responses = plain.responses ? (JSON.parse(plain.responses as string) as unknown) : null;
		return { ...plain, responses };
	});
	const file = JSON.stringify(toWrite, null, 2);
	fs.writeFileSync(savePath, file);
}

export async function uploadToSheet<T extends { responses: object | undefined }>(
	sheetId: string,
	tab: string,
	data: T[],
) {
	const doc = await clearSheet(sheetId, tab);
	const allKeys = getAllKeys(data);
	const sheet = await doc.addSheet({ title: tab, headerValues: allKeys });
	const toAdd = data.map((d) => {
		return {
			...d,
			responses: JSON.stringify(d.responses),
		};
	});
	try {
		return await sheet.addRows(toAdd);
	} catch (e) {
		console.error(e);
	}
}

export async function uploadToSheetSimple(sheetId: string, tab: string, data: object[]) {
	const doc = await clearSheet(sheetId, tab);
	const allKeys = getAllKeys(data);
	const sheet = await doc.addSheet({ title: tab, headerValues: allKeys });
	const toAdd = data.map((d) => ({ ...d }));
	try {
		return await sheet.addRows(toAdd);
	} catch (e) {
		console.error(e);
	}
}

export function shortHash(s: string) {
	const hash = crypto.createHash('md5');
	hash.update(s);
	return hash.digest('hex').slice(0, 6);
}
