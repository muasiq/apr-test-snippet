import { map, uniq } from 'lodash';
import logger from '~/common/utils/logger';
import { constantUnits, customDosageUnitMapping, medNameUnits, medStrengthUnits } from './constants';
import { getClinicalQuantities, getDispensableDrug, getDrugInteractions, searchDispensableDrugs } from './requests';
import { DispensableDrug, Interactions } from './types';
import { extractDrugName, findClosestMatch } from './utils';

const RESOLVE_RESULT_LIMIT = 200;

export async function resolveDispensableDrug({ name }: { name: string }) {
	if (!name.trim()) {
		return undefined;
	}

	try {
		let data = await searchDispensableDrugs({ search: name, limit: RESOLVE_RESULT_LIMIT });

		// no results, try to extract the drug name
		if (!data.results.length) {
			const drugName = extractDrugName(name);
			if (drugName && drugName !== name) {
				data = await searchDispensableDrugs({ search: drugName, limit: RESOLVE_RESULT_LIMIT });
			}
		}

		// still no results, try the first word of the medication name
		if (!data.results.length) {
			const drugName = name.split(' ')[0]!;
			if (drugName && drugName !== name) {
				data = await searchDispensableDrugs({ search: drugName, limit: RESOLVE_RESULT_LIMIT });
			}
		}

		if (data.results.length) {
			const { match } = findClosestMatch(name, data.results, ['DispensableDrugDesc', 'DispensableGenericDesc'])!;
			return match;
		}

		logger.info('Drug not found in fdb', { name });

		return undefined;
	} catch (error) {
		logger.error('error resolving drug', { error, service: 'fdb-api' });
		return undefined;
	}
}

export async function getInteractions(dispensableDrugIds: string[]): Promise<Interactions['data']> {
	if (dispensableDrugIds.length <= 1) {
		return [];
	}

	const res = await getDrugInteractions(
		dispensableDrugIds.map((id) => ({ DrugID: id, DrugConceptType: 'DispensableDrug' })),
	);
	return res.data;
}

type CustomDose = keyof typeof customDosageUnitMapping;
// mimics the behavior of hchb dose unit dropdown options
export async function getDoseUnitOptions(drug: DispensableDrug): Promise<string[]> {
	const customMappings = (Object.keys(customDosageUnitMapping) as CustomDose[]).filter((dose) =>
		drug.DoseFormDesc.toLowerCase().includes(dose),
	);

	if (customMappings.length) {
		return [...customMappings.flatMap((dose) => customDosageUnitMapping[dose]), ...constantUnits];
	}

	// determine units of measurement based on clinical quantities and medication properties
	const clinicalQuantities = await getClinicalQuantities(drug.DispensableDrugID);
	const units = uniq(map(clinicalQuantities.results, 'SubUnitOfMeasureDesc'));
	const nameUnits = medNameUnits.filter((uom) => drug.DispensableDrugDesc?.includes(uom));
	const strengthUnits = medStrengthUnits.filter((uom) => drug.MedStrengthUnit?.includes(uom));

	return [...[...units, ...nameUnits, ...strengthUnits], ...constantUnits];
}

export { getDispensableDrug, searchDispensableDrugs };
