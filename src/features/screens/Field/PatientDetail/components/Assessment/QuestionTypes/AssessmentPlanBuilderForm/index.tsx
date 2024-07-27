import { Grid } from '@mui/material';
import { get } from 'lodash';
import { useMemo } from 'react';
import { useFieldArray } from 'react-hook-form';
import { Configuration } from '~/assessments/configurations';
import { AssessmentQuestion } from '~/assessments/types';
import { SchemaAssessmentAnswer } from '~/common/types/AssessmentSuggestionAndChoice';
import { arrayDiff } from '~/common/utils/arrayDiff';
import { SelectChips } from '~/features/ui/inputs/SelectChips';
import { AdditionalDropdownConfigurationInput } from '~/server/api/routers/organization/organization.inputs';
import { resolveAnswer } from '../../../../common/util/resolveAnswer';
import { useAssessmentQuestion } from '../../hooks/useAssessmentQuestion';
import { QuestionWrapper } from '../Wrapper/QuestionWrapper';
import { Category } from './components/Category';

type Props = {
	question: AssessmentQuestion;
	patientId: number;
	readOnly: boolean;
	configuration: Configuration;
	additionalDropdownConfigurationInput: AdditionalDropdownConfigurationInput;
	answer?: SchemaAssessmentAnswer;
	print?: boolean;
};

export function AssessmentPlanBuilderForm({
	question,
	patientId,
	answer,
	configuration,
	additionalDropdownConfigurationInput,
	readOnly,
	print = false,
}: Props): JSX.Element {
	const resolvedAnswer = resolveAnswer(answer, { choice: { areas: [] } });
	const assessmentHook = useAssessmentQuestion(question, patientId, resolvedAnswer, answer, false, undefined);
	const planBuilderForm = assessmentHook.form;
	const { control, handleSubmit, onSubmit, onError } = assessmentHook;

	const areasFieldArray = useFieldArray({ control, name: 'checkedResponse.choice.areas' });

	const problemCategories = useMemo(() => {
		return configuration.pathways.map((problem) => problem.problemCategory);
	}, [configuration]);

	const categories = areasFieldArray.fields.map((area) => area.category);
	const error = get(planBuilderForm.formState.errors, `checkedResponse.choice.areas.root`);

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
				loading={assessmentHook.isLoading}
				hasValue={assessmentHook.hasValue}
				hasError={assessmentHook.hasError}
				onRetrySuggestion={() => null}
				hasAcceptedValue={assessmentHook.hasAcceptedValue}
				valueHasBeenEdited={assessmentHook.valueHasBeenEdited}
				readOnly={readOnly}
				print={print}
			>
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<SelectChips
							data-cy="plan-builder-problem-categories"
							label="Select all problem statements that apply to this patient."
							readOnly={readOnly}
							options={problemCategories.map((item) => ({ label: item, value: item }))}
							multiple
							value={categories}
							error={error}
							onChange={(e) => {
								const { removeIndices, addItems } = arrayDiff(
									categories,
									e.target.value as unknown as string[],
								);

								areasFieldArray.remove(removeIndices);
								areasFieldArray.append(addItems.map((category) => ({ category, problems: [] })));
							}}
						/>
					</Grid>
					{areasFieldArray.fields.map(({ category, problems }, index) => {
						return (
							<Category
								key={category}
								category={category}
								readOnly={readOnly}
								print={print}
								problems={problems}
								index={index}
								planBuilderForm={planBuilderForm}
								configuration={configuration}
							/>
						);
					})}
				</Grid>
			</QuestionWrapper>
		</>
	);
}
