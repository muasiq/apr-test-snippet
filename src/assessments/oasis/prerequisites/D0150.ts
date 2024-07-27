import { RouterOutputs } from '../../../common/utils/api';
import { AssessmentFreeForm } from '../../../server/api/routers/assessment/assessment.inputs';
import { Configuration } from '../../configurations';
import { satisifedPreReq } from './util';

export function D0150PrerequisiteCheck(
	answers: RouterOutputs['assessment']['getAllAssessmentQuestionsForPatient'],
	configuration: Configuration,
): boolean {
	const preReq1 = answers.find((a) => a.assessmentNumber === 'D0150A2');
	const preReq2 = answers.find((a) => a.assessmentNumber === 'D0150B2');
	if (!(preReq1 && preReq2)) return false;
	const answer1 = (preReq1?.checkedResponse ?? preReq1?.generatedResponse) as AssessmentFreeForm;
	const answer2 = (preReq2?.checkedResponse ?? preReq2?.generatedResponse) as AssessmentFreeForm;
	if (!(answer1?.choice && answer2?.choice)) return false;

	const preReqSatisfied =
		satisifedPreReq(preReq1.assessmentNumber, configuration, ['2', '3'], answer1.choice.toString()) ||
		satisifedPreReq(preReq2.assessmentNumber, configuration, ['2', '3'], answer2.choice.toString());
	return preReqSatisfied;
}
