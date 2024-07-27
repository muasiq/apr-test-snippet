import { Alert, Box, Stack, Typography } from '@mui/material';
import { Fragment } from 'react';
import { FormProvider, useFieldArray } from 'react-hook-form';
import { Configuration } from '~/assessments/configurations';
import { AssessmentQuestion } from '~/assessments/types';
import { SchemaAssessmentAnswer } from '~/common/types/AssessmentSuggestionAndChoice';
import { If } from '~/features/ui/util/If';
import { FacilityInput } from '~/server/api/routers/assessment/assessment.inputs';
import { AdditionalDropdownConfigurationInput } from '~/server/api/routers/organization/organization.inputs';
import { resolveAnswer } from '../../../../common/util/resolveAnswer';
import { AddAndRemoveButtons } from '../../../AddAndRemoveButtons';
import { useAssessmentQuestion } from '../../hooks/useAssessmentQuestion';
import { QuestionWrapper } from '../Wrapper/QuestionWrapper';
import { FacilityForm } from './FacilityForm';

type Props = {
	question: AssessmentQuestion;
	patientId: number;
	readOnly: boolean;
	configuration: Configuration;
	additionalDropdownConfigurationInput: AdditionalDropdownConfigurationInput;
	answer?: SchemaAssessmentAnswer;
	print?: boolean;
};

export const AssessmentFacilityForm = ({
	question,
	patientId,
	answer,
	readOnly,
	print,
	configuration,
	additionalDropdownConfigurationInput,
}: Props) => {
	const resolvedAnswer = resolveAnswer(answer, { choice: { facilities: [] } });
	const assessmentHook = useAssessmentQuestion(question, patientId, resolvedAnswer, answer, false, undefined);
	const { form, onSubmit, onError, canCopy, isLoading } = assessmentHook;

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: 'checkedResponse.choice.facilities',
	});

	const handleAddForm = (facility?: FacilityInput) => {
		if (facility) append(facility);
		append({ name: '', type: '', address: '', city: '', phone: '', fax: '' });
	};

	const handleRemoveForm = (index: number) => {
		remove(index);
	};

	return (
		<FormProvider {...form}>
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
				onAccept={() => form.handleSubmit(onSubmit, onError)()}
				loading={isLoading}
				loadingText={
					"Preparing Related Facilities list now. Please wait, you'll be able to review and edit the list soon. This is required in order to draft the documentation."
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
							<Typography variant={'body1'}>No Related Facilities</Typography>
						</Alert>
						<AddAndRemoveButtons
							shouldShowRemove={false}
							addText="Add Facility"
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
								A draft of the patient&apos;s Related Facilities list is below. Please thoroughly review
								the list and make any edits needed.
							</Typography>
						</Box>
					</If>
					{fields.map((field, index) => (
						<Fragment key={field.id}>
							<FacilityForm
								index={index}
								isLoading={isLoading}
								readOnly={readOnly}
								canCopy={canCopy}
								control={form.control}
								watch={form.watch}
								getValues={form.getValues}
								setValue={form.setValue}
								resetField={form.resetField}
							/>
							<Box mt={1} mb={2}>
								<AddAndRemoveButtons
									handleRemove={() => handleRemoveForm(index)}
									handleAdd={() => handleAddForm()}
									shouldShowAdd={index === fields.length - 1}
									readOnly={readOnly}
									addText="Add Facility"
								/>
							</Box>
						</Fragment>
					))}
				</Stack>
			</QuestionWrapper>
		</FormProvider>
	);
};
