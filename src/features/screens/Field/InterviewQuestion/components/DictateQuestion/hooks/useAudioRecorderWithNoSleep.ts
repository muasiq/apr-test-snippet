import { useCallback } from 'react';
import { useNoSleep } from '~/common/hooks/useNoSleep';
import useAudioRecorder from './useAudioRecorder';

export function useAudioRecorderWithNoSleep(props: Parameters<typeof useAudioRecorder>[0]) {
	const { enable: requestLock, disable: releaseLock } = useNoSleep();
	const audioRecorder = useAudioRecorder(props);

	const stopRecording = useCallback(() => {
		releaseLock();
		return audioRecorder.stopRecording();
	}, [audioRecorder, releaseLock]);

	const startRecording = useCallback(() => {
		requestLock();
		audioRecorder.startRecording();
	}, [audioRecorder, requestLock]);

	return { ...audioRecorder, stopRecording, startRecording };
}
