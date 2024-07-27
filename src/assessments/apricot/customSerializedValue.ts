import { z } from 'zod';
import { formatDate, formatDateTime } from '~/common/utils/dateFormat';
import { vitalSignParamFieldGroups } from '~/features/screens/Office/Admin/OrgProfile/EMRConfiguration/VitalSignConfig/vitalSignConfig.utils';
import { AssessmentQuestion } from '../types';
import { CustomAssessmentNumber, customAssessmentSchema } from './custom';
import { SerializedNode } from './visit-note/serializeConfig';

type CustomAssessmentSchemaType = { [K in CustomAssessmentNumber]: z.infer<(typeof customAssessmentSchema)[K]> };

type CustomAssessmentGetValue = {
	[K in CustomAssessmentNumber]: (params: {
		answer?: CustomAssessmentSchemaType[K];
		question: AssessmentQuestion;
	}) => SerializedNode;
};

export const customAssessmentValue: CustomAssessmentGetValue = {
	[CustomAssessmentNumber.VACCINATIONS]: ({ answer }) => {
		if (!answer) return;
		if (!answer.choice.vaccines.length) {
			return { children: [{ value: 'No vaccinations added' }] };
		}
		return {
			children: answer.choice.vaccines.map((v, i) => ({
				label: `Vaccination ${i}`,
				children: [
					{ id: 'vaccineType', label: 'Vaccine Type', value: v.vaccineType },
					{ id: 'administeredBy', label: 'Administered By', value: v.administeredBy },
					{ id: 'administerDate', label: 'AdministerDate', value: formatDate(v.administerDate) },
					{ id: 'notes', label: 'Notes', value: v.notes },
				],
			})),
		};
	},
	[CustomAssessmentNumber.MED_ADMIN]: ({ answer }) => {
		if (!answer) return;
		if (!answer.choice.med_administer_records.length) {
			return { label: 'Medication Administration', children: [{ value: 'No medications administered' }] };
		}
		return {
			label: 'Medication Administration',
			children: answer.choice.med_administer_records.map((d, i) => ({
				label: `Medication ${i}`,
				children: [
					{ label: 'Name', value: d.name },
					{ label: 'Time', value: formatDate(d.time) },
					{ label: 'Dose', value: d.dose },
					{ label: 'Route', value: d.route },
					{ label: 'Frequency', value: d.frequency },
					{ label: 'PRN Reason', value: d.prnReason },
					{ label: 'Location', value: d.location },
					{ label: 'Patient Response', value: joinArray(d.patientResponse) },
					{ label: 'Comment', value: d.comment },
				],
			})),
		};
	},
	[CustomAssessmentNumber.DIAGNOSES]: ({ answer }) => {
		if (!answer) return;
		if (!answer.choice.diagnoses.length) {
			return { children: [{ value: 'No diagnoses added' }] };
		}
		return {
			children: answer.choice.diagnoses.map((d, i) => ({
				label: `Diagnosis ${i + 1}`,
				children: [
					{ label: 'Diagnosis code', value: d.diagnosisCode },
					{ label: 'Diagnosis description', value: d.diagnosisDescription },
					{ label: 'Symptom control rating', value: d.symptomControlRating },
					{ label: 'Onset or exacerbation', value: d.onsetOrExacerbation },
					{ label: 'Date of onset or exacerbation', value: formatDate(d.dateOfOnsetOrExacerbation) },
				],
			})),
		};
	},
	[CustomAssessmentNumber.PLAN_BUILDER]: ({ answer }) => {
		if (!answer) return;
		if (!answer.choice.areas.length) {
			return { label: 'Care Plan Builder', children: [{ value: 'No problems added' }] };
		}
		return {
			label: 'Care Plan Builder',
			children: answer.choice.areas.map((d) => ({
				label: d.category,
				children: d.problems.map((p) => ({
					label: p.name,
					children: [
						{ label: 'Goal details', value: p.goalDetails },
						{ label: 'Intervention details', value: p.interventionDetails },
					],
				})),
			})),
		};
	},
	[CustomAssessmentNumber.MEDICATIONS]: ({ answer }) => {
		if (!answer) return;
		if (!answer.choice.medications.length) {
			return { label: 'Medications', children: [{ value: 'No medications added' }] };
		}

		const medications = {
			label: 'Medications',
			children: answer.choice.medications.map((d) => ({
				label: d.name,
				children: [
					{ label: 'Dose amount', value: d.doseAmount },
					{ label: 'Dose unit', value: d.doseUnit },
					{ label: 'Start date', value: formatDate(d.startDate) },
					{ label: 'End date', value: formatDate(d.endDate) },
					{ label: 'Status', value: d.status },
					{ label: 'Agency administered', value: d.agencyAdministered },
					{ label: 'Additional descriptors', value: joinArray(d.additionalDescriptors) },
					{ label: 'Instructions', value: d.instructions },
					{ label: 'Route', value: d.route },
					{ label: 'Alternative route', value: d.alternativeRoute },
					{ label: 'Frequency', value: d.frequency },
					{ label: 'Reason', value: d.reason },
					{ label: 'Notes', value: d.notes },
					{ label: 'Classification', value: d.classification },
					{ label: 'Strength', value: d.strength },
					{ label: 'Understanding', value: joinArray(d.understanding) },
					{ label: 'Understanding notes', value: d.understandingNotes },
				].map((d) => ({ ...d, style: 'singleLine' })),
			})),
		};

		if (!answer.interactions?.verified) {
			return medications;
		}

		const { verifiedBy, verifiedAt } = answer.interactions;
		return {
			children: [
				medications,
				{
					type: 'signature',
					name: verifiedBy,
					label: `${verifiedBy} acknowledged reviewing the medication(s) for any potential adverse effects and drug
				reactions, including ineffective drug therapy, significant side effects, significant drug interactions,
				duplicate drug therapy, and non-compliance with drug therapy on ${formatDateTime(verifiedAt)}.`,
				},
			],
		};
	},
	[CustomAssessmentNumber.PROCEDURES]: ({ answer }) => {
		if (!answer) return;
		if (!answer.choice.procedures.length) {
			return { children: [{ value: 'No procedures added' }] };
		}
		return {
			children: answer.choice.procedures.map((d) => ({
				label: d.procedureCode,
				children: [
					{ label: 'Procedure description', value: d.procedureDescription },
					{ label: 'Onset or exacerbation', value: d.onsetOrExacerbation },
					{ label: 'Date of onset or exacerbation', value: formatDate(d.dateOfOnsetOrExacerbation) },
				],
			})),
		};
	},
	[CustomAssessmentNumber.SUPPLY_LIST]: ({ answer }) => {
		if (!answer) return;
		if (!answer.choice.supplies.length) {
			return { label: 'Supplies', children: [{ value: 'No supplies added' }] };
		}
		return {
			label: 'Supplies',
			children: answer.choice.supplies.map((d) => ({
				label: d.category,
				children: [
					{ label: 'Order needed', value: d.orderNeeded },
					{ label: 'Package', value: d.package },
					{ label: 'Delivery method', value: d.deliveryMethod },
					{ label: 'Quantity to order', value: d.quantityToOrder },
					{ label: 'Quantity delivered', value: d.quantityDelivered },
				],
			})),
		};
	},
	[CustomAssessmentNumber.ADVANCE_DIRECTIVES]: ({ answer }) => {
		if (!answer) return;
		if (!answer.choice.advanceDirectives.length) {
			return { children: [{ value: 'No directives added' }] };
		}
		return {
			children: answer.choice.advanceDirectives.map((d, i) => ({
				label: `Directive ${i}`,
				children: [
					{ label: 'Type', value: d.type },
					{ label: 'Location', value: d.location },
					{ label: 'Contents', value: d.contents },
					{ label: 'Contact name', value: d.contactName },
					{ label: 'Contact phone', value: d.contactPhone },
					{ label: 'Information left with caregiver', value: d.informationLeftWithCaregiver },
				],
			})),
		};
	},
	[CustomAssessmentNumber.SKILLED_NURSING_VISIT_FREQUENCIES]: ({ answer }) => {
		if (!answer) return;
		if (!answer.choice.skilledNursingVisitFrequencies.length) {
			return { label: 'Skilled Nursing Visit Frequencies', children: [{ value: 'No visit frequencies added' }] };
		}
		return {
			label: 'Skilled Nursing Visit Frequencies',
			children: answer.choice.skilledNursingVisitFrequencies.map((d, i) => ({
				label: `Visit Frequency ${i}`,
				children: [
					{ label: 'Service code', value: joinArray(d.serviceCode) },
					{ label: 'Frequency', value: d.frequency },
					{ label: 'Number of weeks', value: d.numberOfWeeks },
					{ label: 'Start date', value: formatDate(d.startDate) },
					{ label: 'End date', value: formatDate(d.endDate) },
				],
			})),
		};
	},
	[CustomAssessmentNumber.HOME_HEALTH_AIDE_VISIT_FREQUENCIES]: ({ answer }) => {
		if (!answer) return;
		if (!answer.choice.homeHealthAideVisitFrequencies.length) {
			return { label: 'Home Health Aide Visit Frequencies', children: [{ value: 'No visit frequencies added' }] };
		}
		return {
			label: 'Home Health Aide Visit Frequencies',
			children: answer.choice.homeHealthAideVisitFrequencies.map((d, i) => ({
				label: `Visit Frequency ${i}`,
				children: [
					{ label: 'Frequency', value: d.frequency },
					{ label: 'Number of weeks', value: d.numberOfWeeks },
					{ label: 'Start date', value: formatDate(d.startDate) },
					{ label: 'End date', value: formatDate(d.endDate) },
				],
			})),
		};
	},
	[CustomAssessmentNumber.ADDITIONAL_EVALUATION]: ({ answer }) => {
		if (!answer) return;
		if (!answer.choice.addonEvaluations.length) {
			return { label: 'Add-On Evaluations', children: [{ value: 'No Add-on Evaluation added' }] };
		}
		return {
			label: 'Add-On Evaluations',
			children: answer.choice.addonEvaluations.map((d, i) => ({
				label: `Evaluation ${i}`,
				children: [
					{ label: 'Service code', value: d.serviceCode },
					{ label: 'Discipline', value: d.discipline },
					{ label: 'Date', value: formatDate(d.date) },
				],
			})),
		};
	},
	[CustomAssessmentNumber.FACILITIES]: ({ answer }) => {
		if (!answer) return;
		if (!answer.choice.facilities.length) {
			return { label: 'Related Facilities', children: [{ value: 'No related facilities added' }] };
		}
		return {
			label: 'Related Facilities',
			children: answer.choice.facilities.map((d) => ({
				label: d.name,
				children: [
					{ label: 'Type', value: d.type },
					{ label: 'Address', value: d.address },
					{ label: 'City', value: d.city },
					{ label: 'State', value: d.state },
					{ label: 'Contact name', value: d.contactName },
					{ label: 'Phone', value: d.phone },
					{ label: 'Fax', value: d.fax },
				],
			})),
		};
	},
	[CustomAssessmentNumber.VITAL_SIGN_PARAMETERS]: ({ answer }) => {
		if (!answer) return;
		const parameters = answer.choice.vitalSignParameters;
		if (!Object.keys(parameters).length) return;

		return {
			children: [
				{ label: 'Parameter Profile', value: parameters.profile },
				{
					label: 'Parameters',
					children: vitalSignParamFieldGroups.map((group) => ({
						label: group.group,
						children: group.fields.map((field) => ({
							label: field.label,
							value: parameters[field.name],
							style: 'singleLine',
						})),
					})),
				},
			],
		};
	},
};

function joinArray(arr?: string[]) {
	return arr && Array.isArray(arr) ? arr.join(', ') : arr;
}
