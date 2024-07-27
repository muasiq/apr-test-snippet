import { MedicationDescriptorType } from '~/common/constants/medication';
import { SchemaAssessmentAnswer } from '~/common/types/AssessmentSuggestionAndChoice';
import { CheckedResponseUnion, MedicationSchema } from '~/server/api/routers/assessment/assessment.inputs';
import { resolveAnswer } from '../../../../common/util/resolveAnswer';

export const defaultValue: CheckedResponseUnion = { choice: { medications: [] } };

export function migrateOldFormatResolve(answer?: SchemaAssessmentAnswer) {
	const resolved = resolveAnswer(answer, defaultValue) as unknown as { choice: { medications: MedicationSchema[] } };
	const medications = resolved.choice.medications;
	if (medications.length) {
		const mappedToNewFormat = resolveOldFormat(medications);
		return { ...resolved, choice: { medications: mappedToNewFormat } } as CheckedResponseUnion;
	}
	return resolved as CheckedResponseUnion;
}

function resolveOldFormat(medications: MedicationSchema[]) {
	return medications.map((medication) => {
		if (medication.additionalDescriptors) {
			return medication;
		}

		// agencyAdministered has been a <boolean> or <'Yes' | 'No'> value
		let isAgencyAdministered = false;
		if (medication.agencyAdministered === 'Yes' || medication.agencyAdministered === 'No') {
			isAgencyAdministered = medication.agencyAdministered === 'Yes';
		} else {
			isAgencyAdministered = !!medication.agencyAdministered;
		}

		const additionalDescriptors = [];
		if (isAgencyAdministered) {
			additionalDescriptors.push(MedicationDescriptorType.AGENCY_ADMINISTERED);
		} else {
			additionalDescriptors.push(MedicationDescriptorType.NONE);
		}

		return { ...medication, additionalDescriptors };
	});
}
