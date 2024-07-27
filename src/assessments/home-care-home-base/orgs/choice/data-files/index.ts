import { mapAideCarePlanQuestion } from '~/assessments/home-care-home-base/data-files/map-question-util';
import { customQuestions } from '../../../../apricot/custom';
import { allApricotCoreQuestions } from '../../../../apricot/data-files';
import { allOasisQuestions } from '../../../../oasis/data-files';
import { AllAssessmentQuestions, AssessmentQuestionSources, QuestionBase } from '../../../../types';
import { lookupQuestionType } from '../../../../util/lookupQuestionType';
import { mergeOasisFollowups } from '../../../data-files/scripts/mergeOasisFollups';
import acp from './aide-care-plan.json';
import oasisFollowups from './oasis-followups.json';
import physicalAssessment from './physical-assessment.json';
import standard from './soc-standard-assessment.json';

export const allPhysicalAssessmentQuestions: AllAssessmentQuestions = (
	physicalAssessment.map((pa) => {
		const { id, cleanedText, questionType, responses, originalText } = pa;
		const parsed = responses?.map((r) => ({ text: r.cleanedText, originalText: r.text, followup: r.followup }));
		return {
			id,
			text: cleanedText,
			questionType,
			originalText,
			responses: parsed,
		};
	}) as QuestionBase[]
).map((q) => {
	return { ...q, mappedType: lookupQuestionType(q), source: AssessmentQuestionSources.PhysicalAssessment };
});

const allStandardQuestions: AllAssessmentQuestions = standard.map((q) => {
	return { ...q, mappedType: lookupQuestionType(q), source: AssessmentQuestionSources.SOCStandardAssessment };
});

const coreWithHCHBRresponses = allApricotCoreQuestions.map((q) => {
	return {
		...q,
		responses: q.hchb?.responses?.length ? q.hchb.responses : q.responses,
	};
});

const allAideCarePlanQuestions: AllAssessmentQuestions = (acp as QuestionBase[]).map(mapAideCarePlanQuestion);

const allOasisWithPotentialFollupsMerged = mergeOasisFollowups(allOasisQuestions, oasisFollowups);

export const allQuestions = [
	...coreWithHCHBRresponses,
	...allOasisWithPotentialFollupsMerged,
	...allPhysicalAssessmentQuestions,
	...allStandardQuestions,
	...customQuestions,
	...allAideCarePlanQuestions,
];
