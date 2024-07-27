import { AssessmentQuestionType, QuestionBase } from '../types';

export function lookupQuestionType(q: QuestionBase): AssessmentQuestionType {
	if (['select', 'single select', 'code'].includes(q.questionType?.toLowerCase() ?? '')) {
		return AssessmentQuestionType.SelectOne;
	}
	if (['multiselect', 'checklist', 'select all that apply'].includes(q.questionType?.toLowerCase() ?? '')) {
		return AssessmentQuestionType.SelectAllThatApply;
	}
	if (q.questionType?.toLowerCase() === 'text') {
		return AssessmentQuestionType.FreeForm;
	}
	if (q.questionType?.toLowerCase() === 'date') {
		return AssessmentQuestionType.Date;
	}
	if (['number', 'numeric'].includes(q.questionType?.toLowerCase() ?? '')) {
		return AssessmentQuestionType.FreeFormNumber;
	}
	if (q.questionType?.toLowerCase() === 'boolean') {
		return AssessmentQuestionType.SelectOne;
	}
	if (!q.questionType && q.type?.toLowerCase() === 'panel') {
		return AssessmentQuestionType.Panel;
	}
	if (q.questionType?.toLowerCase() === 'longtext') {
		return AssessmentQuestionType.LongText;
	}
	if (q.rowType?.toLowerCase() === 'section') {
		return AssessmentQuestionType.Panel;
	}

	throw new Error(`Unknown question type: ${q.questionType}`);
}
