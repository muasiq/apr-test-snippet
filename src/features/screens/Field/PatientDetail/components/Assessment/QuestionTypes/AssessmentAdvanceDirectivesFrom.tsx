import { Alert, Box, Grid, Stack, Typography } from '@mui/material';
import { Fragment, useEffect } from 'react';
import { useFieldArray } from 'react-hook-form';
import { FormPatternFormatField, FormSelect, FormSelectChips, FormTextField } from '~/features/ui/form-inputs';
import {
	AdvancedDirective,
	informationLeftWithCaregiverOptions,
} from '~/server/api/routers/assessment/assessment.inputs';
import { AdditionalDropdownConfigurationInput } from '~/server/api/routers/organization/organization.inputs';
import { Configuration } from '../../../../../../../assessments/configurations';
import { AssessmentQuestion } from '../../../../../../../assessments/types';
import { SchemaAssessmentAnswer } from '../../../../../../../common/types/AssessmentSuggestionAndChoice';
import { If } from '../../../../../../ui/util/If';
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

export function AssessmentAdvanceDirectivesFrom({
	question,
	patientId,
	answer,
	readOnly,
	print,
	configuration,
	additionalDropdownConfigurationInput,
}: Props) {
	const resolvedAnswer = resolveAnswer(answer, {
		choice: {
			advanceDirectives: [],
		},
	});
	const assessmentHook = useAssessmentQuestion(question, patientId, resolvedAnswer, answer, false, undefined);
	const { control, handleSubmit, onError, onSubmit, getValues, canCopy, isLoading, reset } = assessmentHook;

	const { fields, append, remove } = useFieldArray({
		control,
		name: 'checkedResponse.choice.advanceDirectives',
	});

	useEffect(() => {
		reset({
			...getValues(),
			checkedResponse: resolveAnswer(answer as unknown as SchemaAssessmentAnswer, {
				choice: {
					advanceDirectives: [],
				},
			}),
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [JSON.stringify(answer)]);

	const handleAddForm = (advanceDirective?: AdvancedDirective) => {
		if (advanceDirective) append(advanceDirective);
		append({
			location: '',
			contents: [],
			type: '' as AdvancedDirective['type'],
			informationLeftWithCaregiver: '' as AdvancedDirective['informationLeftWithCaregiver'],
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
				loading={isLoading}
				loadingText={
					"Preparing Advance Directives list now. Please wait, you'll be able to review and edit the list soon. This is required in order to draft the documentation."
				}
				hasValue={assessmentHook.hasValue}
				hasError={false}
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
							<Typography variant={'body1'}>No Advance Directives</Typography>
						</Alert>
						<AddAndRemoveButtons
							shouldShowRemove={false}
							addText="Add Advance Directive"
							handleAdd={() => handleAddForm()}
							shouldShowAdd={!assessmentHook.isLoadingGuess}
							readOnly={readOnly}
						/>
					</Stack>
				)}
				<Stack>
					<If condition={!assessmentHook.hasAcceptedValue && !!fields.length}>
						<Box mb={2}>
							<Typography variant="h6">
								A draft of the patient&apos;s Advance Directives list is below. Please thoroughly review
								the list and make any edits needed.
							</Typography>
						</Box>
					</If>
					{fields.map((field, index) => (
						<Fragment key={field.id}>
							<Grid container spacing={2}>
								<Grid item xs={6}>
									<FormSelect
										data-cy={`advance-directive-type-${index}`}
										readOnly={readOnly}
										disabled={isLoading}
										control={control}
										name={`checkedResponse.choice.advanceDirectives.${index}.type`}
										label="Type"
										freeSolo
										options={additionalDropdownConfigurationInput.advanceDirectiveType.map(
											(item) => ({ value: item, label: item }),
										)}
									/>
								</Grid>

								<Grid item xs={6}>
									<FormSelectChips
										data-cy={`advance-directive-contents-${index}`}
										multiple
										readOnly={readOnly}
										disabled={isLoading}
										control={control}
										name={`checkedResponse.choice.advanceDirectives.${index}.contents`}
										label="Contents"
										freeSolo
										options={additionalDropdownConfigurationInput.advanceDirectiveContents.map(
											(item) => ({ value: item, label: item }),
										)}
									/>
								</Grid>

								<Grid item xs={6}>
									<WithCopyWrapper
										canCopy={canCopy}
										getValue={() =>
											getValues(`checkedResponse.choice.advanceDirectives.${index}.location`)
										}
									>
										<FormTextField
											data-cy={`advance-directive-location-${index}`}
											readOnly={readOnly}
											disabled={isLoading}
											control={control}
											name={`checkedResponse.choice.advanceDirectives.${index}.location`}
											label="Location"
										/>
									</WithCopyWrapper>
								</Grid>
								<Grid item xs={6}>
									<FormSelect
										data-cy={`advance-directive-information-left-with-caregiver-${index}`}
										readOnly={readOnly}
										disabled={isLoading}
										control={control}
										name={`checkedResponse.choice.advanceDirectives.${index}.informationLeftWithCaregiver`}
										label="Was Advance Directive information left with caregiver?"
										options={informationLeftWithCaregiverOptions.map((item) => ({
											value: item,
											label: item,
										}))}
									/>
								</Grid>

								<Grid item xs={6}>
									<WithCopyWrapper
										canCopy={canCopy}
										getValue={() =>
											getValues(
												`checkedResponse.choice.advanceDirectives.${index}.contactName`,
											) ?? ''
										}
									>
										<FormTextField
											control={control}
											data-cy={`advance-directive-contact-name-${index}`}
											name={`checkedResponse.choice.advanceDirectives.${index}.contactName`}
											label="Contact Name"
											readOnly={readOnly}
										/>
									</WithCopyWrapper>
								</Grid>

								<Grid item xs={6}>
									<WithCopyWrapper
										canCopy={canCopy}
										getValue={() =>
											getValues(
												`checkedResponse.choice.advanceDirectives.${index}.contactPhone`,
											) ?? ''
										}
									>
										<FormPatternFormatField
											data-cy={`advance-directive-contact-phone-${index}`}
											patternFormatProps={{
												format: '(###) ###-####',
												mask: '_',
											}}
											control={control}
											name={`checkedResponse.choice.advanceDirectives.${index}.contactPhone`}
											label="Contact Phone"
											readOnly={readOnly}
										/>
									</WithCopyWrapper>
								</Grid>
							</Grid>
							<Box mt={1} mb={2}>
								<AddAndRemoveButtons
									handleRemove={() => handleRemoveForm(index)}
									handleAdd={() => handleAddForm()}
									shouldShowAdd={index === fields.length - 1}
									readOnly={readOnly}
									addText="Add Advance Directive"
								/>
							</Box>
						</Fragment>
					))}
				</Stack>
			</QuestionWrapper>
		</>
	);
}
