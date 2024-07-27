import { useCallback, useState } from 'react';
import { BadAudioDialog } from '~/features/screens/Field/InterviewQuestion/components/DictateQuestion/components/BadAudioDialog';
import { useMixpanel } from '~/features/ui/layouts/Mixpanel/useMixpanel';
import { If } from '~/features/ui/util/If';
import { RecorderControls } from '../hooks/useAudioRecorder';
import { useBadAudioQuality } from '../hooks/useBadAudioQuality';
import { useDisplayLowConfidenceAudio } from '../hooks/useDisplayLowConfidenceAudio';

type Props = Pick<RecorderControls, 'status' | 'mediaRecorder' | 'stopRecording' | 'recordingTime'>;

export function AudioQualityCheck({ recordingTime, status, mediaRecorder, stopRecording }: Props) {
	const [displayBadAudioDialog, setDisplayBadAudioDialog] = useState(false);
	const mixpanel = useMixpanel();

	const onFailedAudioQualityCheck = useCallback(
		(average: number) => {
			console.error('audio test failed');
			void stopRecording();
			setDisplayBadAudioDialog(true);
			mixpanel?.track('Audio Quality Check Failed', { average });
		},
		[stopRecording, mixpanel],
	);

	useBadAudioQuality({
		recordingTime,
		status,
		mediaRecorder,
		onFailedAudioQualityCheck,
	});

	const isActivelyRecording = status === 'recording';
	useDisplayLowConfidenceAudio(isActivelyRecording, displayBadAudioDialog);

	function handleCloseAudioTest() {
		setDisplayBadAudioDialog(false);
	}

	return (
		<If condition={displayBadAudioDialog}>
			<BadAudioDialog handleCloseDialog={handleCloseAudioTest} />
		</If>
	);
}
