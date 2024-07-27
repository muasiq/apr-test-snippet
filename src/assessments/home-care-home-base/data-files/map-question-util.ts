import { AllAssessmentQuestions, AssessmentQuestionSources, QuestionBase } from '~/assessments/types';
import { lookupQuestionType } from '~/assessments/util/lookupQuestionType';

export function mapAideCarePlanQuestion(q: QuestionBase): AllAssessmentQuestions[0] {
	const parsed = q.responses?.map((r) => ({ text: r.text, originalText: r.originalText, followup: r.followup }));
	return {
		...q,
		responses: parsed,
		mappedType: lookupQuestionType(q),
		source: AssessmentQuestionSources.SOCStandardAssessment,
	};
}
