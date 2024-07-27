import { faker } from '@faker-js/faker';
import { ConfigurationType } from '@prisma/client';
import { MedicationDescriptorType } from '~/common/constants/medication';
import { DispensableDrug, Interactions } from '~/server/api/common/fdb/types';
import { MedicationSchema } from '~/server/api/routers/assessment/assessment.inputs';

export function createMedication(data: Partial<MedicationSchema> = {}) {
	return {
		configurationType: ConfigurationType.HomeCareHomeBase,
		name: faker.lorem.words(),
		doseAmount: faker.number.int({ max: 10 }),
		doseUnit: 'tablet',
		startDate: new Date(),
		status: 'New',
		strength: `${faker.number.int()} mg`,
		agencyAdministered: 'Yes',
		route: faker.helpers.arrayElement([
			'Intramuscular',
			'Intratracheal',
			'Intravenous',
			'Nasogastric tube',
			'Nasal',
			'By mouth',
		]),
		frequency: faker.helpers.arrayElement([
			'Daily',
			'Every other day',
			'Weekly',
			'Every other week',
			'Monthly',
			'2 times daily',
			'3 times daily',
			'4 times daily',
		]),
		additionalDescriptors: [MedicationDescriptorType.AGENCY_ADMINISTERED],
		understanding: ['Purpose'],
		...data,
	} as MedicationSchema;
}

export function createInteraction(data: Partial<Interactions['data'][0]> = {}) {
	return {
		InteractionID: faker.number.int(),
		Severity: '2',
		ScreenDrugs: [
			{ DrugID: '178751', DrugDesc: 'warfarin 10 mg tablet', DrugConceptType: 3, Prospective: false },
			{ DrugID: '216092', DrugDesc: 'aspirin 500 mg tablet', DrugConceptType: 3, Prospective: false },
		],
		SeverityDesc: 'Severe Interaction: Action is required to reduce the risk of severe adverse interaction. ',
		ScreenMessage: faker.lorem.sentence(),
		ClinicalEffects: [],
		ClinicalEffectsNarrative:
			'The concurrent use of anticoagulants and salicylates leads to blockade of two distinct coagulation pathways and may increase the risk for bleeding.',
		...data,
	} as Interactions['data'][0];
}

export function createDispensableDrug(data: Partial<DispensableDrug> = {}) {
	return {
		DispensableGenericID: faker.string.numeric('5'),
		DispensableGenericDesc: faker.lorem.words(),
		DispensableDrugID: faker.string.numeric('5'),
		DispensableDrugDesc: faker.lorem.words(),
		RouteDesc: 'oral',
		DoseFormDesc: 'tablet',
		...data,
	} as DispensableDrug;
}
