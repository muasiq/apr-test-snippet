import { Alert, Box, Grid, Stack, Typography } from '@mui/material';
import { Fragment } from 'react';
import { useFieldArray } from 'react-hook-form';
import { FormSelect, FormSelectChips, FormTextField, FormTimePicker } from '~/features/ui/form-inputs';
import { AdditionalDropdownConfigurationInput } from '~/server/api/routers/organization/organization.inputs';
import { Configuration } from '../../../../../../../assessments/configurations';
import { AssessmentQuestion } from '../../../../../../../assessments/types';
import { SchemaAssessmentAnswer } from '../../../../../../../common/types/AssessmentSuggestionAndChoice';
import { resolveAnswer } from '../../../common/util/resolveAnswer';
import { AddAndRemoveButtons } from '../../AddAndRemoveButtons';
import { useAssessmentQuestion } from '../hooks/useAssessmentQuestion';
import { WithCopyWrapper } from './WithCopyWrapper';
import { QuestionWrapper } from './Wrapper/QuestionWrapper';

type Props = {
	question: AssessmentQuestion;
	patientId: number;
	readOnly: boolean;
	configuration: Configuration;
	additionalDropdownConfigurationInput: AdditionalDropdownConfigurationInput;
	answer?: SchemaAssessmentAnswer;
	print?: boolean;
};

export function AssessmentMedAdminForm({
	question,
	patientId,
	answer,
	readOnly,
	print,
	configuration,
	additionalDropdownConfigurationInput,
}: Props): JSX.Element {
	const resolvedAnswer = resolveAnswer(answer, { choice: { med_administer_records: [] } });

	const assessmentHook = useAssessmentQuestion(question, patientId, resolvedAnswer, answer, false, undefined);

	const { control, handleSubmit, onError, onSubmit, getValues, canCopy, isLoading } = assessmentHook;

	const { fields, append, remove } = useFieldArray({
		control,
		name: 'checkedResponse.choice.med_administer_records',
	});

	const handleAddForm = () => {
		append({
			name: '',
			dose: '',
			route: '',
			time: '',
			frequency: '',
			prnReason: '',
			location: '',
			patientResponse: [],
			comment: '',
		});
	};

	const handleRemoveForm = (index: number) => {
		remove(index);
	};

	return (
		<>
			<QuestionWrapper
				question={question}
				allAnswers={[]}
				configuration={configuration}
				additionalDropdownConfigurationInput={additionalDropdownConfigurationInput}
				loadingGuess={assessmentHook.isLoadingGuess}
				formValue={''}
				patientId={patientId}
				explanation={''}
				id={question.id}
				questionText={question.text}
				onAccept={() => handleSubmit(onSubmit, onError)()}
				loading={assessmentHook.isLoading}
				hasValue={assessmentHook.hasValue}
				hasError={assessmentHook.hasError}
				onRetrySuggestion={() => null}
				hasAcceptedValue={assessmentHook.hasAcceptedValue}
				valueHasBeenEdited={assessmentHook.valueHasBeenEdited}
				readOnly={readOnly}
				print={print}
			>
				{!fields.length && (
					<Stack alignItems={'start'} spacing={2}>
						<Alert
							severity={assessmentHook.hasAcceptedValue ? 'success' : 'warning'}
							icon={false}
							sx={{ width: '100%' }}
						>
							<Typography variant={'body1'}>No medications administered</Typography>
						</Alert>
						<AddAndRemoveButtons
							shouldShowRemove={false}
							addText="Add Medicine Administer record"
							handleAdd={handleAddForm}
							shouldShowAdd={true}
							readOnly={readOnly}
						/>
					</Stack>
				)}
				<Stack>
					{fields.map((field, index) => (
						<Fragment key={field.id}>
							<Grid container spacing={2}>
								<Grid item xs={12}>
									<WithCopyWrapper
										canCopy={canCopy}
										getValue={() =>
											getValues(`checkedResponse.choice.med_administer_records.${index}.name`)
										}
									>
										<FormTextField
											readOnly={readOnly}
											disabled={isLoading}
											control={control}
											name={`checkedResponse.choice.med_administer_records.${index}.name`}
											label="Medication Administered"
											type={'text'}
										></FormTextField>
									</WithCopyWrapper>
								</Grid>

								<Grid item xs={12} sm={6}>
									<WithCopyWrapper
										canCopy={canCopy}
										getValue={() =>
											getValues(`checkedResponse.choice.med_administer_records.${index}.dose`) ??
											''
										}
									>
										<FormTextField
											readOnly={readOnly}
											disabled={isLoading}
											control={control}
											name={`checkedResponse.choice.med_administer_records.${index}.dose`}
											label="Dose"
											type="text"
										/>
									</WithCopyWrapper>
								</Grid>
								<Grid item xs={12} sm={6}>
									<FormSelect
										readOnly={readOnly}
										disabled={isLoading}
										control={control}
										name={`checkedResponse.choice.med_administer_records.${index}.route`}
										label="Route"
										options={medAdminTypes.map((type) => ({
											label: type,
											value: type,
										}))}
									/>
								</Grid>
								<Grid item xs={12} sm={6}>
									<FormTimePicker
										readOnly={readOnly}
										disabled={isLoading}
										control={control}
										name={`checkedResponse.choice.med_administer_records.${index}.time`}
										label="Time Administered"
									/>
								</Grid>

								<Grid item xs={12} sm={6}>
									<WithCopyWrapper
										canCopy={canCopy}
										getValue={() =>
											getValues(
												`checkedResponse.choice.med_administer_records.${index}.frequency`,
											) ?? ''
										}
									>
										<FormTextField
											readOnly={readOnly}
											disabled={isLoading}
											control={control}
											name={`checkedResponse.choice.med_administer_records.${index}.frequency`}
											label="Frequency"
											type="text"
										/>
									</WithCopyWrapper>
								</Grid>
								<Grid item xs={12}>
									<WithCopyWrapper
										canCopy={canCopy}
										getValue={() =>
											getValues(
												`checkedResponse.choice.med_administer_records.${index}.prnReason`,
											) ?? ''
										}
									>
										<FormTextField
											readOnly={readOnly}
											disabled={isLoading}
											control={control}
											name={`checkedResponse.choice.med_administer_records.${index}.prnReason`}
											label="PRN Reason"
											type="text"
										/>
									</WithCopyWrapper>
								</Grid>
								<Grid item xs={12} sm={6}>
									<FormSelect
										readOnly={readOnly}
										disabled={isLoading}
										control={control}
										name={`checkedResponse.choice.med_administer_records.${index}.location`}
										label="Location"
										options={locationTypes.map((type) => ({
											label: type,
											value: type,
										}))}
									></FormSelect>
								</Grid>
								<Grid item xs={12} sm={6}>
									<FormSelectChips
										readOnly={readOnly}
										disabled={isLoading}
										control={control}
										multiple
										name={`checkedResponse.choice.med_administer_records.${index}.patientResponse`}
										label="Patient Response"
										options={patientResponseTypes.map((type) => ({
											label: type,
											value: type,
										}))}
									/>
								</Grid>
								<Grid item xs={12}>
									<WithCopyWrapper
										canCopy={canCopy}
										getValue={() =>
											getValues(
												`checkedResponse.choice.med_administer_records.${index}.comment`,
											) ?? ''
										}
									>
										<FormTextField
											readOnly={readOnly}
											disabled={isLoading}
											control={control}
											name={`checkedResponse.choice.med_administer_records.${index}.comment`}
											label="Comment"
											type={'text'}
										/>
									</WithCopyWrapper>
								</Grid>
							</Grid>
							<Box mt={1} mb={2}>
								<AddAndRemoveButtons
									handleRemove={() => handleRemoveForm(index)}
									handleAdd={handleAddForm}
									shouldShowAdd={index === fields.length - 1}
									readOnly={readOnly}
									addText="Add Medication Administration Record"
								/>
							</Box>
						</Fragment>
					))}
				</Stack>
			</QuestionWrapper>
		</>
	);
}

const medAdminTypes = ['Oral', 'Intramuscular', 'Subcutaneous', 'Intravenous'];

const patientResponseTypes = ['No Bleeding/Bruising', 'No Complaint', 'See Narrative'];

const locationTypes = [
	'Left / Right Deltoid',
	'Left / Right Ventrogluteal',
	'Left / Right Dorsogluteal',
	'Left / Right Vastus Lateralis',
	'Left Arm',
	'Right Arm',
	'Abdomen',
	'Left Thigh',
	'Right Thigh',
	'N/A',
];
