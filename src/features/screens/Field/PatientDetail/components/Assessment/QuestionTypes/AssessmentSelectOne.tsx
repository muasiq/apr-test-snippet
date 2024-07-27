import { Stack } from '@mui/material';
import { difference, isArray } from 'lodash';
import { FormSelectChips } from '~/features/ui/form-inputs';
import { AdditionalDropdownConfigurationInput } from '~/server/api/routers/organization/organization.inputs';
import { Configuration } from '../../../../../../../assessments/configurations';
import { AssessmentQuestion, AssessmentQuestionSources } from '../../../../../../../assessments/types';
import { SchemaAssessmentAnswer } from '../../../../../../../common/types/AssessmentSuggestionAndChoice';
import { resolveAnswer } from '../../../common/util/resolveAnswer';
import { useAssessmentQuestion } from '../hooks/useAssessmentQuestion';
import { QuestionWrapper } from './Wrapper/QuestionWrapper';

type Props = {
	question: AssessmentQuestion;
	patientId: number;
	answer?: SchemaAssessmentAnswer;
	allAnswers: SchemaAssessmentAnswer[];
	configuration: Configuration;
	additionalDropdownConfigurationInput: AdditionalDropdownConfigurationInput;
	isSpawn?: boolean;
	multipleIndex?: number;
	readOnly: boolean;
	print?: boolean;
};
export function AssessmentSelectOne({
	question,
	patientId,
	answer,
	allAnswers,
	configuration,
	additionalDropdownConfigurationInput,
	readOnly,
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
		isLoadingGuess,
		runTimeExplanation,
		fieldName,
		onRetrySuggestion,
		hasError,
		formValue,
		hasValue,
		hasAcceptedValue,
		valueHasBeenEdited,
	} = useAssessmentQuestion(question, patientId, resolveAnswer(answer), answer, isSpawn, multipleIndex);

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
			<Stack spacing={2}>
				<QuestionWrapper
					configuration={configuration}
					additionalDropdownConfigurationInput={additionalDropdownConfigurationInput}
					question={question}
					formValue={formValue}
					patientId={patientId}
					allAnswers={allAnswers}
					explanation={answer?.generatedResponse?.explanation ?? runTimeExplanation}
					id={question.id}
					onRetrySuggestion={onRetrySuggestion}
					hasError={hasError}
					questionText={question.text}
					onAccept={() => handleSubmit(onSubmit, onError)()}
					loading={isLoading}
					multipleIndex={multipleIndex}
					loadingGuess={isLoadingGuess}
					hasValue={hasValue}
					hasAcceptedValue={hasAcceptedValue}
					valueHasBeenEdited={valueHasBeenEdited}
					readOnly={readOnly}
					print={print}
				>
					<FormSelectChips
						data-cy={question.id}
						readOnly={readOnly}
						disabled={isLoading}
						options={optionsWithMissing}
						name={fieldName}
						label={question.text}
						control={control}
					></FormSelectChips>
				</QuestionWrapper>
			</Stack>
		</>
	);
}
