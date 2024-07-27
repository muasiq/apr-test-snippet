import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Box, Button, Divider, Slide, Stack, Typography } from '@mui/material';
import { PatientStatus } from '@prisma/client';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import {
	allRelevantQuestionsForPatientHaveConfirmedAnswers,
	pageHeadingHasAllRelevantQuestionsConfirmed,
	questionsThatDoNotHaveConfirmedAnswers,
} from '~/assessments/util/assessmentStateUtils';
import { useShallowRouterQuery } from '~/common/hooks/useShallowRouterQuery';
import { trpc } from '~/common/utils/trpc';
import { OpenCloseQAButton } from '~/features/screens/Office/PatientDetail/OpenCloseQAButton';
import { FULL_HEIGHT_MINUS_NAVBAR } from '~/features/ui/layouts/TopNav';
import { useAlert } from '../../../../../../common/hooks/useAlert';
import { useConfiguration } from '../../../../../../common/hooks/useConfiguration';
import { useUnsavedInputAlert } from '../../../../../../common/hooks/useUnsavedInputAlert';
import { RouterOutputs, api } from '../../../../../../common/utils/api';
import { PatientWithJoins } from '../../../../../../server/api/routers/patient/patient.types';
import { UnicornButton } from '../../../../../ui/buttons/UnicornButton';
import { LoadingSpinner } from '../../../../../ui/loading/LoadingSpinner';
import {
	getAllAssessmentGroupsOrderedForPatient,
	shouldDisableAssessmentSubHeadingsOrSubGroups,
} from '../../common/util/assessmentUtil';
import { BackOfficeSubmitForReviewButton } from './BackOfficeSubmitForReviewButton';
import { FieldAppConfirmSectionButton } from './FieldAppConfirmSectionButton';
import { LockedAssessmentAlert } from './LockedAssessmentAlert';
import { SubHeadingsOrSubGroups } from './SubHeadingsOrSubGroups';
import { useAssessmentStatus } from './hooks/useAssessmentStatus';

type Props = {
	assessmentQuestionsForPatient: RouterOutputs['assessment']['getAllAssessmentQuestionsForPatient'] | undefined;
	isLoadingAssessmentData: boolean;
	patientData: PatientWithJoins;
	isLoadingPatientData: boolean;
};
export const Assessment = ({
	assessmentQuestionsForPatient,
	isLoadingAssessmentData,
	isLoadingPatientData,
	patientData,
}: Props) => {
	const { configuration } = useConfiguration();
	const router = useRouter();
	const alert = useAlert();
	const utils = trpc.useUtils();
	const { push } = useShallowRouterQuery();
	const { hasUnconfirmed, setPatientData, setCurrentGroup, setIsReadonly, clearQuestionStates } =
		useAssessmentStatus();
	useUnsavedInputAlert({
		enabled: hasUnconfirmed,
		onConfirm: clearQuestionStates,
	});
	const bottomAssessmentRef = useRef(null);
	const signoffBoxRef = useRef<HTMLDivElement>(null);

	const additionalConfigQuery = api.organization.getAdditionalDropdownConfiguration.useQuery();

	const confirmAssessmentSection = api.patient.confirmAssessmentSectionByPatientId.useMutation({
		onSuccess: async () => {
			await utils.patient.getById.invalidate();
		},
		onError: (error) => {
			alert.addErrorAlert({ title: 'Error completing section', message: error.message });
		},
	});

	const unicornButtonMutation = api.assessment.unicornButton.useMutation({
		onSuccess: (data) => {
			void utils.assessment.getAllAssessmentQuestionsForPatient.invalidate({ patientId: patientData.id });
			alert.addSuccessAlert({ message: `Applied Unicorn Magic to ${data.updatedCount} items` });
		},
		onError: (error) => {
			alert.addErrorAlert({ message: error.message });
		},
	});

	const { step } = router.query as { step: string };
	const isFieldAppView = router.pathname.startsWith('/field');

	const allGroupsOrdered = getAllAssessmentGroupsOrderedForPatient(patientData, configuration);

	const currentStep = Number(step);
	const totalSteps = allGroupsOrdered.length;
	const onLastPage = currentStep === totalSteps;

	const currentGroup = allGroupsOrdered[currentStep - 1] ?? getDefaultGroup();

	const allQuestionsCompleted = configuration
		? allRelevantQuestionsForPatientHaveConfirmedAnswers({
				configuration,
				patient: patientData,
				answers: assessmentQuestionsForPatient ?? [],
			})
		: false;

	if (onLastPage && !allQuestionsCompleted && configuration && assessmentQuestionsForPatient) {
		const remainingToBeAnswered = questionsThatDoNotHaveConfirmedAnswers({
			configuration,
			patient: patientData,
			answers: assessmentQuestionsForPatient,
		});
		console.log(remainingToBeAnswered);
	}

	const assessmentReadOnly = shouldDisableAssessmentSubHeadingsOrSubGroups(isFieldAppView, patientData);

	const allQuestionsConfirmedForPage =
		configuration && currentGroup
			? pageHeadingHasAllRelevantQuestionsConfirmed(currentGroup.heading, {
					patient: patientData,
					answers: assessmentQuestionsForPatient ?? [],
					configuration,
				})
			: false;

	useEffect(() => {
		setPatientData(patientData);
		if (currentGroup) {
			setCurrentGroup(currentGroup);
		}
		setIsReadonly(assessmentReadOnly);
	}, [currentGroup, patientData, assessmentReadOnly, setPatientData, setCurrentGroup, setIsReadonly]);

	useEffect(() => {
		signoffBoxRef.current?.scrollTo({ top: 0 });
	}, [currentStep]);

	function getDefaultGroup() {
		if (!allGroupsOrdered.length) return;
		push({ step: 1 });
		return allGroupsOrdered[0]!;
	}

	async function handleCompleteOrEditSection(section: string) {
		return await confirmAssessmentSection.mutateAsync({ patientId: patientData.id, section });
	}

	function handleNextStep() {
		if (onLastPage) return;
		push({ step: currentStep + 1 });
	}

	function handlePreviousStep() {
		if (currentStep === 1) return;
		push({ step: currentStep - 1 });
	}

	async function handleUnicornButtonClick() {
		await unicornButtonMutation.mutateAsync({ patientId: patientData.id });
	}

	if (
		isLoadingAssessmentData ||
		isLoadingPatientData ||
		!assessmentQuestionsForPatient ||
		!configuration ||
		!currentGroup ||
		additionalConfigQuery.isLoading
	) {
		return <LoadingSpinner />;
	}

	return (
		<Box display={'flex'} flexDirection={'column'} height={FULL_HEIGHT_MINUS_NAVBAR}>
			<Box overflow={'auto'} ref={signoffBoxRef} data-cy="sign-off-box">
				{!isFieldAppView && (
					<Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} p={2}>
						<Typography variant="h5">Final Documentation</Typography>
						<Box>
							<OpenCloseQAButton
								patientStatus={patientData.status}
								assessmentQuestionsForPatient={assessmentQuestionsForPatient}
							/>
							<UnicornButton
								disabled={allQuestionsConfirmedForPage || unicornButtonMutation.isLoading}
								onClick={handleUnicornButtonClick}
							/>
						</Box>
					</Stack>
				)}
				<Box>
					<Divider />
				</Box>
				{isFieldAppView ? (
					<Stack px={2} pt={4} direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
						<Typography variant="h6" color={'primary'}>
							Sign Off
						</Typography>
						<Typography variant="h6" color={'primary'}>
							{currentStep} of {totalSteps}
						</Typography>
					</Stack>
				) : (
					<Stack p={2} direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
						<Button startIcon={<ChevronLeft />} onClick={handlePreviousStep} disabled={currentStep === 1}>
							Back
						</Button>
						<Typography variant="body2">
							{currentStep} / {totalSteps}
						</Typography>
						<Button
							data-cy="qa-next-button"
							endIcon={<ChevronRight />}
							disabled={!allQuestionsConfirmedForPage || onLastPage}
							onClick={handleNextStep}
						>
							Next
						</Button>
					</Stack>
				)}
				{patientData?.status === PatientStatus.SignoffNeeded && !isFieldAppView && <LockedAssessmentAlert />}
				<Box p={2}>
					<Typography variant="h5">{currentGroup.heading}</Typography>
				</Box>

				<Box flexGrow={1} p={2}>
					<SubHeadingsOrSubGroups
						configuration={configuration}
						additionalDropdownConfigurationInput={additionalConfigQuery.data!}
						group={currentGroup}
						assessmentQuestionsForPatient={assessmentQuestionsForPatient}
						patientId={patientData.id}
						patientData={patientData}
						readOnly={assessmentReadOnly}
					/>
					<Box ref={bottomAssessmentRef} height={'25px'} />
				</Box>
				<Slide
					direction="up"
					in={patientData?.status === PatientStatus.WithQA && allQuestionsCompleted && !isFieldAppView}
					unmountOnExit
				>
					<Box>
						<BackOfficeSubmitForReviewButton
							allQuestionsCompleted={allQuestionsCompleted}
							isLoadingPatientData={isLoadingPatientData}
							patientData={patientData}
						/>
					</Box>
				</Slide>
			</Box>

			{patientData?.status === PatientStatus.SignoffNeeded && isFieldAppView && (
				<>
					<FieldAppConfirmSectionButton
						currentGroup={currentGroup}
						handleCompleteOrEditSection={handleCompleteOrEditSection}
						isLoadingAssessmentSectionConfirm={confirmAssessmentSection.isLoading}
						patientData={patientData}
						currentStep={currentStep}
						totalSteps={totalSteps}
						incrementStep={handleNextStep}
						decrementStep={handlePreviousStep}
						bottomAssessmentRef={bottomAssessmentRef}
						allQuestionsAnswered={allQuestionsConfirmedForPage}
					/>
				</>
			)}
		</Box>
	);
};
