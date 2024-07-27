import { AssessmentAnswer } from '@prisma/client';
import { CheckedResponseUnion } from '../../../assessment/assessment.inputs';

export function generateAdvanceDirectivesResponse(assessmentAnswer: AssessmentAnswer) {
	const response = (assessmentAnswer.checkedResponse as CheckedResponseUnion).choice;
	if (typeof response === 'object' && 'advanceDirectives' in response) {
		return {
			advanceDirectives: response.advanceDirectives.map((directive) => {
				return {
					...directive,
					contactName: directive.contactName ?? null,
					contactPhone: directive.contactPhone ?? null,
				};
			}),
		};
	}
	throw new Error('AdvanceDirectives response is not an object');
}
