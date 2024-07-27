import { Autocomplete, Grid, TextField } from '@mui/material';
import { useState } from 'react';
import { Control, UseFormSetValue, useController, useWatch } from 'react-hook-form';
import { FormDatePicker, FormSelect } from '~/features/ui/form-inputs';
import { AssessmentCheckInput } from '../../../../../../../../server/api/routers/assessment/assessment.inputs';
import { WithCopyWrapper } from '../WithCopyWrapper';
import { onsetOrExacerbationOptions, symptomControlRatingOptions } from './assessmentDiagnosisForm.utils';
import { useFetchIcdCodes } from './useFetchIcdCodes';

export function DiagnosesForm({
	control,
	index,
	canCopy,
	readOnly,
	isLoading,
	setValue,
}: {
	control: Control<AssessmentCheckInput>;
	index: number;
	readOnly?: boolean;
	canCopy?: boolean;
	isLoading?: boolean;
	setValue: UseFormSetValue<AssessmentCheckInput>;
}) {
	const fieldName = `checkedResponse.choice.diagnoses.${index}` as const;
	const [codeSelectOpen, setCodeSelectOpen] = useState(false);
	const [descriptionSelectOpen, setDescriptionSelectOpen] = useState(false);
	const codeInput = useWatch({ control, name: `${fieldName}.diagnosisCode` });
	const nameInput = useWatch({ control, name: `${fieldName}.diagnosisDescription` });

	const optionsQuery = useFetchIcdCodes(codeInput, nameInput, !readOnly && (codeSelectOpen || descriptionSelectOpen));

	const codeControl = useController({ control, name: `${fieldName}.diagnosisCode` });
	const nameControl = useController({ control, name: `${fieldName}.diagnosisDescription` });

	function handleCodeSubmit(_: unknown, code: string) {
		const diagnosis = optionsQuery.data?.find((item) => item.code === code);
		setValue(`${fieldName}.diagnosisCode`, code, { shouldDirty: true });
		setValue(`${fieldName}.diagnosisDescription`, diagnosis?.name ?? '', { shouldDirty: true });
	}
	function handleNameSubmit(_: unknown, name: string) {
		const diagnosis = optionsQuery.data?.find((item) => item.name === name);
		setValue(`${fieldName}.diagnosisCode`, diagnosis?.code ?? '', { shouldDirty: true });
		setValue(`${fieldName}.diagnosisDescription`, name, { shouldDirty: true });
	}

	return (
		<>
			<Grid item xs={12}>
				<WithCopyWrapper canCopy={canCopy} getValue={() => codeInput}>
					<Autocomplete
						freeSolo
						open={codeSelectOpen}
						onOpen={() => setCodeSelectOpen(true)}
						onClose={() => setCodeSelectOpen(false)}
						options={optionsQuery.data?.map((item) => item.code) ?? []}
						inputValue={codeInput}
						onInputChange={handleCodeSubmit}
						loading={optionsQuery.isLoading}
						readOnly={readOnly}
						disabled={isLoading}
						renderInput={(params) => (
							<TextField
								{...params}
								data-cy={'diagnosis-code-' + index}
								label="Diagnosis Code"
								fullWidth
								error={!!codeControl.fieldState.error}
								helperText={codeControl.fieldState.error?.message}
							/>
						)}
					/>
				</WithCopyWrapper>
			</Grid>
			<Grid item xs={12}>
				<WithCopyWrapper canCopy={canCopy} getValue={() => nameInput}>
					<Autocomplete
						freeSolo
						open={descriptionSelectOpen}
						onOpen={() => setDescriptionSelectOpen(true)}
						onClose={() => setDescriptionSelectOpen(false)}
						options={optionsQuery.data?.map((item) => item.name) ?? []}
						inputValue={nameInput}
						loading={optionsQuery.isLoading}
						onInputChange={handleNameSubmit}
						readOnly={readOnly}
						disabled={isLoading}
						renderInput={(params) => (
							<TextField
								{...params}
								data-cy={'diagnosis-description-' + index}
								label="Diagnosis Description"
								fullWidth
								multiline
								rows={2}
								error={!!nameControl.fieldState.error}
								helperText={nameControl.fieldState.error?.message}
							/>
						)}
					/>
				</WithCopyWrapper>
			</Grid>
			<Grid item xs={12} sm={6}>
				<FormSelect
					readOnly={readOnly}
					disabled={isLoading}
					control={control}
					name={`${fieldName}.symptomControlRating`}
					data-cy={'symptom-control-rating-' + index}
					label="Symptom Control Rating"
					options={symptomControlRatingOptions.map((option) => ({ label: option, value: option }))}
				/>
			</Grid>
			<Grid item xs={12} sm={6}>
				<FormSelect
					readOnly={readOnly}
					disabled={isLoading}
					control={control}
					name={`${fieldName}.onsetOrExacerbation`}
					data-cy={'onset-or-exacerbation-' + index}
					label="Onset or Exacerbation"
					options={onsetOrExacerbationOptions.map((option) => ({ label: option, value: option }))}
				/>
			</Grid>
			<Grid item xs={12} sm={6}>
				<FormDatePicker
					readOnly={readOnly}
					disabled={isLoading}
					control={control}
					dataCy={'date-of-onset-or-exacerbation-' + index}
					name={`${fieldName}.dateOfOnsetOrExacerbation`}
					label="Date of Onset or Exacerbation"
				/>
			</Grid>
		</>
	);
}
