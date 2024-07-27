import { Box, Grid } from '@mui/material';
import { Fragment } from 'react';
import { useFieldArray } from 'react-hook-form';
import { Configuration } from '~/assessments/configurations';
import { AssessmentQuestion } from '~/assessments/types';
import { SchemaAssessmentAnswer } from '~/common/types/AssessmentSuggestionAndChoice';
import { FormDatePicker, FormSelectChips, FormTextField } from '~/features/ui/form-inputs';
import { If } from '~/features/ui/util/If';
import { AdditionalDropdownConfigurationInput } from '~/server/api/routers/organization/organization.inputs';
import { resolveAnswer } from '../../../../common/util/resolveAnswer';
import { AddAndRemoveButtons } from '../../../AddAndRemoveButtons';
import { useAssessmentQuestion } from '../../hooks/useAssessmentQuestion';
import { onsetOrExacerbationOptions } from '../AssessmentDiagnosisForm/assessmentDiagnosisForm.utils';
import { WithCopyWrapper } from '../WithCopyWrapper';
import { QuestionWrapper } from '../Wrapper/QuestionWrapper';

type Props = {
	question: AssessmentQuestion;
	patientId: number;
	configuration: Configuration;
	additionalDropdownConfigurationInput: AdditionalDropdownConfigurationInput;
	readOnly: boolean;
	answer?: SchemaAssessmentAnswer;
	print?: boolean;
};

const emptyProcedure = {
	procedureCode: '',
	procedureDescription: '',
	onsetOrExacerbation: '',
	dateOfOnsetOrExacerbation: new Date(),
};

export function AssessmentProcedureForm({
	question,
	patientId,
	answer,
	readOnly,
	print,
	configuration,
	additionalDropdownConfigurationInput,
}: Props): JSX.Element {
	const resolvedAnswer = resolveAnswer(answer, { choice: { procedures: [] } });

	const assessmentHook = useAssessmentQuestion(question, patientId, resolvedAnswer, answer, false, undefined);
	const {
		control,
		handleSubmit,
		onSubmit,
		onError,
		isLoading,
		hasValue,
		hasAcceptedValue,
		valueHasBeenEdited,
		getValues,
		canCopy,
	} = assessmentHook;

	const { fields, append, remove } = useFieldArray({
		control,
		name: 'checkedResponse.choice.procedures',
	});

	const handleAddForm = () => {
		append(emptyProcedure);
	};

	const handleRemoveForm = (index: number) => {
		remove(index);
	};

	return (
		<QuestionWrapper
			configuration={configuration}
			additionalDropdownConfigurationInput={additionalDropdownConfigurationInput}
			question={question}
			allAnswers={[]}
			loadingGuess={assessmentHook.isLoadingGuess}
			formValue={''}
			hasError={assessmentHook.hasError}
			onRetrySuggestion={() => null}
			patientId={patientId}
			explanation={''}
			id={question.id}
			questionText={question.text}
			onAccept={() => handleSubmit(onSubmit, onError)()}
			loading={isLoading}
			hasValue={hasValue}
			hasAcceptedValue={hasAcceptedValue}
			valueHasBeenEdited={valueHasBeenEdited}
			readOnly={readOnly}
			print={print}
		>
			<If condition={!fields.length}>
				<AddAndRemoveButtons
					data-cy="add-btn"
					handleAdd={handleAddForm}
					readOnly={readOnly}
					shouldShowAdd={true}
					shouldShowRemove={false}
					addText="Add Procedure"
				/>
			</If>
			{fields.map((field, index) => (
				<Fragment key={field.id}>
					<Grid container spacing={2}>
						<Grid item xs={12}>
							<WithCopyWrapper
								canCopy={canCopy}
								getValue={() => getValues(`checkedResponse.choice.procedures.${index}.procedureCode`)}
							>
								<FormTextField
									readOnly={readOnly}
									disabled={isLoading}
									control={control}
									data-cy={`procedure-code-${index}`}
									name={`checkedResponse.choice.procedures.${index}.procedureCode`}
									label="Procedure Code"
									type={'text'}
								></FormTextField>
							</WithCopyWrapper>
						</Grid>
						<Grid item xs={12}>
							<WithCopyWrapper
								canCopy={canCopy}
								getValue={() =>
									getValues(`checkedResponse.choice.procedures.${index}.procedureDescription`)
								}
							>
								<FormTextField
									readOnly={readOnly}
									disabled={isLoading}
									control={control}
									data-cy={`procedure-description-${index}`}
									name={`checkedResponse.choice.procedures.${index}.procedureDescription`}
									label="Procedure Description"
									type={'text'}
									multiline
									rows={2}
								></FormTextField>
							</WithCopyWrapper>
						</Grid>

						<Grid item xs={12} sm={6}>
							<FormSelectChips
								readOnly={readOnly}
								disabled={isLoading}
								control={control}
								data-cy={`procedure-onsetexacerbation-${index}`}
								name={`checkedResponse.choice.procedures.${index}.onsetOrExacerbation`}
								label="Onset or Exacerbation"
								options={onsetOrExacerbationOptions.map((option) => ({ label: option, value: option }))}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<FormDatePicker
								readOnly={readOnly}
								disabled={isLoading}
								control={control}
								dataCy={`procedure-date-${index}`}
								name={`checkedResponse.choice.procedures.${index}.dateOfOnsetOrExacerbation`}
								label="Date of Onset or Exacerbation"
							/>
						</Grid>
					</Grid>
					<Box mt={1} mb={2}>
						<AddAndRemoveButtons
							handleRemove={() => handleRemoveForm(index)}
							handleAdd={handleAddForm}
							readOnly={readOnly}
							shouldShowAdd={index === fields.length - 1}
							shouldShowRemove={fields.length > 1}
							addText="Add Procedure"
						/>
					</Box>
				</Fragment>
			))}
		</QuestionWrapper>
	);
}
