import { AssessmentAnswer } from '@prisma/client';
import { CheckedResponseUnion } from '../../../assessment/assessment.inputs';

export function generateMedAdminResponse(assessmentAnswer: AssessmentAnswer) {
	const response = (assessmentAnswer.checkedResponse as CheckedResponseUnion).choice;
	if (typeof response === 'object' && 'med_administer_records' in response) {
		return {
			med_administer_records: response.med_administer_records.map((record) => {
				return {
					...record,
					comment: record.comment ?? null,
					dose: record.dose ?? null,
					frequency: record.frequency ?? null,
					location: record.location ?? null,
					patientResponse: record.patientResponse ?? null,
					prnReason: record.prnReason ?? null,
					route: record.route ?? null,
					time: record.time ?? null,
				};
			}),
		};
	}
	throw new Error('MedAdmin response is not an object');
}
