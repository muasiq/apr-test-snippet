import { Alert, Box, Grid, Stack, Typography } from '@mui/material';
import { Fragment } from 'react';
import { useFieldArray } from 'react-hook-form';
import { FormAutocomplete, FormDatePicker, FormTextField } from '~/features/ui/form-inputs';
import { If } from '~/features/ui/util/If';
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

const emptyVaccination = {
	vaccineName: '',
	vaccineType: '',
	administeredBy: '',
	administeredByName: '',
	administerDate: '',
	notes: '',
};

export function AssessmentVaccinationForm({
	question,
	patientId,
	answer,
	configuration,
	additionalDropdownConfigurationInput,
	readOnly,
	print,
}: Props): JSX.Element {
	const resolvedAnswer = resolveAnswer(answer as unknown as SchemaAssessmentAnswer, { choice: { vaccines: [] } });

	const assessmentHook = useAssessmentQuestion(question, patientId, resolvedAnswer, answer, false, undefined);
	const { control, handleSubmit, onError, onSubmit, getValues, canCopy, isLoading } = assessmentHook;

	const { fields, append, remove } = useFieldArray({
		control,
		name: 'checkedResponse.choice.vaccines',
	});

	const handleAddForm = () => {
		append(emptyVaccination);
	};

	const handleRemoveForm = (index: number) => {
		remove(index);
	};

	return (
		<>
			<QuestionWrapper
				configuration={configuration}
				additionalDropdownConfigurationInput={additionalDropdownConfigurationInput}
				question={question}
				allAnswers={[]}
				loadingGuess={assessmentHook.isLoadingGuess}
				formValue={''}
				patientId={patientId}
				explanation={''}
				id={question.id}
				questionText={question.text}
				onAccept={handleSubmit(onSubmit, onError)}
				loading={isLoading}
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
							<Typography variant={'body1'}>No vaccinations added</Typography>
						</Alert>

						<AddAndRemoveButtons
							shouldShowRemove={false}
							addText="Add Vaccine"
							handleAdd={handleAddForm}
							shouldShowAdd={true}
							readOnly={readOnly}
						/>
					</Stack>
				)}
				<If condition={!assessmentHook.hasAcceptedValue && assessmentHook.hasError}>
					<Stack alignItems={'start'} spacing={2}>
						<Alert severity={'error'} icon={false} sx={{ width: '100%' }}>
							<Typography variant={'body1'}>
								Vaccination records found, but were not successfully extracted. Please review patient
								records and manually enter vaccinations.
							</Typography>
						</Alert>
					</Stack>
				</If>
				<Stack>
					{fields.map((field, index) => (
						<Fragment key={field.id}>
							<Grid container spacing={2}>
								<Grid item xs={12}>
									<FormAutocomplete
										data-cy={`vaccine-type-${index}`}
										readOnly={readOnly}
										disabled={isLoading}
										control={control}
										name={`checkedResponse.choice.vaccines.${index}.vaccineType`}
										label="Vaccine Type"
										options={vaccineTypeOptions.map((option) => ({
											id: option.id,
											label: option.id,
										}))}
									/>
								</Grid>

								<Grid item xs={6}>
									<WithCopyWrapper
										canCopy={canCopy}
										getValue={() =>
											getValues(`checkedResponse.choice.vaccines.${index}.administeredBy`) ?? ''
										}
									>
										<FormAutocomplete
											data-cy={`vaccine-administered-by-${index}`}
											readOnly={readOnly}
											disabled={isLoading}
											control={control}
											name={`checkedResponse.choice.vaccines.${index}.administeredBy`}
											label="Administered By"
											options={administeredByOptions}
										/>
									</WithCopyWrapper>
								</Grid>

								<Grid item xs={6}>
									<FormDatePicker
										readOnly={readOnly}
										disabled={isLoading}
										control={control}
										dataCy={`vaccine-administer-date-${index}`}
										name={`checkedResponse.choice.vaccines.${index}.administerDate`}
										label="Administer Date"
									/>
								</Grid>
								<Grid item xs={12}>
									<WithCopyWrapper
										canCopy={canCopy}
										getValue={() =>
											getValues(`checkedResponse.choice.vaccines.${index}.notes`) ?? ''
										}
									>
										<FormTextField
											readOnly={readOnly}
											disabled={isLoading}
											control={control}
											data-cy={`vaccine-notes-${index}`}
											name={`checkedResponse.choice.vaccines.${index}.notes`}
											label="Comments (Optional)"
											multiline={true}
											type={'text'}
										></FormTextField>
									</WithCopyWrapper>
								</Grid>
							</Grid>
							<Box mt={1} mb={2}>
								<AddAndRemoveButtons
									handleRemove={() => handleRemoveForm(index)}
									handleAdd={handleAddForm}
									readOnly={readOnly}
									shouldShowAdd={index === fields.length - 1}
									addText="Add Vaccine"
								/>
							</Box>
						</Fragment>
					))}
				</Stack>
			</QuestionWrapper>
		</>
	);
}

export const vaccineTypeOptions = [
	{ id: 'COVID-19 DOSE #1 - MRNA-MULTIDOSE #1' },
	{ id: 'COVID-19 DOSE #2 - MRNA-MULTIDOSE #2' },
	{ id: 'COVID-19 SINGLE DOSE - RNA-SINGLE DOSE' },
	{ id: 'INFLUENZA - LAIV (LIVE VIRUS)' },
	{ id: 'INFLUENZA - TIV (INACTIVATED)' },
	{ id: 'PNEUMOCOCCAL (PPV) - PPV' },
	{ id: 'SHINGLES - TIV (INACTIVATED)' },
	{ id: 'Other' },
];

export const defaultForReferralAdministeredBy = {
	id: 'OTHER HEALTH CARE PROVIDER',
	label: 'OTHER HEALTH CARE PROVIDER',
};

const administeredByOptions = [
	{ id: "CLIENT'S PHYSICIAN", label: "CLIENT'S PHYSICIAN" },
	{ id: 'HEALTH CARE CLINIC', label: 'HEALTH CARE CLINIC' },
	{ id: 'HEALTH FAIR', label: 'HEALTH FAIR' },
	{ id: 'PHARMACY', label: 'PHARMACY' },
	{ id: 'THIS AGENCY', label: 'THIS AGENCY' },
	defaultForReferralAdministeredBy,
];
