import { AssessmentAnswer, ConfigurationType } from '@prisma/client';
import { CheckedResponseUnion } from '../../../assessment/assessment.inputs';

export function generateMedicationResponse(assessmentAnswer: AssessmentAnswer) {
	const response = (assessmentAnswer.checkedResponse as CheckedResponseUnion).choice;
	if (typeof response === 'object' && 'medications' in response) {
		return {
			medications: response.medications.map((med) => {
				switch (med.configurationType) {
					case ConfigurationType.HomeCareHomeBase:
					case ConfigurationType.Choice:
						return {
							Listed: med.fdb ? 'True' : 'False',
							MedicationName: med.name,
							MedicationStrength: med.strength ?? null,
							StartDate: med.startDate,
							EndDate: med.endDate ?? null,
							DoseAmount: med.doseAmount ?? null,
							DoseUnit: med.doseUnit,
							Route: med.route,
							AlternateRoute: med.alternativeRoute ?? null,
							Frequency: med.frequency,
							Reason: med.reason ?? null,
							Status: med.status,
							MedicationUnderstanding: med.understanding,
							MedicationUnderstandingNotes: med.understandingNotes ?? null,
							AdditionalMedicationDescriptors: med.additionalDescriptors,
							Instructions: med.instructions ?? null,
							PRN: ['prn', 'as needed'].some((str) => med.frequency?.toLowerCase().includes(str))
								? 'Yes'
								: 'No',
						};
					case ConfigurationType.WellSky:
					default:
						return med;
				}
			}),
		};
	}
	throw new Error('Medication response is not an object');
}
