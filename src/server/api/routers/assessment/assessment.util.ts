import { isNil, isString, uniq } from 'lodash';
import { AssessmentQuestion } from '../../../../assessments/types';

export function ensureSuggestionChoiceIsValid(
	choice: string | number | string[] | null | object,
	question: AssessmentQuestion,
) {
	if (choice === null) return null;
	if (!question?.responses?.length) return choice;
	const validResponseTexts = question.responses.map((r) => r.text);
	if (Array.isArray(choice)) {
		const validItems = validResponseTexts.filter((vr) => choice.includes(vr));
		const unMatchedItems = choice.filter((c: string) => !validResponseTexts.includes(c)) as string[];
		const partialMatchedItems = unMatchedItems.map((i) => partialMatch(i, question));
		return uniq([...validItems, ...partialMatchedItems]).filter((v) => !isNil(v));
	}
	if (isString(choice)) {
		if (choice?.toString()?.toLowerCase() == 'null') return null;
		const isValid = validResponseTexts.includes(choice);
		return isValid ? choice : partialMatch(choice, question) ?? null;
	}
	return choice;
}

function partialMatch(choice: string, question: AssessmentQuestion) {
	if (!question?.responses?.length) return choice;
	return question.responses
		.map((r) => r.text)
		.find((t) => t.toString().toLowerCase().includes(choice?.toString().toLowerCase()));
}
