import { Box, Button, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Configuration } from '~/assessments/configurations';
import { AssessmentQuestion } from '~/assessments/types';
import { SchemaAssessmentAnswer } from '~/common/types/AssessmentSuggestionAndChoice';
import { api } from '~/common/utils/api';
import {
	DEFAULT_VITAL_SIGN_CONFIG_NAME,
	VitalSignConfigKey,
	vitalSignParamFieldGroups,
} from '~/features/screens/Office/Admin/OrgProfile/EMRConfiguration/VitalSignConfig/vitalSignConfig.utils';
import { FormSelect, FormTextField } from '~/features/ui/form-inputs';
import { BottomDrawer } from '~/features/ui/layouts/BottomDrawer';
import { LoadingSpinner } from '~/features/ui/loading/LoadingSpinner';
import { AssessmentVitalSignParams } from '~/server/api/routers/assessment/assessment.inputs';
import { AdditionalDropdownConfigurationInput } from '~/server/api/routers/organization/organization.inputs';
import { resolveAnswer } from '../../../../common/util/resolveAnswer';
import { useAssessmentQuestion } from '../../hooks/useAssessmentQuestion';
import { QuestionWrapper } from '../Wrapper/QuestionWrapper';

type Props = {
	question: AssessmentQuestion;
	patientId: number;
	configuration: Configuration;
	additionalDropdownConfigurationInput: AdditionalDropdownConfigurationInput;
	readOnly: boolean;
	answer?: SchemaAssessmentAnswer;
	print?: boolean;
};

export function AssessmentVitalSignParametersForm({
	question,
	patientId,
	answer,
	readOnly,
	print,
	configuration,
	additionalDropdownConfigurationInput,
}: Props): JSX.Element {
	const [showParams, setShowParams] = useState(false);
	const configsQuery = api.organization.getVitalSignConfigs.useQuery(undefined);

	const resolvedAnswer = resolveAnswer(answer, { choice: { vitalSignParameters: {} } } as AssessmentVitalSignParams);

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
		form,
	} = assessmentHook;

	const fieldName = 'checkedResponse.choice.vitalSignParameters';

	useEffect(() => {
		const subscriber = form.watch((data, { name }) => {
			const params = (data.checkedResponse as AssessmentVitalSignParams).choice.vitalSignParameters;
			const config = configsQuery.data?.find((item) => item.id === params.profile);
			const field = name?.replace(`${fieldName}.`, '') as VitalSignConfigKey;

			if (name === 'checkedResponse.choice.vitalSignParameters.profile' && config) {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const { name, id, organizationId, createdAt, updatedAt, ...rest } = config;
				Object.entries(rest).forEach(([key, value]) => {
					form.setValue(`${fieldName}.${key as VitalSignConfigKey}`, value, { shouldDirty: false });
				});
			} else if (config && name?.startsWith(fieldName) && config[field] !== params[field]) {
				form.setValue(`${fieldName}.profile`, 'Custom', { shouldDirty: false });
			}
		});
		return () => {
			subscriber.unsubscribe();
		};
	}, [form, fieldName, configsQuery.data]);

	const configOptions = [
		...(configsQuery.data?.map((item) => ({ label: item.name, value: item.id })) ?? []),
		{ label: 'Custom', value: 'Custom' },
	];

	if (!configsQuery.data) return <LoadingSpinner />;

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
			<FormSelect
				control={control}
				name={`${fieldName}.profile`}
				label="Parameter Profile"
				data-cy="vital-sign-profile-select"
				options={configOptions}
			/>
			<Button onClick={() => setShowParams(!showParams)} sx={{ mt: 2 }}>
				view parameters
			</Button>
			<BottomDrawer
				isOpen={showParams}
				setIsOpen={async () => {
					const valid = await form.trigger();
					if (valid) setShowParams(false);
				}}
				label="Parameters"
				closeButtonText="Save"
			>
				<Stack direction="column" spacing={3}>
					<Stack direction="row" spacing={1}>
						<FormSelect
							control={control}
							name={`${fieldName}.profile`}
							label="Parameter Profile"
							options={configOptions}
						/>
					</Stack>
					{vitalSignParamFieldGroups.map(({ group, fields }) => (
						<Stack key={group} direction="column" spacing={2}>
							<Typography variant="body1b">{group}</Typography>
							<Box sx={{ display: 'grid', gridTemplateColumns: `1fr 1fr`, gap: 1 }}>
								{fields.map((field) => (
									<FormTextField
										key={field.name}
										control={control}
										name={`${fieldName}.${field.name}`}
										size="small"
										type="number"
										label={field.label}
										data-cy={`vital-sign-${field.name}`}
										fullWidth
									/>
								))}
							</Box>
						</Stack>
					))}
				</Stack>
			</BottomDrawer>
		</QuestionWrapper>
	);
}
