import type { CheckedResponseUnion } from '../../routers/assessment/assessment.inputs';

export const facilitiesSuggestion = async (): Promise<CheckedResponseUnion> => {
	return Promise.resolve({
		choice: {
			facilities: [],
		},
	});
};
