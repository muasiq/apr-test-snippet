import { isBefore, subMinutes } from 'date-fns';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAlert } from '~/common/hooks/useAlert';
import { api } from '~/common/utils/api';
import { useLowConfidenceStore } from '../../../common/hooks/useLowConfidenceStore';
import { InterviewState } from '../../../common/interviewState';

const LOW_CONFIDENCE_REFETCH_INTERVAL_SECONDS = 5000;

export const useDisplayLowConfidenceAudio = (isRecording: boolean, isBadAudioDialogOpen: boolean) => {
	const alert = useAlert();
	const router = useRouter();
	const { lastShownLowConfidenceAlert, setLastShownLowConfidenceAlert } = useLowConfidenceStore();
	const { patientId, interviewState } = router.query as { patientId?: string; interviewState?: InterviewState };

	const { data: displayLowConfidenceData } = api.interviewQuestion.shouldDisplayLowConfidenceTranscribedText.useQuery(
		{
			patientId: Number(patientId),
		},
		{
			enabled: Boolean(patientId) && interviewState === InterviewState.MAIN_INTERVIEW,
			refetchInterval: (data) => {
				if (interviewState !== InterviewState.MAIN_INTERVIEW) return false;
				if (data?.acknowledged) return false;
				return LOW_CONFIDENCE_REFETCH_INTERVAL_SECONDS;
			},
		},
	);

	useEffect(() => {
		if (displayLowConfidenceData?.shouldShowWarning && !isRecording && !isBadAudioDialogOpen) {
			const alertedRecently =
				lastShownLowConfidenceAlert && isBefore(subMinutes(new Date(), 5), lastShownLowConfidenceAlert);
			if (alertedRecently) return;
			setLastShownLowConfidenceAlert(new Date());
			alert.addAlert({
				title: 'Recent Audio Recording Warning',
				message:
					'One of your recent audio recordings indicated your background noise may be too loud. Please ensure you are not in a noisy environment.',
				severity: 'info',
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [displayLowConfidenceData, isBadAudioDialogOpen, isRecording, lastShownLowConfidenceAlert]);
};
