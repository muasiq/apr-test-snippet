import { AssessmentQuestionSources, QuestionBase } from '../../types';
import { lookupQuestionType } from '../../util/lookupQuestionType';
import Narrative from './Narrative.json';
import SOCVisit from './SOCVisit.json';
import StandardAssessmentTools from './StandardAssessmentTools.json';
import VitalSigns from './VitalSigns.json';

const allApricotCoreRawFiles = [StandardAssessmentTools, VitalSigns, Narrative, SOCVisit];

export const allApricotCoreQuestions = allApricotCoreRawFiles.flatMap((file) => {
	return (file as QuestionBase[]).map((q) => {
		return { ...q, mappedType: lookupQuestionType(q), source: AssessmentQuestionSources.ApricotCore };
	});
});
