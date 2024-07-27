import { DispensableDrug } from '~/server/api/common/fdb/types';
import { MedicationSchema } from '~/server/api/routers/assessment/assessment.inputs';
import { CustomDrug, FdbDrugType } from '../constants/medication';

// set of routes extracted from fdb
const routes = [
	'oral',
	'miscellaneous',
	'topical',
	'intravenous',
	'subcutaneous',
	'injection',
	'ophthalmic',
	'intramuscular',
	'inhalation',
	'mucous membrane',
	'intranasal',
	'transdermal',
	'vaginal',
	'rectal',
	'sublingual',
	'intraocular',
	'buccal',
	'perfusion',
	'dental',
	'intravitreal',
	'otic',
	'intrathecal',
	'feeding tube',
	'intraperitoneal',
	'intra-articular',
	'implant',
	'sinus irrigation',
	'irrigation',
	'percutaneous',
	'hemodialysis',
	'intra-cavernosal',
	'epidural',
	'intradermal',
	'scalp',
	'intrauterine',
	'intravesical',
];
const routePattern = new RegExp(routes.join('|'), 'i');

function splitByRegex(str: string, regex: RegExp): string[] {
	const match = str.match(regex);
	if (match?.index !== undefined) {
		return [str.slice(0, match.index), match[0], str.slice(match.index + match[0].length)];
	} else {
		return [str];
	}
}

export function parseMedication(medication: string) {
	let route, strength, form;

	const [name, rest] = medication.split(/(\d.*)/, 2);
	let drugName = name?.trim();

	if (rest) {
		[strength, route, form] = splitByRegex(rest, routePattern).map((part) => part.trim());
	} else {
		[drugName, route, form] = splitByRegex(medication, routePattern).map((part) => part.trim());
	}

	return { drugName, route, strength, form };
}

export function isListedMedication(medication: MedicationSchema): boolean {
	return !!medication.fdb;
}

export function getSavedDispensableDrugFormat(drug: DispensableDrug, availableDoseUnits?: string[]) {
	return {
		type: FdbDrugType.DISPENSABLE_DRUG,
		id: drug.DispensableDrugID,
		name: drug.DispensableDrugDesc,
		...(availableDoseUnits && { availableDoseUnits }),
	};
}

export function getSavedCustomDrugFormat(drug: CustomDrug) {
	return {
		type: FdbDrugType.CUSTOM_DRUG,
		id: drug.id,
		name: drug.name,
		availableDoseUnits: drug.availableDoseUnits,
	};
}
