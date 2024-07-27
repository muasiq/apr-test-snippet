import { difference, isArray } from 'lodash';
import { FormSelectChips } from '~/features/ui/form-inputs';
import { AdditionalDropdownConfigurationInput } from '~/server/api/routers/organization/organization.inputs';
import { Configuration } from '../../../../../../../assessments/configurations';
import { AssessmentQuestion, AssessmentQuestionSources } from '../../../../../../../assessments/types';
import { SchemaAssessmentAnswer } from '../../../../../../../common/types/AssessmentSuggestionAndChoice';
import { CheckedResponseUnion } from '../../../../../../../server/api/routers/assessment/assessment.inputs';
import { resolveAnswer } from '../../../common/util/resolveAnswer';
import { useAssessmentQuestion } from '../hooks/useAssessmentQuestion';
import { QuestionWrapper } from './Wrapper/QuestionWrapper';

type Props = {
	question: AssessmentQuestion;
	patientId: number;
	answer?: SchemaAssessmentAnswer;
	allAnswers: SchemaAssessmentAnswer[];
	isSpawn?: boolean;
	readOnly: boolean;
	configuration: Configuration;
	additionalDropdownConfigurationInput: AdditionalDropdownConfigurationInput;
	multipleIndex?: number;
	print?: boolean;
};
export function AssessmentSelectAllThatApply({
	question,
	patientId,
	answer,
	configuration,
	additionalDropdownConfigurationInput,
	allAnswers,
	isSpawn = false,
	readOnly,
	multipleIndex,
	print,
}: Props): JSX.Element {
	const {
		handleSubmit,
		isLoading,
		control,
		onSubmit,
		onError,
		isLoadingGuess,
		runTimeExplanation,
		fieldName,
		formValue,
		hasAcceptedValue,
		hasValue,
		hasError,
		onRetrySuggestion,
		valueHasBeenEdited,
	} = useAssessmentQuestion(
		question,
		patientId,
		resolveAnswer(answer, { choice: [] } as CheckedResponseUnion, true),
		answer,
		isSpawn,
		multipleIndex,
	);

	const choice = formValue;
	const options = question.responses ?? [];
	const missingOptions = difference(
		isArray(choice) ? choice : [choice],
		options.map((r) => r.text),
	);
	const missingOptionsWithLabel = missingOptions.filter((t) => t).map((text) => ({ label: text, value: text }));
	const forDisplayOptions = options.map((r) => {
		return {
			label: question.source === AssessmentQuestionSources.Oasis && r.code ? `${r.code} - ${r.text}` : r.text,
			value: r.text,
		};
	});
	const optionsWithMissing = [...forDisplayOptions, ...missingOptionsWithLabel];

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
				loading={isLoading}
				hasError={hasError}
				onRetrySuggestion={onRetrySuggestion}
				loadingGuess={isLoadingGuess}
				hasValue={hasValue}
				hasAcceptedValue={hasAcceptedValue}
				valueHasBeenEdited={valueHasBeenEdited}
				readOnly={readOnly}
				multipleIndex={multipleIndex}
				print={print}
			>
				<FormSelectChips
					data-cy={question.id}
					disabled={isLoading}
					multiple
					options={optionsWithMissing}
					name={fieldName}
					label={question.text}
					control={control}
					readOnly={readOnly}
				></FormSelectChips>
			</QuestionWrapper>
		</>
	);
}
