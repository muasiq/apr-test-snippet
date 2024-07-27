import { zodResolver } from '@hookform/resolvers/zod';
import { Container, Divider, Grid, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useOrgConfiguration } from '~/common/hooks/useOrgConfiguration';
import { lookupQuestion } from '../../../../assessments/util/lookupQuestionUtil';
import { useAlert } from '../../../../common/hooks/useAlert';
import { api } from '../../../../common/utils/api';
import {
	PromptIterationTestMode,
	RunBackTestForSuggestionsInput,
	runBackTestForSuggestionsSchema,
} from '../../../../server/api/routers/promptIteration/promptIteration.inputs';
import { If } from '../../../ui/util/If';
import { SelectQuestionToPromptIterate } from './SelectQuestionToPromptIterate';
import { ShowIterationResult } from './ShowIterationResult';
import { TemplateForm } from './TemplateForm';
import { newSuggestionsThatMatch, type SuggestionOutput } from './util/suggestionAndChoiceUtils';

export const PromptIterateScreen = (): JSX.Element => {
	const router = useRouter();
	const [patientTestAmount, setPatientTestAmount] = useState<number>(5);
	const [selectedPatientIds, setSelectedPatientIds] = useState<number[]>([]);
	const [patientTestMode, setPatientTestMode] = useState<PromptIterationTestMode>(
		PromptIterationTestMode.NUMBER_SELECT,
	);

	const { configuration } = useOrgConfiguration();
	const { source, assessmentNumber } = router.query as { source?: string; assessmentNumber?: string };
	const alert = useAlert();

	const lookedUpQuestion = useMemo(() => {
		if (!configuration || !source || !assessmentNumber) return null;
		return lookupQuestion(assessmentNumber, configuration);
	}, [assessmentNumber, configuration, source]);

	const { handleSubmit, control, getValues, reset } = useForm<RunBackTestForSuggestionsInput>({
		resolver: zodResolver(runBackTestForSuggestionsSchema),
		defaultValues: {
			assessmentNumber,
			sampleSize: patientTestAmount,
			patientTestIds: selectedPatientIds,
			testMode: patientTestMode,
			templateOverrides: {
				codingInstructions: lookedUpQuestion?.codingInstructions,
				template: lookedUpQuestion?.template,
				alternateQuestionText: lookedUpQuestion?.alternateQuestionText ?? lookedUpQuestion?.text ?? '',
				hints: lookedUpQuestion?.hints,
				examples: lookedUpQuestion?.examples,
			},
		},
	});

	const { data, isSuccess, mutate, isLoading } = api.promptIteration.runBackTestForSuggestions.useMutation({
		onError: (error) => {
			alert.addErrorAlert({ title: 'Error running back test for suggestions', message: error.message });
			console.error('error running back test', error);
		},
	});

	const onError = (errors: object) => {
		console.info('errors with the form', errors);
	};

	const onSubmit = (data: RunBackTestForSuggestionsInput) => {
		mutate(data);
	};

	useEffect(() => {
		if (lookedUpQuestion) {
			reset({
				assessmentNumber,
				sampleSize: patientTestAmount,
				patientTestIds: selectedPatientIds,
				testMode: patientTestMode,
				templateOverrides: {
					codingInstructions: lookedUpQuestion.codingInstructions,
					template: lookedUpQuestion.template,
					alternateQuestionText: lookedUpQuestion.alternateQuestionText ?? lookedUpQuestion.text ?? '',
					hints: lookedUpQuestion.hints,
					examples: lookedUpQuestion.examples,
				},
			});
		}
	}, [lookedUpQuestion, assessmentNumber, source, reset, patientTestAmount, selectedPatientIds, patientTestMode]);

	const nonNullData = data?.filter((item): item is SuggestionOutput => !!item) ?? [];
	const numberThatMatch = data ? newSuggestionsThatMatch(nonNullData).length : 0;
	const total = nonNullData.length ?? 1;
	const percentCorrect = (numberThatMatch / total) * 100;

	return (
		<If condition={!!configuration}>
			<Container maxWidth={'xl'}>
				<SelectQuestionToPromptIterate
					configuration={configuration!}
					selectedPatientIds={selectedPatientIds}
					setSelectedPatientIds={setSelectedPatientIds}
					patientTestAmount={patientTestAmount}
					setPatientTestAmount={setPatientTestAmount}
					patientTestMode={patientTestMode}
					setPatientTestMode={setPatientTestMode}
				/>
				{source && assessmentNumber && (
					<TemplateForm
						isLoading={isLoading}
						onSubmit={handleSubmit(onSubmit, onError)}
						control={control}
						getValues={getValues}
					/>
				)}
				{isSuccess && (
					<Stack spacing={4} mt={4}>
						<Typography variant={'h5'}>Percent Correct: {percentCorrect}%</Typography>
						<Grid container>
							<Grid item xs={2}></Grid>
							<Grid item xs={5}>
								New Response
							</Grid>
							<Grid item xs={5}>
								Checked Response
							</Grid>
						</Grid>
						{nonNullData.map((suggestion, index) => (
							<Fragment key={index}>
								<ShowIterationResult result={suggestion} />
								<Divider />
							</Fragment>
						))}
					</Stack>
				)}
			</Container>
		</If>
	);
};
