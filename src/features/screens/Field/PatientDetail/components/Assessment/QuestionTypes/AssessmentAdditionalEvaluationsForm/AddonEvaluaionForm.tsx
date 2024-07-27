import { Grid } from '@mui/material';
import { AdditionalEvaluationServiceCodes } from '@prisma/client';
import { Control, useController, useWatch } from 'react-hook-form';
import { useDeepCompareEffect } from 'react-use';
import { FormDatePicker, FormSelect } from '~/features/ui/form-inputs';
import { AssessmentCheckInput } from '~/server/api/routers/assessment/assessment.inputs';

type Props = {
	control: Control<AssessmentCheckInput>;
	data: AdditionalEvaluationServiceCodes[];
	readOnly: boolean;
	isLoading: boolean;
	index: number;
};

export const AddonEvaluationForm = ({ control, data, readOnly, isLoading, index }: Props) => {
	const fieldName = `checkedResponse.choice.addonEvaluations.${index}` as const;
	const fieldControl = useController({ control, name: `${fieldName}.discipline` });
	const serviceCode = useWatch({ control, name: `${fieldName}.serviceCode` });

	useDeepCompareEffect(() => {
		const discipline = data.find((item) => item.code === serviceCode)?.discipline;
		if (discipline && fieldControl.field.value !== discipline) {
			fieldControl.field.onChange(discipline);
		}
	}, [serviceCode, fieldControl, data]);

	return (
		<Grid container spacing={2}>
			<Grid item xs={6}>
				<FormSelect
					data-cy={`addon-evaluation-service-${index}`}
					readOnly={readOnly}
					disabled={isLoading}
					control={control}
					name={`${fieldName}.serviceCode`}
					label="Evaluation Type"
					freeSolo
					options={data.map((item) => ({
						label: `${item.code} - ${item.description}`,
						value: item.code,
					}))}
				/>
			</Grid>

			<Grid item xs={6}>
				<FormDatePicker
					dataCy={`addon-evaluation-date-${index}`}
					label="Date"
					disabled={isLoading}
					readOnly={readOnly}
					name={`${fieldName}.date`}
					control={control}
				/>
			</Grid>
		</Grid>
	);
};
