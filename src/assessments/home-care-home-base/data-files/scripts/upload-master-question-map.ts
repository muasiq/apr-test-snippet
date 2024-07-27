import { GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import { QuestionBase } from '../../../types';
import masterQuestionMap from '../master-question-map.json';
import { clearSheet, getAllKeys } from './util';

const homeCareHomeBaseDocId = '1KU8OKgs8HA4FzkjMlX_ektsIAkKwZkEJpNTdFzp0KGg';
const worksheet = 'MasterQuestionMap';

async function main() {
	const doc = await clearSheet(homeCareHomeBaseDocId, worksheet);
	const allKeys = getAllKeys(masterQuestionMap as QuestionBase[]);
	const sheet = await doc.addSheet({ title: worksheet, headerValues: allKeys });
	await addRows(sheet);
}

async function addRows(sheet: GoogleSpreadsheetWorksheet) {
	const toAdd = (masterQuestionMap as QuestionBase[]).map((question) => {
		return formatRow(question);
	});
	await sheet.addRows(toAdd);
}

function formatRow(question: QuestionBase) {
	const {
		id,
		type,
		text,
		responses,
		questionType,
		codingInstructions,
		itemNotes,
		alternateQuestionText,
		template,
		hints,
		examples,
	} = question;
	const toInsert = {
		id,
		type: type ?? '',
		text: text ?? '',
		responses: responses
			? JSON.stringify(
					responses.map((r) => {
						return {
							code: r.code ?? '',
							text: r.text ?? '',
							followup: r.followup ?? '',
						};
					}),
				)
			: '',
		questionType: questionType ?? '',
		codingInstructions: codingInstructions ?? '',
		itemNotes: itemNotes ?? '',
		alternateQuestionText: alternateQuestionText ?? '',
		template: template ?? '',
		hints: hints ?? '',
		examples: examples ?? '',
	};
	return toInsert;
}

main().catch(console.error);
