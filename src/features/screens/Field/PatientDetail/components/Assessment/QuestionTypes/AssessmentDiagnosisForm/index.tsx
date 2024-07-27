import { Box, Grid } from '@mui/material';
import { Fragment } from 'react';
import { useFieldArray } from 'react-hook-form';
import { AdditionalDropdownConfigurationInput } from '~/server/api/routers/organization/organization.inputs';
import { Configuration } from '../../../../../../../../assessments/configurations';
import { AssessmentQuestion } from '../../../../../../../../assessments/types';
import { SchemaAssessmentAnswer } from '../../../../../../../../common/types/AssessmentSuggestionAndChoice';
import { If } from '../../../../../../../ui/util/If';
import { resolveAnswer } from '../../../../common/util/resolveAnswer';
import { AddAndRemoveButtons } from '../../../AddAndRemoveButtons';
import { useAssessmentQuestion } from '../../hooks/useAssessmentQuestion';
import { QuestionWrapper } from '../Wrapper/QuestionWrapper';
import { DiagnosesForm } from './DiagnosesForm';

type Props = {
	question: AssessmentQuestion;
	patientId: number;
	configuration: Configuration;
	additionalDropdownConfigurationInput: AdditionalDropdownConfigurationInput;
	readOnly: boolean;
	answer?: SchemaAssessmentAnswer;
	print?: boolean;
};

const emptyDiagnosis = {
	diagnosisCode: '',
	diagnosisDescription: '',
	symptomControlRating: '',
	onsetOrExacerbation: '',
	dateOfOnsetOrExacerbation: new Date(),
};

export function AssessmentDiagnosisForm({
	question,
	patientId,
	answer,
	readOnly,
	print,
	configuration,
	additionalDropdownConfigurationInput,
}: Props): JSX.Element {
	const resolvedAnswer = resolveAnswer(answer, { choice: { diagnoses: [emptyDiagnosis] } });

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
		canCopy,
		setValue,
	} = assessmentHook;

	const { fields, append, remove } = useFieldArray({
		control,
		name: 'checkedResponse.choice.diagnoses',
	});

	const handleAddForm = () => {
		append(emptyDiagnosis);
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
					handleAdd={handleAddForm}
					readOnly={readOnly}
					shouldShowAdd={true}
					shouldShowRemove={false}
					addText="Add Diagnosis"
				/>
			</If>
			{fields.map((field, index) => (
				<Fragment key={field.id}>
					<Grid container spacing={2}>
						<DiagnosesForm
							control={control}
							setValue={setValue}
							index={index}
							readOnly={readOnly}
							isLoading={isLoading}
							canCopy={canCopy}
						/>
					</Grid>
					<Box mt={1} mb={2}>
						<AddAndRemoveButtons
							handleRemove={() => handleRemoveForm(index)}
							handleAdd={handleAddForm}
							readOnly={readOnly}
							shouldShowAdd={index === fields.length - 1}
							shouldShowRemove={fields.length > 1}
							addText="Add Diagnosis"
						/>
					</Box>
				</Fragment>
			))}
		</QuestionWrapper>
	);
}
