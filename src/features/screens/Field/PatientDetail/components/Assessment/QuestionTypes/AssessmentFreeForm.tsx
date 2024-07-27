import { FormDatePicker, FormTextField } from '~/features/ui/form-inputs';
import { AdditionalDropdownConfigurationInput } from '~/server/api/routers/organization/organization.inputs';
import { Configuration } from '../../../../../../../assessments/configurations';
import { AssessmentQuestion } from '../../../../../../../assessments/types';
import { SchemaAssessmentAnswer } from '../../../../../../../common/types/AssessmentSuggestionAndChoice';
import { resolveAnswer } from '../../../common/util/resolveAnswer';
import { useAssessmentQuestion } from '../hooks/useAssessmentQuestion';
import { QuestionWrapper } from './Wrapper/QuestionWrapper';

type Props = {
	question: AssessmentQuestion;
	patientId: number;
	answer?: SchemaAssessmentAnswer;
	allAnswers: SchemaAssessmentAnswer[];
	date?: boolean;
	number?: boolean;
	isSpawn?: boolean;
	configuration: Configuration;
	additionalDropdownConfigurationInput: AdditionalDropdownConfigurationInput;
	readOnly: boolean;
	multipleIndex?: number;
	print?: boolean;
};
export function AssessmentFreeForm({
	question,
	patientId,
	answer,
	allAnswers,
	readOnly,
	configuration,
	additionalDropdownConfigurationInput,
	date = false,
	number = false,
	isSpawn = false,
	multipleIndex,
	print,
}: Props): JSX.Element {
	const {
		handleSubmit,
		isLoading,
		control,
		onSubmit,
		onError,
		onRetrySuggestion,
		isLoadingGuess,
		runTimeExplanation,
		hasAcceptedValue,
		hasValue,
		formValue,
		hasError,
		valueHasBeenEdited,
		fieldName,
	} = useAssessmentQuestion(question, patientId, resolveAnswer(answer), answer, isSpawn, multipleIndex);

	return (
		<>
			<QuestionWrapper
				question={question}
				formValue={formValue}
				configuration={configuration}
				additionalDropdownConfigurationInput={additionalDropdownConfigurationInput}
				patientId={patientId}
				allAnswers={allAnswers}
				explanation={answer?.generatedResponse?.explanation ?? runTimeExplanation}
				id={question.id}
				questionText={question.text}
				onAccept={() => handleSubmit(onSubmit, onError)()}
				onRetrySuggestion={onRetrySuggestion}
				loading={isLoading}
				hasError={hasError}
				loadingGuess={isLoadingGuess}
				hasValue={hasValue}
				multipleIndex={multipleIndex}
				hasAcceptedValue={hasAcceptedValue}
				valueHasBeenEdited={valueHasBeenEdited}
				readOnly={readOnly}
				print={print}
			>
				{date && (
					<FormDatePicker
						readOnly={readOnly}
						disabled={isLoading}
						control={control}
						name={fieldName}
						label={question.text}
					/>
				)}
				{!date && (
					<FormTextField
						readOnly={readOnly}
						disabled={isLoading}
						control={control}
						name={fieldName}
						label={question.text}
						type={number ? 'number' : 'text'}
						multiline
					/>
				)}
			</QuestionWrapper>
		</>
	);
}
