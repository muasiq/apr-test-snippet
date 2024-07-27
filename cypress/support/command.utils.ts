import { faker } from '@faker-js/faker';
import { format } from 'date-fns';
import { WOUND_HEADING } from '../../src/assessments/apricot/util';
export { kebabCase } from 'lodash';

export function generateBirthdate(): string {
	const randomBirthdate = faker.date.birthdate({ min: 18, max: 99, mode: 'age' });
	return format(randomBirthdate, 'MM/dd/yyyy');
}

export function formatDate(date: Date = new Date()): string {
	return format(date, 'MM/dd/yyyy');
}

export const headings = [
	'Patient Information',
	'Vitals and Measures',
	'Health History',
	'Active Diagnoses',
	'Medications',
	'Pain',
	'Skin',
	WOUND_HEADING,
	'Head and Neck',
	'Cardiovascular and Respiratory',
	'Immune System',
	'Endocrine and Hematopoietic Systems',
	'Cognitive, Mental, and Emotional',
	'Nutrition',
	'Elimination',
	'Muscles, Bones, and Joints',
	'Mobility',
	'Activities of Daily Living',
	'Plan of Care',
	'Interventions and Goals',
	'Start of Care Narrative',
	'Physician Orders',
];
