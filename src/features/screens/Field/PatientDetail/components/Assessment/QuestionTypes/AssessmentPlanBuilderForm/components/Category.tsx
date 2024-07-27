import { Box, Grid, Typography } from '@mui/material';
import { get } from 'lodash';
import { Fragment, useMemo } from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { Configuration } from '~/assessments/configurations';
import { arrayDiff } from '~/common/utils/arrayDiff';
import { getProblemDetails, getProblemItems } from '~/common/utils/carePlan';
import { SelectChips } from '~/features/ui/inputs/SelectChips';
import { AssessmentCheckInput, AssessmentPlanBuilder } from '~/server/api/routers/assessment/assessment.inputs';
import { Problem } from './Problem';

type Props = {
	configuration: Configuration;
	category: string;
	problems: AssessmentPlanBuilder['choice']['areas'][0]['problems'];
	index: number;
	print: boolean;
	planBuilderForm: UseFormReturn<AssessmentCheckInput>;
	readOnly?: boolean;
};

export function Category({
	category,
	configuration,
	index,
	planBuilderForm,
	print,
	readOnly,
}: Props): JSX.Element | null {
	const { control } = planBuilderForm;
	const path = `checkedResponse.choice.areas.${index}` as const;

	const problemsFieldArray = useFieldArray({
		control,
		name: `${path}.problems`,
	});

	const planBuilderProblemOptions = useMemo(
		() => getProblemItems(configuration, [category]),
		[category, configuration],
	);

	const problems = problemsFieldArray.fields.map((p) => p.name);
	const error = get(planBuilderForm.formState.errors, `${path}.problems.root`);

	return (
		<>
			<Grid item xs={12}>
				<Box my={2}>
					<Typography variant="h6" color="primary">
						{category}
					</Typography>
				</Box>

				<Grid item xs={12}>
					<SelectChips
						data-cy={`plan-builder-problems-${index}`}
						label="Which problem statements currently apply to this patient?"
						readOnly={readOnly}
						options={planBuilderProblemOptions}
						multiple
						value={problems}
						error={error}
						onChange={(e) => {
							const { removeIndices, addItems } = arrayDiff(
								problems,
								e.target.value as unknown as string[],
							);

							problemsFieldArray.remove(removeIndices);
							problemsFieldArray.append(
								addItems.map((name) => {
									const details = getProblemDetails(name, configuration);
									return {
										name,
										goalDetails: details.goalTemplate,
										interventionDetails: details.interventionTemplate,
									};
								}),
							);
						}}
					/>
				</Grid>

				{problemsFieldArray.fields?.map((problem, problemIndex) => {
					return (
						<Fragment key={problem.id}>
							<Problem
								readOnly={readOnly}
								print={print}
								problem={problem}
								categoryIndex={index}
								problemIndex={problemIndex}
								planBuilderForm={planBuilderForm}
							/>
						</Fragment>
					);
				})}
			</Grid>
		</>
	);
}
