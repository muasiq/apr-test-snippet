import { Alert, Box, Grid, Stack, Typography } from '@mui/material';
import { useSession } from 'next-auth/react';
import { Fragment, useEffect } from 'react';
import { useFieldArray } from 'react-hook-form';
import { Configuration } from '~/assessments/configurations';
import { AssessmentQuestion } from '~/assessments/types';
import { useAlert } from '~/common/hooks/useAlert';
import { useDialogState } from '~/common/hooks/useDialogState';
import { useUnsavedInputAlert } from '~/common/hooks/useUnsavedInputAlert';
import { SchemaAssessmentAnswer } from '~/common/types/AssessmentSuggestionAndChoice';
import { RouterOutputs, api } from '~/common/utils/api';
import { trpc } from '~/common/utils/trpc';
import { LoadingSpinner } from '~/features/ui/loading/LoadingSpinner';
import { If } from '~/features/ui/util/If';
import { AssessmentMedicationSchema, MedicationSchema } from '~/server/api/routers/assessment/assessment.inputs';
import { AdditionalDropdownConfigurationInput } from '~/server/api/routers/organization/organization.inputs';
import { AddAndRemoveButtons } from '../../../AddAndRemoveButtons';
import { useAssessmentQuestion } from '../../hooks/useAssessmentQuestion';
import { QuestionWrapper } from '../Wrapper/QuestionWrapper';
import { InteractionsBanner } from './components/InteractionsBanner';
import { InteractionsDrawer } from './components/InteractionsDrawer';
import { MedicationForm } from './components/MedicationForm';
import { migrateOldFormatResolve } from './utils';

type Props = {
	question: AssessmentQuestion;
	patientId: number;
	readOnly: boolean;
	configuration: Configuration;
	additionalDropdownConfigurationInput: AdditionalDropdownConfigurationInput;
	answer?: SchemaAssessmentAnswer;
	print?: boolean;
	unsavedChangesAlert?: boolean;
};

export function AssessmentMedicationForm({
	question,
	patientId,
	answer,
	readOnly,
	configuration,
	additionalDropdownConfigurationInput,
	unsavedChangesAlert,
}: Props) {
	const interactionsDrawer = useDialogState();
	const resolvedAnswer = migrateOldFormatResolve(answer);

	const patientQuery = api.patient.getById.useQuery({ id: patientId, includes: {} });
	const session = useSession();
	const alert = useAlert();
	const trpcUtils = trpc.useUtils();

	const isCaseManager = patientQuery.data?.SOCVisitCaseManagerId === session.data?.user.id;
	const assessmentHook = useAssessmentQuestion(question, patientId, resolvedAnswer, answer, false, undefined, {
		onSuccess: (data: RouterOutputs['assessment']['assessmentCheck']) => {
			if (!data) return;

			const interactions = (data.checkedResponse as AssessmentMedicationSchema).interactions;

			if (isCaseManager && interactions?.data.length && !interactions?.verified) {
				interactionsDrawer.open();
			}
		},
	});
	const { control, handleSubmit, onError, onSubmit, getValues, setValue, isLoading, reset } = assessmentHook;

	const verifyInteractions = api.assessment.verifyMedicationInteractionsAssessment.useMutation({
		onSuccess: () => {
			void trpcUtils.assessment.getAllAssessmentQuestionsForPatient.invalidate({ patientId });
			void trpcUtils.assessment.getAssessmentQuestionForPatient.invalidate({ patientId });
		},
		onError: (error) => {
			console.error('Error verifying medication interactions', error);
			alert.addErrorAlert({
				message: 'Error verifying medication interactions - ' + error.message,
			});
		},
	});

	const { fields, append, remove } = useFieldArray({
		control,
		name: 'checkedResponse.choice.medications',
	});

	useUnsavedInputAlert({
		enabled: !readOnly && unsavedChangesAlert && assessmentHook.valueHasBeenEdited,
		message:
			'You have unsaved changes, are you sure you want to leave? To save these changes, click the "Confirm" button at the bottom of the medication list.',
	});

	useEffect(() => {
		reset({ ...getValues(), checkedResponse: resolvedAnswer });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [JSON.stringify(resolvedAnswer)]);

	const handleAddForm = () => {
		append({
			configurationType: configuration.configurationType,
			// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
			startDate: patientQuery.data?.SOCVisitDate!,
		} as MedicationSchema);
	};

	const handleRemoveForm = (index: number) => {
		remove(index);
	};

	if (patientQuery.isLoading) {
		return <LoadingSpinner />;
	}

	const interactions = (answer?.checkedResponse as unknown as AssessmentMedicationSchema)?.interactions;
	const interactionsNeedVerification = Boolean(isCaseManager && interactions?.data.length && !interactions?.verified);
	const hasUnsavedChanges = assessmentHook.valueHasBeenEdited || interactionsNeedVerification;
	const showConfirmBanner = hasUnsavedChanges || !assessmentHook.hasAcceptedValue;

	return (
		<>
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
				loadingText={
					"Preparing Medication list now. Please wait, you'll be able to review and edit the list soon. This is required in order to draft the documentation."
				}
				hasValue={assessmentHook.hasValue}
				hasError={assessmentHook.hasError}
				onRetrySuggestion={() => null}
				hasAcceptedValue={assessmentHook.hasAcceptedValue}
				valueHasBeenEdited={hasUnsavedChanges}
				readOnly={readOnly}
			>
				<If condition={!assessmentHook.hasAcceptedValue && assessmentHook.hasError}>
					<Stack alignItems={'start'} spacing={2} sx={{ marginY: '1em' }}>
						<Alert severity="error" icon={false} sx={{ width: '100%' }}>
							<Typography variant="body1">
								We were unable to extract the patient&apos;s medication list. Please enter the
								patient&apos;s medications manually.
							</Typography>
						</Alert>
					</Stack>
				</If>
				<If condition={!assessmentHook.isLoadingGuess && !fields.length}>
					<Stack alignItems={'start'} spacing={2}>
						<Alert
							severity={assessmentHook.hasAcceptedValue ? 'success' : 'warning'}
							icon={false}
							sx={{ width: '100%' }}
						>
							<Typography variant={'body1'}>No medications added</Typography>
						</Alert>
						<AddAndRemoveButtons
							shouldShowRemove={false}
							addText="Add Medication"
							handleAdd={() => handleAddForm()}
							shouldShowAdd={!assessmentHook.isLoadingGuess}
							readOnly={readOnly}
						/>
					</Stack>
				</If>
				<Stack>
					<If condition={showConfirmBanner}>
						<Box mb={3}>
							<Alert severity="info" icon={false}>
								Please review and confirm medication list to generate interactions.
							</Alert>
						</Box>
					</If>
					<If condition={!showConfirmBanner && !!fields.length}>
						<Box mb={3}>
							<InteractionsBanner
								interactions={interactions}
								onAction={interactionsDrawer.open}
								hideIcon
							/>
						</Box>
					</If>
					{fields.map((field, index) => {
						const isLastItem = index === fields.length - 1;
						return (
							<Fragment key={field.id}>
								<Grid container spacing={2}>
									<MedicationForm
										control={control}
										index={index}
										isLoading={isLoading}
										readOnly={readOnly}
										getValues={getValues}
										setValue={setValue}
									/>
								</Grid>
								<Box mt={3} mb={isLastItem ? 1 : 4}>
									<AddAndRemoveButtons
										handleRemove={() => handleRemoveForm(index)}
										handleAdd={() => handleAddForm()}
										shouldShowAdd={isLastItem}
										readOnly={readOnly}
										addText="Add Medication"
									/>
								</Box>
							</Fragment>
						);
					})}
				</Stack>
			</QuestionWrapper>
			<InteractionsDrawer
				open={interactionsDrawer.isOpen}
				onVerify={() => {
					verifyInteractions.mutate({ patientId });
					interactionsDrawer.close();
				}}
				onClose={interactionsDrawer.close}
				interactions={interactions}
				isCaseManager={isCaseManager}
			/>
		</>
	);
}
