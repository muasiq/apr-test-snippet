import { Grid } from '@mui/material';
import { useEffect } from 'react';
import {
	Controller,
	UseFormSetValue,
	useController,
	useWatch,
	type Control,
	type UseFormGetValues,
} from 'react-hook-form';
import { additionalMedicationDescriptorOptions, hchb, medStatuses } from '~/common/constants/medication';
import { FormDatePicker, FormSelect, FormSelectChips, FormTextField } from '~/features/ui/form-inputs';
import { AssessmentCheckInput } from '~/server/api/routers/assessment/assessment.inputs';
import { useDoseUnits } from '../hooks/useDoseUnits';
import { FdbMedicationAutocomplete, UNLISTED_OPTION } from './FdbMedicationAutocomplete';

type MedicationFormProp = {
	control: Control<AssessmentCheckInput>;
	isLoading: boolean;
	index: number;
	readOnly: boolean;
	getValues: UseFormGetValues<AssessmentCheckInput>;
	setValue: UseFormSetValue<AssessmentCheckInput>;
};

export const MedicationForm = ({ control, isLoading, readOnly, setValue, index, getValues }: MedicationFormProp) => {
	const path = `checkedResponse.choice.medications.${index}` as const;
	const fieldName = {
		name: `${path}.name`,
		fdb: `${path}.fdb`,
		route: `${path}.route`,
		alternativeRoute: `${path}.alternativeRoute`,
		strength: `${path}.strength`,
		startDate: `${path}.startDate`,
		endDate: `${path}.endDate`,
		doseAmount: `${path}.doseAmount`,
		doseUnit: `${path}.doseUnit`,
		frequency: `${path}.frequency`,
		reason: `${path}.reason`,
		status: `${path}.status`,
		understanding: `${path}.understanding`,
		understandingNotes: `${path}.understandingNotes`,
		additionalDescriptors: `${path}.additionalDescriptors`,
		instructions: `${path}.instructions`,
	} as const;

	const name = useWatch({ name: fieldName.name, control });
	const fdb = useWatch({ name: fieldName.fdb, control });
	const nameControl = useController({ name: fieldName.name, control });

	const isListedMedication = !!fdb;
	const isUnlistedMedication = name && !isListedMedication;

	const doseUnitOptions = useDoseUnits({ control, index, setValue, getValues });

	const doseUnit = useWatch({ name: fieldName.doseUnit, control });
	const dosePerInstructions = doseUnit === 'Per instructions';
	useEffect(() => {
		if (dosePerInstructions) {
			setValue(fieldName.doseAmount, undefined);
		}
	}, [dosePerInstructions, fieldName.doseAmount, setValue]);

	const frequency: string | undefined = useWatch({ name: fieldName.frequency, control });
	const isInstructionsRequired = doseUnit === 'Per instructions' || frequency === 'As directed';
	const isReasonRequired = frequency === 'As needed' || frequency?.includes('PRN');

	return (
		<>
			<Grid item xs={12}>
				<Controller
					control={control}
					name={fieldName.fdb}
					render={({ field: { ref } }) => (
						<FdbMedicationAutocomplete
							data-cy={`medication-name-${index}`}
							readOnly={readOnly}
							disabled={isLoading}
							onChange={(value) => {
								const setValueOpts = { shouldValidate: true };
								setValue(fieldName.name, value.name ?? '', {
									shouldValidate: true,
									shouldDirty: true,
								});
								setValue(fieldName.route, value.route ?? '', setValueOpts);
								setValue(fieldName.strength, value.strength, setValueOpts);
								setValue(fieldName.fdb, value.fdb, setValueOpts);
								setValue(fieldName.doseUnit, '');
							}}
							label={`Medication Name/Strength`}
							value={isUnlistedMedication ? UNLISTED_OPTION : fdb}
							error={isUnlistedMedication ? undefined : nameControl.fieldState.error}
							size="small"
							textFieldProps={{
								inputRef: ref,
							}}
						/>
					)}
				/>
			</Grid>
			{isUnlistedMedication && (
				<>
					<Grid item xs={12} sm={6}>
						<FormTextField
							data-cy={`medication-name-${index}`}
							readOnly={readOnly}
							disabled={isLoading}
							control={control}
							name={fieldName.name}
							label="Medication Name"
							type="text"
							size="small"
						></FormTextField>
					</Grid>
					<Grid item xs={12} sm={6}>
						<FormTextField
							data-cy={`medication-strength-${index}`}
							readOnly={readOnly}
							disabled={isLoading}
							control={control}
							name={fieldName.strength}
							label="Medication Strength"
							type="text"
							size="small"
						></FormTextField>
					</Grid>
				</>
			)}
			<Grid item xs={6}>
				<FormDatePicker
					dataCy={`medication-start-date-${index}`}
					readOnly={readOnly}
					disabled={isLoading}
					control={control}
					name={fieldName.startDate}
					label="Start Date"
					size="small"
				/>
			</Grid>
			<Grid item xs={6} sm={6}>
				<FormDatePicker
					dataCy={`medication-end-date-${index}`}
					readOnly={readOnly}
					disabled={isLoading}
					control={control}
					name={fieldName.endDate}
					label="End Date (Optional)"
					size="small"
				/>
			</Grid>
			<Grid item xs={6}>
				<FormTextField
					data-cy={`medication-dose-amount-${index}`}
					readOnly={readOnly}
					disabled={isLoading || dosePerInstructions}
					control={control}
					name={fieldName.doseAmount}
					label="Dose Amount"
					type="number"
					size="small"
				/>
			</Grid>
			<Grid item xs={6}>
				{isListedMedication ? (
					<FormSelect
						data-cy={`medication-dose-unit-${index}`}
						readOnly={readOnly}
						disabled={isLoading}
						control={control}
						name={fieldName.doseUnit}
						label="Dose Units"
						options={doseUnitOptions.map((item) => ({ label: item, value: item }))}
						freeSolo
						size="small"
					/>
				) : (
					<FormTextField
						data-cy={`medication-dose-unit-${index}`}
						readOnly={readOnly}
						disabled={isLoading}
						control={control}
						name={fieldName.doseUnit}
						label="Dose Units"
						type="text"
						size="small"
					/>
				)}
			</Grid>

			<Grid item xs={12} sm={6}>
				<FormSelect
					data-cy={`medication-route-${index}`}
					readOnly={readOnly || isListedMedication}
					disabled={isLoading}
					control={control}
					name={fieldName.route}
					label="Route"
					options={hchb.routes.map((item) => ({ label: item, value: item }))}
					freeSolo
					size="small"
				></FormSelect>
			</Grid>
			<Grid item xs={12} sm={6}>
				<FormSelect
					data-cy={`medication-alt-route-${index}`}
					readOnly={readOnly}
					disabled={isLoading}
					control={control}
					name={fieldName.alternativeRoute}
					label="Alternative Route (Optional)"
					options={hchb.routes.map((item) => ({ label: item, value: item }))}
					freeSolo
					size="small"
				></FormSelect>
			</Grid>

			<Grid item xs={12} sm={6}>
				<FormSelect
					data-cy={`medication-frequency-${index}`}
					readOnly={readOnly}
					disabled={isLoading}
					control={control}
					name={fieldName.frequency}
					label="Frequency"
					options={hchb.frequency.map((item) => ({ label: item, value: item }))}
					freeSolo
					size="small"
				></FormSelect>
			</Grid>
			<Grid item xs={12} sm={6}>
				<FormTextField
					data-cy={`medication-reason-${index}`}
					readOnly={readOnly}
					disabled={isLoading}
					control={control}
					name={fieldName.reason}
					label={'Reason' + (isReasonRequired ? '' : ' (Optional)')}
					type="text"
					size="small"
				/>
			</Grid>

			<Grid item xs={12} sm={6}>
				<FormSelect
					data-cy={`medication-status-${index}`}
					disabled={isLoading}
					readOnly={readOnly}
					control={control}
					options={medStatuses.map((status) => ({ label: status, value: status }))}
					name={fieldName.status}
					label="Status"
					size="small"
				/>
			</Grid>
			<Grid item xs={12} sm={6}>
				<FormSelectChips
					data-cy={`medication-additional-descriptors-${index}`}
					control={control}
					multiple
					label="Additional Medication Descriptors"
					name={fieldName.additionalDescriptors}
					options={additionalMedicationDescriptorOptions.map((opt) => ({ label: opt, value: opt }))}
					size="small"
				/>
			</Grid>

			<Grid item xs={12} sm={6}>
				<FormSelectChips
					data-cy={`medication-understanding-${index}`}
					control={control}
					multiple
					label="Medication Understanding"
					name={fieldName.understanding}
					options={hchb.understandings.map((opt) => ({ label: opt, value: opt }))}
					size="small"
					freeSolo
				/>
			</Grid>
			<Grid item xs={12} sm={6}>
				<FormTextField
					data-cy={`medication-understanding-notes-${index}`}
					readOnly={readOnly}
					disabled={isLoading}
					control={control}
					name={fieldName.understandingNotes}
					label="Medication Understanding Notes (Optional)"
					type="text"
					size="small"
				/>
			</Grid>

			<Grid item xs={12}>
				<FormTextField
					data-cy={`medication-instructions-${index}`}
					readOnly={readOnly}
					disabled={isLoading}
					control={control}
					name={fieldName.instructions}
					label={'Instructions' + (isInstructionsRequired ? '' : ' (Optional)')}
					type="text"
					multiline
					size="small"
				/>
			</Grid>
		</>
	);
};
