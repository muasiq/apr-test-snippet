import { drive_v3 } from '@googleapis/drive';
import { difference } from 'lodash';
import { delay } from '../../../../common/utils/delay';
import { listDocs } from '../../../scripts/docs';
import { getSheetData } from '../../../scripts/sheets';

const folderForDriveOne = '1-ButXR4EnSKMUCpWJRVO9zbHPzyv-T1I';
const oneName = 'Accentra';
const folderForDriveTwo = '1MZX85j8TJt1jlQS6lQeD7MY9SnN-NzOn';
const nameTwo = 'Choice';

async function main() {
	const results = await listDocs(folderForDriveOne);
	const resultsTwo = await listDocs(folderForDriveTwo);
	if (!results?.length || !resultsTwo?.length) {
		return;
	}
	for (const file of results) {
		const matchingFile = resultsTwo.find((f) => f.name === file.name);
		if (file.name === 'Assessment Form Viewer Report') {
			if (!matchingFile) {
				console.log(`File ${file.name} not found in second drive`);
				continue;
			}
			continue;
		}
		if (file.name?.includes('Wound Assessment Question Group')) {
			const matchingFile = resultsTwo.find((f) => f.name?.includes('Wound Assessment Question Group'));
			if (!matchingFile) {
				console.log(`File ${file.name} not found in second drive`);
				continue;
			}
			continue;
		}
		if (file.name?.includes('SN Clinical Pathways')) {
			const matchingFile = resultsTwo.find((f) => f.name?.includes('SN Clinical Pathways'));
			if (!matchingFile) {
				console.log(`File ${file.name} not found in second drive`);
				continue;
			}
			continue;
		}
		if (!matchingFile) {
			console.log(`File ${file.name} not found in second drive`);
			continue;
		}
		if (file.name?.includes('TBD for SOC')) {
			continue;
		}
		await delay(10000);
		console.log(`Comparing ${file.name} and ${matchingFile.name}`);
		try {
			await simpleCompareFiles(file, matchingFile);
		} catch (e) {
			console.error(e);
			continue;
		}
	}
}

async function simpleCompareFiles(file: drive_v3.Schema$File, fileTwo: drive_v3.Schema$File, sheetName = 'Sheet1') {
	const { rows: data } = await getSheetData(file.id!, sheetName);
	const { rows: dataTwo } = await getSheetData(fileTwo.id!, sheetName);
	const firstSheetColumn1 = data.map((row) => {
		const rowValues = row.toObject();
		const string = JSON.stringify(rowValues);
		return string;
	});
	const secondSheetColumn1 = dataTwo.map((row) => {
		const rowValues = row.toObject();
		const string = JSON.stringify(rowValues);
		return string;
	});
	const missingInSecond = difference(firstSheetColumn1, secondSheetColumn1);
	const missingInFirst = difference(secondSheetColumn1, firstSheetColumn1);
	console.log('missing in ', oneName, missingInFirst.length);
	console.log('missing in ', nameTwo, missingInSecond.length);
}

main().catch(console.error);
