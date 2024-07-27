import type { AssessmentVitalSignParams, CheckedResponseUnion } from '../../routers/assessment/assessment.inputs';

export const vitalSignParamsSuggestion = async (): Promise<CheckedResponseUnion> => {
	return Promise.resolve({ choice: { vitalSignParameters: {} } } as AssessmentVitalSignParams);
};
