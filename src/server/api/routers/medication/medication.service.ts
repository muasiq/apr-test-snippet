import * as fdb from '../../common/fdb';
import { DispensableDrug } from '../../common/fdb/types';
import { GetDispensableDrug, SearchMedication } from './medication.inputs';

export async function search({ term, limit, offset }: SearchMedication) {
	return fdb.searchDispensableDrugs({ search: term, searchType: 'Exhaustive', limit, offset });
}

export async function getDispensableDrug({
	id,
	include,
}: GetDispensableDrug): Promise<DispensableDrug & { availableDoseUnits?: string[] }> {
	const drug = await fdb.getDispensableDrug(id);

	if (include?.availableDoseUnits) {
		const availableDoseUnits = await fdb.getDoseUnitOptions(drug);
		return { ...drug, availableDoseUnits };
	}

	return drug;
}
