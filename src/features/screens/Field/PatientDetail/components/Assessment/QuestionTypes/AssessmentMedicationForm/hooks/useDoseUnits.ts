import { useEffect } from 'react';
import { UseFormSetValue, useWatch, type Control, type UseFormGetValues } from 'react-hook-form';
import { FdbDrugType } from '~/common/constants/medication';
import { api } from '~/common/utils/api';
import { AssessmentCheckInput } from '~/server/api/routers/assessment/assessment.inputs';

type Props = {
	control: Control<AssessmentCheckInput>;
	index: number;
	getValues: UseFormGetValues<AssessmentCheckInput>;
	setValue: UseFormSetValue<AssessmentCheckInput>;
};

export function useDoseUnits({ control, index, getValues, setValue }: Props) {
	const path = `checkedResponse.choice.medications.${index}.fdb` as const;
	const fdb = useWatch({ name: path, control });
	const isListedMedication = !!fdb;

	const drugQuery = api.medication.getDispensableDrug.useQuery(
		{ id: fdb?.id ?? '', include: { availableDoseUnits: true } },
		{ enabled: isListedMedication && !fdb.availableDoseUnits && fdb.type === FdbDrugType.DISPENSABLE_DRUG },
	);

	useEffect(() => {
		// persist dose unit options on the medication
		const current = getValues(path);
		if (drugQuery.data?.availableDoseUnits?.length && current) {
			const availableDoseUnits = drugQuery.data.availableDoseUnits;
			setValue(path, { ...current, availableDoseUnits });
		}
	}, [drugQuery.data, path, getValues, setValue]);

	return drugQuery.data?.availableDoseUnits ?? fdb?.availableDoseUnits ?? [];
}
