import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { useMixpanel } from '~/features/ui/layouts/Mixpanel/useMixpanel';
import { NurseInterviewQuestion } from '../../../../../assessments/nurse-interview/questions';
import { PatientWithJoins } from '../../../../../server/api/routers/patient/patient.types';
import { useEnsurePhysicalAssessmentThemes } from '../common/hooks/useEnsurePhysicalAssessmentThemes';
import { useQuestionResponseStatus } from '../common/hooks/useQuestionResponseStatus';
import { InterviewState } from '../common/interviewState';
import { getResolvedQuestion } from '../common/utils/mainInterviewUtil';
import { TextQuestion } from './AnswerQuestion/TextQuestion';
import { DictateQuestion } from './DictateQuestion';
import { saveInterviewQuestion } from './SyncInterviewQuestions';

type Props = {
	patientData: PatientWithJoins;
	onBack: () => void;
	onNext: () => void;
	filteredInterview: NurseInterviewQuestion[];
};

export const AnswerQuestion = ({ patientData, onBack, onNext, filteredInterview }: Props): JSX.Element => {
	const mixpanel = useMixpanel();
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	useEnsurePhysicalAssessmentThemes(patientData);
	const { patientId, questionShortLabel, dictate, currentWoundNumber } = router.query as {
		patientId: string;
		questionShortLabel?: string;
		dictate?: string;
		interviewState: InterviewState;
		currentWoundNumber: string;
	};

	const currentQuestion = filteredInterview.find((question) => question.shortLabel === questionShortLabel);
	const isDictate = dictate === 'true';
	const resolvedQuestion = useMemo(
		() => getResolvedQuestion(questionShortLabel, Number(currentWoundNumber), currentQuestion),
		[questionShortLabel, currentWoundNumber, currentQuestion],
	);
	const resolvedLabel = resolvedQuestion.multiShortLabel ?? resolvedQuestion.shortLabel;

	const { textResponse, setTextResponse, hasSavedAudioResponse } = useQuestionResponseStatus({
		patientData,
		questionShortLabel: resolvedLabel,
		dictate,
	});

	const shortLabel = resolvedQuestion.multiShortLabel ?? resolvedQuestion.shortLabel;
	const saveResponse = async (blob?: Blob) => {
		setIsLoading(true);
		await saveInterviewQuestion({
			patientId: Number(patientId),
			group: resolvedQuestion.group,
			interviewQuestionShortLabel: shortLabel,
			interviewQuestionTheme: resolvedQuestion.theme,
			question: resolvedQuestion.question,
			textResponse,
			...(blob?.size && { audioRecording: blob }),
			attemptsToSend: 0,
		});
		setIsLoading(false);
	};

	const sharedProps = {
		handleNextButtonClick: () => {
			mixpanel?.track('Nurse Interview Next', { question: shortLabel, patientId, dictate });
			onNext();
		},
		handlePreviousButtonClick: onBack,
		filteredInterview,
		questionShortLabel,
		currentWoundNumber,
		currentQuestion,
		isLoading,
		saveResponse,
	};

	if (isDictate) {
		return (
			<DictateQuestion
				{...sharedProps}
				hasTextResponse={!!textResponse}
				hasSavedAudioResponse={hasSavedAudioResponse}
			/>
		);
	}

	return (
		<TextQuestion
			{...sharedProps}
			hasAudioResponse={!!hasSavedAudioResponse}
			textResponse={textResponse}
			setTextResponse={setTextResponse}
		/>
	);
};
