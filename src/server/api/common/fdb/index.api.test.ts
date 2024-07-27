// used to manual validate results against the api
// note: this will hit the fdb api

import { expect, it } from '@jest/globals';
import { resolveDispensableDrug } from '.';

const snapshot = {
	'Amoxicillin/Clavulanate 875 mg/125 mg': 'amoxicillin 875 mg-potassium clavulanate 125 mg tablet',
	'Amlodipine 10 mg': 'amlodipine 10 mg tablet',
	'Acetaminophen 325 mg': 'acetaminophen 325 mg tablet',
	'amitriptyline 50 mg': 'amitriptyline 50 mg tablet',
	'Aspirin 81 mg': 'Vazalore 81 mg capsule',
	'Aspirin 325 mg EC': 'aspirin 325 mg tablet,delayed release',
	'atorvastatin 80 mg': 'atorvastatin 80 mg tablet',
	'Buspirone 15 mg': 'buspirone 15 mg tablet',
	'Calcium Carbonate 600 mg': 'calcium 600 mg (as calcium carbonate 1,500 mg) tablet',
	'Clonazepam 1 mg': 'clonazepam 1 mg tablet',
	'Clonidine 0.1 mg': 'clonidine HCl 0.1 mg tablet',
	'Clopidogrel 75 mg': 'clopidogrel 75 mg tablet',
	'Cyproheptadine 4 mg': 'cyproheptadine 4 mg tablet',
	'Cymbalta 60 mg': 'Cymbalta 60 mg capsule,delayed release',
	'Epinephrine 0.3mg/0.3mL': 'Symjepi 0.3 mg/0.3 mL injection syringe',
	'Flonase 50 mcg/spray': 'Flonase Allergy Relief 50 mcg/actuation nasal spray,suspension',
	'Hydrochlorothiazide 12.5 mg': 'hydrochlorothiazide 12.5 mg tablet',
	'Doxycycline 100 mg': 'doxycycline hyclate 100 mg tablet',
	'Gabapentin 100 mg': 'gabapentin 100 mg capsule',
	'Hydrocortisone 20 mg': 'hydrocortisone 20 mg tablet',
	'Insulin lispro 1000/mL': 'Admelog U-100 Insulin lispro 100 unit/mL subcutaneous solution',
	'Isosorbide 5 mg': 'isosorbide dinitrate 5 mg tablet',
	'Lisinopril 50 mg': 'lisinopril 5 mg tablet',
	'Hydroxyzine 10 mg': 'hydroxyzine HCl 10 mg tablet',
	'Levothyroxine 88 mcg': 'levothyroxine 88 mcg tablet',
	'Metformin 500 mg': 'metformin 500 mg tablet',
	'naproxen 500 mg': 'naproxen 500 mg tablet',
	'nitroglycerin 0.4 mg': 'nitroglycerin 0.4 mg sublingual tablet',
	'Oxycodone 5 mg': 'oxycodone 5 mg tablet',
	'Pantoprazole 40 mg': 'pantoprazole 40 mg intravenous solution',
	'Pregabalin 25 mg': 'pregabalin 25 mg capsule',
	'Promethazine 6.25 mg/5mL': 'promethazine 6.25 mg/5 mL oral syrup',
	'Senna-S 8.6-50 mg': 'Senna-S 8.6 mg-50 mg tablet',
	'Topiramate 100 mg': 'topiramate 100 mg tablet',
	'Trazodone 100 mg': 'trazodone 100 mg tablet',
	'Xanax 0.25 mg': 'Xanax 0.25 mg tablet',
	'Zoloft 100 mg': 'Zoloft 100 mg tablet',
	'Protonix® (pantoprazole sodium) 40 mg Delayed Release Tablet': 'pantoprazole 40 mg tablet,delayed release',
	Oxygen: undefined,
};

async function resolveDispensableDrugs(drugs: string[]) {
	const results: [string, { DispensableDrugDesc: string } | undefined][] = [];
	for (const drug of drugs) {
		const resolved = await resolveDispensableDrug({ name: drug });
		results.push([drug, resolved]);
	}
	return results;
}

describe('resolveDispensableDrug', () => {
	it('should validate drug inputs against snapshot', async () => {
		const resolved = await resolveDispensableDrugs(Object.keys(snapshot));
		const map = resolved.reduce((o, [drug, res]) => ({ ...o, [drug]: res?.DispensableDrugDesc }), {});
		console.log(map);
		expect(map).toEqual(snapshot);
	}, 50000);
});
