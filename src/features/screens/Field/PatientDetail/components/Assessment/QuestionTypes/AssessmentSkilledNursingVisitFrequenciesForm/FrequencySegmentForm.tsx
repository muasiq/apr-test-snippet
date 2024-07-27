import { Grid } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { isEqual as isDateEqual } from 'date-fns';
import { useEffect, useMemo } from 'react';
import { Control, useController, UseFormGetValues, UseFormSetValue, useWatch } from 'react-hook-form';
import {
	daysOfWeekOptions,
	frequencyOptions,
	getDaysFromFrequency,
	getEndDate,
} from '~/assessments/util/visitFrequencyUtil';
import { RouterOutputs } from '~/common/utils/api';
import { FormDatePicker, FormSelect, FormSelectChips, FormTextField } from '~/features/ui/form-inputs';
import type { AssessmentCheckInput } from '~/server/api/routers/assessment/assessment.inputs';

type SkilledNursingServices = RouterOutputs['organization']['getSkilledNursingServiceCodes'][number];

export function FrequencySegmentForm({
	skilledNursingServices,
	control,
	index,
	readOnly,
	isLoading,
	setValue,
	getValues,
	socStartDate,
}: {
	skilledNursingServices: SkilledNursingServices[];
	control: Control<AssessmentCheckInput>;
	readOnly: boolean;
	isLoading: boolean;
	index: number;
	setValue: UseFormSetValue<AssessmentCheckInput>;
	getValues: UseFormGetValues<AssessmentCheckInput>;
	socStartDate: Date | null;
}) {
	const fieldKey = `checkedResponse.choice.skilledNursingVisitFrequencies.${index}` as const;
	const [noOfWeeks, startDate, frequency] = useWatch({
		control,
		name: [`${fieldKey}.numberOfWeeks`, `${fieldKey}.startDate`, `${fieldKey}.frequency`],
	});
	const { fieldState: frequencyFieldState } = useController({ control, name: `${fieldKey}.frequency` });
	const { fieldState: daysOfWeekFieldState } = useController({ control, name: `${fieldKey}.daysOfWeek` });
	const endDate = useMemo(
		() => (startDate && noOfWeeks ? getEndDate(new Date(startDate), noOfWeeks) : null),
		[startDate, noOfWeeks],
	);
	const frequencyDays = useMemo(
		() =>
			frequency && startDate && endDate ? getDaysFromFrequency(frequency, new Date(startDate), endDate) : null,
		[frequency, startDate, endDate],
	);

	useEffect(() => {
		const prevDate = getValues(`${fieldKey}.endDate`);
		if (endDate && !isDateEqual(endDate, new Date(prevDate))) setValue(`${fieldKey}.endDate`, endDate);
	}, [endDate, fieldKey, setValue, getValues]);

	useEffect(() => {
		if (frequencyDays && frequencyFieldState.isDirty && !daysOfWeekFieldState.isDirty) {
			setValue(`${fieldKey}.daysOfWeek`, frequencyDays);
		}
	}, [frequencyDays, fieldKey, setValue, frequencyFieldState.isDirty, daysOfWeekFieldState.isDirty]);

	return (
		<>
			<Grid container spacing={2}>
				<Grid item xs={6}>
					<FormSelectChips
						data-cy={`service-code-${index}`}
						multiple
						readOnly={readOnly}
						disabled={isLoading}
						control={control}
						name={`${fieldKey}.serviceCode`}
						label="Service Code"
						options={skilledNursingServices.map((item) => ({
							value: item.code,
							label: `${item.code} - ${item.description}`,
						}))}
					/>
				</Grid>
				<Grid item xs={6}>
					<FormSelect
						data-cy={`frequency-${index}`}
						readOnly={readOnly}
						disabled={isLoading}
						control={control}
						label="Frequency"
						name={`${fieldKey}.frequency`}
						options={frequencyOptions.map((item) => ({ value: item, label: item }))}
					/>
				</Grid>
				<Grid item xs={6}>
					<FormTextField
						data-cy={`number-of-weeks-${index}`}
						readOnly={readOnly}
						disabled={isLoading}
						control={control}
						type="number"
						inputProps={{ min: 1, max: 9 }}
						label="Number of Weeks"
						name={`${fieldKey}.numberOfWeeks`}
					/>
				</Grid>
				<Grid item xs={6}>
					<FormSelectChips
						multiple
						data-cy={`days-of-week-${index}`}
						readOnly={readOnly}
						disabled={isLoading}
						control={control}
						label="Days of the Week"
						name={`${fieldKey}.daysOfWeek`}
						options={daysOfWeekOptions.map((item) => ({ value: item, label: item }))}
					/>
				</Grid>
				<Grid item xs={6}>
					<FormDatePicker
						dataCy={`start-date-${index}`}
						readOnly={readOnly}
						minDate={(socStartDate ?? new Date()) as unknown as AdapterDateFns}
						disabled={isLoading}
						control={control}
						label="Start Date"
						name={`${fieldKey}.startDate`}
					/>
				</Grid>
				<Grid item xs={6}>
					<FormDatePicker
						dataCy={`end-date-${index}`}
						readOnly
						disabled={isLoading}
						minDate={(socStartDate ?? new Date()) as unknown as AdapterDateFns}
						control={control}
						label="End Date"
						name={`${fieldKey}.endDate`}
					/>
				</Grid>
			</Grid>
		</>
	);
}
