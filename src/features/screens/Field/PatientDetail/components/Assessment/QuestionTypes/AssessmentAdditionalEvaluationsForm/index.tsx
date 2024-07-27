import { Alert, Box, Stack, Typography } from '@mui/material';
import { addDays, isFriday, isThursday, isWeekend, nextFriday, nextMonday } from 'date-fns';
import { Fragment } from 'react';
import { useFieldArray } from 'react-hook-form';
import { api } from '~/common/utils/api';
import { LoadingSpinner } from '~/features/ui/loading/LoadingSpinner';
import { AdditionalEvaluationInput } from '~/server/api/routers/assessment/assessment.inputs';
import { AdditionalDropdownConfigurationInput } from '~/server/api/routers/organization/organization.inputs';
import { Configuration } from '../../../../../../../../assessments/configurations';
import { AssessmentQuestion } from '../../../../../../../../assessments/types';
import { SchemaAssessmentAnswer } from '../../../../../../../../common/types/AssessmentSuggestionAndChoice';
import { resolveAnswer } from '../../../../common/util/resolveAnswer';
import { AddAndRemoveButtons } from '../../../AddAndRemoveButtons';
import { useAssessmentQuestion } from '../../hooks/useAssessmentQuestion';
import { QuestionWrapper } from '../Wrapper/QuestionWrapper';
import { AddonEvaluationForm } from './AddonEvaluaionForm';

type Props = {
	question: AssessmentQuestion;
	patientId: number;
	readOnly: boolean;
	configuration: Configuration;
	additionalDropdownConfigurationInput: AdditionalDropdownConfigurationInput;
	answer?: SchemaAssessmentAnswer;
	print?: boolean;
};

function initializeEvaluationDate(socDate: Date) {
	if (isFriday(socDate) || isWeekend(socDate)) return nextMonday(socDate);
	if (isThursday(socDate)) return nextFriday(socDate);
	return addDays(socDate, 2);
}

export function AssessmentAdditionalEvaluationsForm({
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
			supplies: [],
		},
	});
	const assessmentHook = useAssessmentQuestion(question, patientId, resolvedAnswer, answer, false, undefined);
	const { control, handleSubmit, onError, onSubmit, isLoading } = assessmentHook;
	const patientQuery = api.patient.getById.useQuery({
		id: patientId,
		includes: { Organization: { include: { AdditionalEvaluationServiceCodes: true } } },
	});
	const { fields, append, remove } = useFieldArray({
		control,
		name: 'checkedResponse.choice.addonEvaluations',
	});

	const handleAddForm = (addonEvaluation?: AdditionalEvaluationInput) => {
		if (addonEvaluation) append(addonEvaluation);
		else if (patientQuery.data?.SOCVisitDate) {
			append({
				serviceCode: '',
				date: initializeEvaluationDate(patientQuery.data.SOCVisitDate),
			});
		}
	};

	const handleRemoveForm = (index: number) => {
		remove(index);
	};

	if (patientQuery.isLoading) return <LoadingSpinner />;

	return (
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
			loadingText={"Preparing Evaluations now. Please wait, you'll be able to review and edit the list soon."}
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
						<Typography variant={'body1'}>No Add-on Evaluation added</Typography>
					</Alert>
					<AddAndRemoveButtons
						shouldShowRemove={false}
						addText="Add Evaluation"
						handleAdd={() => handleAddForm()}
						shouldShowAdd={!assessmentHook.isLoadingGuess}
						readOnly={readOnly}
					/>
				</Stack>
			)}

			<Stack>
				{fields.map((field, index) => (
					<Fragment key={field.id}>
						<AddonEvaluationForm
							control={control}
							data={patientQuery.data?.Organization?.AdditionalEvaluationServiceCodes ?? []}
							readOnly={readOnly}
							isLoading={isLoading}
							index={index}
						/>
						<Box mt={1} mb={2}>
							<AddAndRemoveButtons
								handleRemove={() => handleRemoveForm(index)}
								handleAdd={() => handleAddForm()}
								shouldShowAdd={index === fields.length - 1}
								readOnly={readOnly}
								addText="Add Add-on Evaluation"
							/>
						</Box>
					</Fragment>
				))}
			</Stack>
		</QuestionWrapper>
	);
}
