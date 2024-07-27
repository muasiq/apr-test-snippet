import { Alert, Box, Stack, Typography } from '@mui/material';
import { addWeeks } from 'date-fns';
import { Fragment } from 'react';
import { FieldErrors, useFieldArray } from 'react-hook-form';
import { FrequencyOption } from '~/assessments/util/visitFrequencyUtil';
import { api } from '~/common/utils/api';
import type {
	AssessmentCheckInput,
	HomeHealthAideVisitFrequencySchema,
} from '~/server/api/routers/assessment/assessment.inputs';
import { AdditionalDropdownConfigurationInput } from '~/server/api/routers/organization/organization.inputs';
import { Configuration } from '../../../../../../../../assessments/configurations';
import { AssessmentQuestion } from '../../../../../../../../assessments/types';
import { useAlert } from '../../../../../../../../common/hooks/useAlert';
import { SchemaAssessmentAnswer } from '../../../../../../../../common/types/AssessmentSuggestionAndChoice';
import { LoadingSpinner } from '../../../../../../../ui/loading/LoadingSpinner';
import { resolveAnswer } from '../../../../common/util/resolveAnswer';
import { AddAndRemoveButtons } from '../../../AddAndRemoveButtons';
import { useAssessmentQuestion } from '../../hooks/useAssessmentQuestion';
import { QuestionWrapper } from '../Wrapper/QuestionWrapper';
import { FrequencySegmentForm } from './FrequencySegmentForm';

type Props = {
	question: AssessmentQuestion;
	patientId: number;
	readOnly: boolean;
	configuration: Configuration;
	additionalDropdownConfigurationInput: AdditionalDropdownConfigurationInput;
	answer?: SchemaAssessmentAnswer;
	print?: boolean;
};

export function AssessmentHomeHealthAideVisitFrequenciesForm({
	question,
	patientId,
	answer,
	readOnly,
	print,
	configuration,
	additionalDropdownConfigurationInput,
}: Props): JSX.Element {
	const resolvedAnswer = resolveAnswer(answer, {
		choice: {
			homeHealthAideVisitFrequencies: [
				{
					frequency: '' as FrequencyOption,
					daysOfWeek: [],
					numberOfWeeks: null as unknown as number,
					startDate: undefined as unknown as Date,
					endDate: undefined as unknown as Date,
				},
			],
		},
	});
	const alert = useAlert();
	const patientQuery = api.patient.getById.useQuery({ id: patientId, includes: {} });
	const assessmentHook = useAssessmentQuestion(question, patientId, resolvedAnswer, answer, false, undefined);
	const { control, handleSubmit, onSubmit, setValue, getValues, isLoading } = assessmentHook;
	const { fields, append, remove } = useFieldArray({
		control,
		name: 'checkedResponse.choice.homeHealthAideVisitFrequencies',
	});

	const handleAddForm = () => {
		const { SOCVisitDate } = patientQuery.data ?? {};
		const endDate = SOCVisitDate ? addWeeks(SOCVisitDate, 1) : null;
		append({
			frequency: '' as FrequencyOption,
			daysOfWeek: [],
			numberOfWeeks: null as unknown as number,
			startDate: SOCVisitDate!,
			endDate: endDate!,
		});
	};

	function onError(errors: FieldErrors<AssessmentCheckInput>) {
		console.log('errors with the form', errors);
		const choiceError = errors.checkedResponse?.choice;
		if (choiceError) {
			const coalesced = choiceError as {
				homeHealthAideVisitFrequencies?: FieldErrors<HomeHealthAideVisitFrequencySchema>;
			};
			const message = coalesced.homeHealthAideVisitFrequencies?.root?.message;
			if (message?.length) {
				alert.addErrorAlert({ message });
			}
		}
	}

	const handleRemoveForm = (index: number) => {
		remove(index);
	};

	if (patientQuery.isLoading) {
		return <LoadingSpinner />;
	}

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
				onAccept={handleSubmit(onSubmit, onError)}
				loading={isLoading}
				loadingText={"Preparing Visit list now. Please wait, you'll be able to review and edit the list soon."}
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
							<Typography variant={'body1'}>No Home Health Aide visits needed</Typography>
						</Alert>
						<AddAndRemoveButtons
							shouldShowRemove={false}
							addText="Add Frequency Segment"
							handleAdd={() => handleAddForm()}
							shouldShowAdd={!assessmentHook.isLoadingGuess}
							readOnly={readOnly}
						/>
					</Stack>
				)}

				<Stack>
					{fields.map((field, index) => (
						<Fragment key={field.id}>
							<FrequencySegmentForm
								control={control}
								index={index}
								readOnly={readOnly}
								isLoading={isLoading}
								setValue={setValue}
								getValues={getValues}
								socStartDate={patientQuery.data?.SOCVisitDate ?? null}
							/>
							<Box mt={1} mb={2}>
								<AddAndRemoveButtons
									handleRemove={() => handleRemoveForm(index)}
									handleAdd={() => handleAddForm()}
									shouldShowAdd={index === fields.length - 1}
									readOnly={readOnly}
									addText="Add Frequency Segment"
								/>
							</Box>
						</Fragment>
					))}
				</Stack>
			</QuestionWrapper>
		</>
	);
}
