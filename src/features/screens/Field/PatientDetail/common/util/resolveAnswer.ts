import { isArray } from 'lodash';
import { SchemaAssessmentAnswer } from '../../../../../../common/types/AssessmentSuggestionAndChoice';
import { CheckedResponseUnion } from '../../../../../../server/api/routers/assessment/assessment.inputs';

export const resolveAnswer = (
	answer?: SchemaAssessmentAnswer,
	backup: CheckedResponseUnion = { choice: '' },
	forceToArray = false,
): CheckedResponseUnion => {
	const response = answer?.checkedResponse;
	if (!response) {
		if (!answer?.generatedResponse) {
			return backup;
		} else {
			if (forceToArray) {
				if (!isArray(answer.generatedResponse.choice)) {
					answer.generatedResponse.choice = [answer.generatedResponse.choice] as string[];
				}
			}
			return answer.generatedResponse as CheckedResponseUnion;
		}
	} else {
		return answer.checkedResponse as CheckedResponseUnion;
	}
};
