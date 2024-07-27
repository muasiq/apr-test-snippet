import { AssessmentAnswer } from '@prisma/client';
import { resolveDateFromJson } from '~/assessments/util/visitFrequencyUtil';
import { CheckedResponseUnion } from '../../../assessment/assessment.inputs';

export function generateAddonEvaluationsResponse(assessmentAnswer: AssessmentAnswer) {
	const response = (assessmentAnswer.checkedResponse as CheckedResponseUnion).choice;
	if (typeof response === 'object' && 'addonEvaluations' in response) {
		return {
			addonEvaluations: {
				dates: response.addonEvaluations.map((item) => ({
					Date: resolveDateFromJson(item.date).toISOString(),
					Services: [
						{
							Code: item.serviceCode,
							Discipline: item.discipline ?? null,
						},
					],
				})),
				RN02Date: null,
			},
		};
	}
	throw new Error('AddonEvaluations response is not an object');
}
