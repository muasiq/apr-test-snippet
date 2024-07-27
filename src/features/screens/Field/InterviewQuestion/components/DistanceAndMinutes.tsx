import { Stack, Typography } from '@mui/material';
import { PatientArtifactTag, PatientStatus } from '@prisma/client';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { api } from '~/common/utils/api';
import { SaveNurseInterviewSOCQuestionInput } from '~/server/api/routers/interviewQuestion/interviewQuestion.inputs';
import { useShallowRouterQuery } from '../../../../../common/hooks/useShallowRouterQuery';
import { PatientWithJoins } from '../../../../../server/api/routers/patient/patient.types';
import { SliderWithInput } from '../../../../ui/inputs/SliderWithInput';
import { FULL_HEIGHT_MINUS_NAVBAR } from '../../../../ui/layouts/TopNav';
import { InterviewState, SliderQuestions, sliderQuestions } from '../common/interviewState';
import { BackForward } from './AnswerQuestion/BackForward';
import { saveInterviewSetupQuestion } from './SyncInterviewSetupQuestions';

type Props = {
	patientData: PatientWithJoins;
};
export const DistanceAndMinutes = ({ patientData }: Props): JSX.Element => {
	const router = useRouter();
	const { patientId, currentQuestion } = router.query as {
		patientId: string;
		currentQuestion?: SliderQuestions;
	};
	const { push } = useShallowRouterQuery();
	const updatePatientStatus = api.patient.updatePatientStatus.useMutation();

	const initialSliderValues = sliderQuestions.map((question) => question.default);
	const [sliderValues, setSliderValues] = useState(initialSliderValues);

	const currentSliderQuestion = sliderQuestions.find((question) => question.id === currentQuestion);
	const currentSliderQuestionIndex = sliderQuestions.findIndex((question) => question.id === currentQuestion);
	const prevQuestionParam = currentSliderQuestion?.prevQuestionParam;

	const handleContinueClick = async () => {
		if (!currentSliderQuestion) return;

		const dataToUpdate: SaveNurseInterviewSOCQuestionInput = {
			patientId: Number(patientId),
			[currentSliderQuestion.id]: sliderValues[currentSliderQuestionIndex],
		};

		await saveInterviewSetupQuestion(dataToUpdate);

		if (patientData.status === PatientStatus.NewPatient) {
			updatePatientStatus.mutate({
				patientId: patientData.id,
				status: PatientStatus.Incomplete,
			});
		}

		if (currentSliderQuestion.nextQuestionParam.interviewState === InterviewState.PHOTO_UPLOAD_MEDICATION) {
			if (hasUploadedMedicationDocuments(patientData)) {
				push({ interviewState: InterviewState.PHOTO_UPLOAD_WOUNDS });
			} else {
				push(currentSliderQuestion.nextQuestionParam);
			}
		} else {
			push(currentSliderQuestion.nextQuestionParam);
		}
	};

	function hasUploadedMedicationDocuments(patientData: PatientWithJoins) {
		return patientData.PatientArtifacts.some((artifact) => {
			return (
				artifact.tagName === PatientArtifactTag.Medication ||
				(artifact.tagName === PatientArtifactTag.ReferralDocument &&
					artifact.patientDocumentArtifact?.relevantMedPages.length)
			);
		});
	}

	const handleBack = () => {
		if (!prevQuestionParam) {
			return;
		}
		push(prevQuestionParam);
	};

	const handleSliderChange = (newValue: number) => {
		setSliderValues((prev) => {
			const current = prev[currentSliderQuestionIndex];
			if (!current || !currentSliderQuestion) {
				return prev;
			}
			return { ...prev, [currentSliderQuestionIndex]: newValue };
		});
	};

	if (!currentSliderQuestion) return <Typography>Question not found</Typography>;

	return (
		<>
			<Stack p={5} height={FULL_HEIGHT_MINUS_NAVBAR} flexDirection={'column'} textAlign={'center'}>
				<Stack flexGrow={1} justifyContent={'center'} alignItems={'center'}>
					<Typography sx={{ textAlign: 'center' }} mb={2} variant="h4">
						{currentSliderQuestion.question}
					</Typography>
					<SliderWithInput
						value={sliderValues[currentSliderQuestionIndex]!}
						handleChange={handleSliderChange}
						min={currentSliderQuestion.min}
						max={currentSliderQuestion.max}
						defaultValue={currentSliderQuestion.default}
						incrementAmount={5}
					></SliderWithInput>
				</Stack>
				<BackForward backDisabled={!prevQuestionParam} onBack={handleBack} onForward={handleContinueClick} />
			</Stack>
		</>
	);
};
