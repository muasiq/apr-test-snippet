import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import { useShallowRouterQuery } from '~/common/hooks/useShallowRouterQuery';
import { PatientWithJoins } from '../../../../../../server/api/routers/patient/patient.types';
import { BackForward } from '../../../InterviewQuestion/components/AnswerQuestion/BackForward';
import { isSectionConfirmedByNurse } from '../../common/util/assessmentUtil';

type Props = {
	isLoadingAssessmentSectionConfirm: boolean;
	handleCompleteOrEditSection: (section: string) => void;
	currentGroup: { heading: string };
	patientData: PatientWithJoins;
	currentStep: number;
	totalSteps: number;
	incrementStep: () => void;
	decrementStep: () => void;
	bottomAssessmentRef: React.RefObject<HTMLDivElement>;
	allQuestionsAnswered: boolean;
};

export const FieldAppConfirmSectionButton = ({
	currentGroup,
	handleCompleteOrEditSection,
	isLoadingAssessmentSectionConfirm,
	patientData,
	currentStep,
	totalSteps,
	incrementStep,
	decrementStep,
	bottomAssessmentRef,
	allQuestionsAnswered,
}: Props) => {
	const [isBottomVisible, setIsBottomVisible] = useState(false);
	const { push } = useShallowRouterQuery();

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				const [entry] = entries;
				entry && setIsBottomVisible(entry.isIntersecting);
			},
			{ threshold: 0.1 },
		);

		const currentRef = bottomAssessmentRef.current;

		if (currentRef) {
			observer.observe(currentRef);
		}

		return () => {
			if (currentRef) {
				observer.unobserve(currentRef);
			}
		};
	}, [bottomAssessmentRef]);

	const isSectionCompleted = isSectionConfirmedByNurse(
		currentGroup.heading,
		patientData.NurseConfirmedAssessmentSections,
	);

	const alreadyConfirmedSection = isSectionCompleted && !isLoadingAssessmentSectionConfirm;
	const forwardEnabled = allQuestionsAnswered && (isBottomVisible || alreadyConfirmedSection);
	const backDisabled = currentStep === 1;
	function handleBack() {
		decrementStep();
	}

	function handleForward() {
		if (!isSectionCompleted) {
			handleCompleteOrEditSection(currentGroup.heading);
		}
		if (currentStep === totalSteps) {
			push({ confirmSignOff: true });
		}
		incrementStep();
	}

	return (
		<Box
			px={3}
			py={3}
			borderRadius={'16px 16px 0 0'}
			minHeight={'72px'}
			boxShadow={
				'0px 2px 4px -1px rgba(0, 0, 0, 0.20), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12);'
			}
		>
			<BackForward
				onBack={handleBack}
				onForward={handleForward}
				forwardDisabled={!forwardEnabled}
				backDisabled={backDisabled}
			/>
		</Box>
	);
};
