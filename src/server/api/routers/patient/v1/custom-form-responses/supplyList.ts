import { AssessmentAnswer } from '@prisma/client';
import { CheckedResponseUnion } from '../../../assessment/assessment.inputs';

export function generateSupplyListResponse(assessmentAnswer: AssessmentAnswer) {
	const response = (assessmentAnswer.checkedResponse as CheckedResponseUnion).choice;
	if (typeof response === 'object' && 'supplies' in response) {
		return {
			supplies: response.supplies.map((supply) => {
				return {
					...supply,
					deliveryMethod: supply.deliveryMethod ?? null,
					package: supply.package ?? null,
					quantityDelivered: supply.quantityDelivered ?? null,
					quantityToOrder: supply.quantityToOrder ?? null,
				};
			}),
		};
	}
	throw new Error('SupplyList response is not an object');
}
