import { uploadToSheetSimple } from '~/assessments/home-care-home-base/data-files/scripts/util';
import { getSheetData } from '~/assessments/scripts/sheets';

const apricotSuperConfigSheetId = '14jWWlc9rCXC7sck0eEh-uS6CXDWSAF-vdZA6nLtjiCU';

export interface AllQuestionBankItem {
	source: string;
	orgSource: string;
	id: string;
	originalText: string;
	cleanedText: string;
}

export async function getQuestionBank() {
	const existingData = await getSheetData<AllQuestionBankItem>(apricotSuperConfigSheetId, 'question-bank');
	return existingData.rows.map((row) => row.toObject());
}

export async function uploadNewItemsToAllQuestionsBank(items: AllQuestionBankItem[]) {
	const existingData = await getQuestionBank();
	const newItems = items.filter((item) => !existingData.some((row) => row.id === item.id));
	if (newItems.length) {
		await uploadToSheetSimple(apricotSuperConfigSheetId, 'question-bank', [...existingData, ...newItems]);
	}
}
