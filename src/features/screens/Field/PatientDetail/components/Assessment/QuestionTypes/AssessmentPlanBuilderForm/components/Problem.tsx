import { Box, Grid, Typography } from '@mui/material';
import { kebabCase } from 'lodash';
import { UseFormReturn } from 'react-hook-form';
import { FormTextField } from '~/features/ui/form-inputs';
import { AssessmentCheckInput, AssessmentPlanBuilder } from '~/server/api/routers/assessment/assessment.inputs';
import theme from '~/styles/theme';

type Props = {
	problem: AssessmentPlanBuilder['choice']['areas'][0]['problems'][0];
	problemIndex: number;
	categoryIndex: number;
	print: boolean;
	planBuilderForm: UseFormReturn<AssessmentCheckInput>;
	readOnly?: boolean;
};
export function Problem({
	problem,
	problemIndex,
	categoryIndex,
	planBuilderForm,
	print,
	readOnly,
}: Props): JSX.Element | null {
	const path = `checkedResponse.choice.areas.${categoryIndex}.problems.${problemIndex}` as const;
	const { control } = planBuilderForm;

	return (
		<>
			<Grid item xs={12} key={problemIndex}>
				<Box my={2}>
					<Typography variant="body1" color="secondary">
						{problem.name}
					</Typography>
				</Box>

				<Grid item xs={12}>
					<Grid
						item
						xs={12}
						mt={2}
						pl={2}
						borderLeft={print ? '' : `2px solid ${theme.palette.secondary.light}`}
					>
						<Grid item xs={12}>
							<FormTextField
								data-cy={`plan-builder-goal-details-${kebabCase(problem.name)}`}
								sx={{ mt: 2 }}
								label={`Provide details about the goal`}
								control={control}
								readOnly={readOnly}
								name={`${path}.goalDetails`}
								multiline
							/>
						</Grid>
						<Box>
							<FormTextField
								readOnly={readOnly}
								data-cy={`plan-builder-intervention-details-${kebabCase(problem.name)}`}
								sx={{ mt: 2 }}
								label={`Provide details about the intervention`}
								control={control}
								name={`${path}.interventionDetails`}
								multiline
							/>
						</Box>
					</Grid>
				</Grid>
			</Grid>
		</>
	);
}
