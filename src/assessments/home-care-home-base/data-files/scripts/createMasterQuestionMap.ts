import { drive_v3 } from '@googleapis/drive';
import { titleCase } from 'title-case';
import { listDocs } from '../../../scripts/docs';
import { getSheetData } from '../../../scripts/sheets';
import { shortHash, uploadToSheet, uploadToSheetSimple } from './util';

interface MasterQuestionMapRow {
	text: string;
	category: string;
	subCategory: string;
	type: string;
	active: string;
	responses: object;
}

export async function createMasterQuestionMap(
	file: drive_v3.Schema$File,
	configFileId: string,
	allFilesInFolder: drive_v3.Schema$File[],
) {
	const masterQuestionData = await getSheetData(file.id!, 'Sheet1');
	const parsed = masterQuestionData.rows.map(async (row) => {
		const rowData = row.toObject();
		const text = (rowData.Item as string)?.trim();
		const type = (rowData['Item Type'] as string)?.trim();
		const answersObject = await resolveAnswers(type, rowData, allFilesInFolder);
		const cleaned = {
			id: SOCStandardHash(text),
			text,
			category: rowData.Category as string,
			subCategory: rowData.Subcategory as string,
			type,
			active: rowData['Represent in Apricot data model?'] as string,
			responses: answersObject,
		};
		return cleaned;
	});
	const parsedResolved = await Promise.all(parsed);
	await uploadToSuperConfig(parsedResolved, configFileId);
}

async function resolveAnswers(
	rowType: string,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	rowData: Partial<Record<string, any>>,
	allFilesInFolder: drive_v3.Schema$File[],
) {
	const answersFileName = rowData.AnswerFileNameInFolder as string;
	const answers = rowData.Answers as string;
	const selectType = rowType === 'Select All That Apply' || rowType === 'Single Select';
	if (selectType) {
		if (answersFileName) {
			return await parseAnswersFile(answersFileName, allFilesInFolder);
		} else {
			if (!answers.startsWith('https://')) {
				return answers.split(',').map((a) => {
					return { text: titleCase(a.trim().toLowerCase()) };
				});
			} else {
				return [];
			}
		}
	} else {
		return [];
	}
}

async function uploadToSuperConfig(parsed: MasterQuestionMapRow[], configFileId: string) {
	await uploadToSheet(configFileId, 'soc-standard-assessment', parsed);
}

export async function parseAnswersFile(answersFileName: string, choiceFiles: drive_v3.Schema$File[]) {
	const answersFile = choiceFiles.find((f) => f.name === answersFileName);
	if (!answersFile) throw new Error('Answers file not found ' + answersFileName);
	const answersData = await getSheetData(answersFile.id!, 'Sheet1');
	const allData = answersData.rows.map((row) => {
		const rowData = row.toObject();
		const keys = Object.keys(rowData);
		const key = keys.find((k) => k !== 'Active' && k !== 'Required' && k !== 'Medication');
		if (!key) throw new Error('No key found');
		const text = rowData[key] as string;
		const trimmed = text?.trim();
		const cleanedText = titleCase(trimmed.toLowerCase());
		return { text: cleanedText };
	});
	return allData;
}

function SOCStandardHash(s: string) {
	return `SOCS-${shortHash(s)}`;
}

interface ExistingApricotConfig {
	id: string;
	originalText: string;
	text: string;
	alternateQuestionText: string;
	questionType: string;
	responses: string;
	codingInstructions: string;
	template: string;
}

export const toReplace: Record<string, string> = {
	'Disaster Mobility Status:': 'Disaster Statuses',
	"Indicate the patient's religion.": 'Religions',
	"Indicate the patient's allergies.": 'Allergies',
	'Indicate the appropriate activity level and/or activity limitations for this patient.': 'Activities Permitted',
	'Indicate the discharge plans for this patient, following the current home health care episode.': 'Discharge Plans',
	"Indicate the patient's current functional limitations.": 'Functional Limitations',
	"Indicate the patient's current mental status.": 'Mental Status',
	"Indicate the patient's current nutritional requirements or restrictions.": 'Nutritional Requirements',
	'Indicate any safety measures needed by the patient.': 'Safety Measures',
	"Indicate the patient's rehabilitation potential.": 'Rehab Potential',
};

export async function copyMasterQuestionMapFromApricotCore(
	toSheetId: string,
	driveFolderId: string,
	tab = 'soc-standard-assessment',
) {
	const apricotSheetId = '14jWWlc9rCXC7sck0eEh-uS6CXDWSAF-vdZA6nLtjiCU';
	const allFiles = await listDocs(driveFolderId);
	if (!allFiles) throw new Error('No files found in folder');
	const { rows } = await getSheetData<ExistingApricotConfig>(apricotSheetId, tab);
	const allData = rows.map((row) => row.toObject());
	const withNewResponses = allData.map(async (row) => {
		const { text } = row;
		if (!text) {
			console.log(row);
			throw new Error('No text found');
		}
		const replaceMatch = toReplace[text];
		if (replaceMatch) {
			if (replaceMatch === 'Allergies') {
				row.responses = 'Too Big For Sheet Cell, will replace on download';
			} else {
				console.log('Replacing', text, 'with', replaceMatch);
				const newResponses = await parseAnswersFile(replaceMatch, allFiles);
				row.responses = JSON.stringify(newResponses);
			}
		}
		return row;
	});
	const withNewResponsesResolved = await Promise.all(withNewResponses);
	await uploadToSheetSimple(toSheetId, tab, withNewResponsesResolved);
}
