import { AssessmentQuestionSources, type AllAssessmentQuestions, type QuestionBase } from '../../types';
import { lookupQuestionType } from '../../util/lookupQuestionType';
import oasis from './oasis_e_SOC.json';

const allOasisQuestionsBase = oasis as QuestionBase[];
export const allOasisQuestions: AllAssessmentQuestions = allOasisQuestionsBase.map((q) => {
	const type = lookupQuestionType(q);
	return { ...q, mappedType: type, source: AssessmentQuestionSources.Oasis };
});
