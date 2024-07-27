import { AssessmentAnswer } from '@prisma/client';
import { CheckedResponseUnion } from '../../../assessment/assessment.inputs';

export function generateFacilitiesResponse(assessmentAnswer: AssessmentAnswer) {
	const response = (assessmentAnswer.checkedResponse as CheckedResponseUnion).choice;
	if (typeof response === 'object' && 'facilities' in response) {
		return {
			facilities: response.facilities.map((facility) => {
				return {
					...facility,
					contactName: facility.contactName ?? null,
					address: facility.address ?? null,
					city: facility.city ?? null,
					state: facility.state ?? null,
					fax: facility.fax ?? null,
					phone: facility.phone ?? null,
				};
			}),
		};
	}
	throw new Error('facilities response is not an object');
}
