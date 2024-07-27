import { AssessmentAnswer } from '@prisma/client';
import { CheckedResponseUnion } from '../../../assessment/assessment.inputs';

export function generateVaccinationResponse(assessmentAnswer: AssessmentAnswer) {
	const response = (assessmentAnswer.checkedResponse as CheckedResponseUnion).choice;
	if (typeof response === 'object' && 'vaccines' in response) {
		return {
			vaccines: response.vaccines.map((vaccine) => {
				return { ...vaccine, notes: vaccine.notes ?? null };
			}),
		};
	}
	throw new Error('Vaccination response is not an object');
}
