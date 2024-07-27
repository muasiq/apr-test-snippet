import {
	AllQuestionBankItem,
	uploadNewItemsToAllQuestionsBank,
} from '~/assessments/apricot/scripts/uploadNewItemsToAllQuestionsBank';
import { allPhysicalAssessmentQuestions } from '~/assessments/home-care-home-base/orgs/accentra/data-files';
import { allPhysicalAssessmentQuestions as choice } from '~/assessments/home-care-home-base/orgs/choice/data-files';
import { allPhysicalAssessmentQuestions as elara } from '~/assessments/home-care-home-base/orgs/elara/data-files';
import { AssessmentQuestion } from '~/assessments/types';

async function main() {
	await uploadNewItemsToAllQuestionsBank(
		allPhysicalAssessmentQuestions.map((pa) => paToQuestionBank(pa, 'Accentra')),
	);
	await uploadNewItemsToAllQuestionsBank(elara.map((pa) => paToQuestionBank(pa, 'Elara')));

	await uploadNewItemsToAllQuestionsBank(choice.map((pa) => paToQuestionBank(pa, 'Choice')));
}

function paToQuestionBank(data: AssessmentQuestion, orgSource: string): AllQuestionBankItem {
	const { id, originalText, text, source } = data;
	return {
		id,
		originalText: originalText ?? text,
		cleanedText: text,
		source,
		orgSource,
	};
}

main().catch(console.error);
