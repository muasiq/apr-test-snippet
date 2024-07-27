import { useCallback, useEffect, useState } from 'react';
import { useInterval } from 'usehooks-ts';
import { RecorderStatus } from './useAudioRecorder';

const VOLUME_TOO_LOW_THRESHOLD = 3;
const AUDIO_CHECK_INTERVAL = 100;
const LENGTH_OF_AUDIO_CHECK_SECONDS = 10;

type Props = {
	recordingTime: number;
	status: RecorderStatus;
	mediaRecorder?: MediaRecorder;
	onFailedAudioQualityCheck: (average: number) => void;
};
export function useBadAudioQuality({ recordingTime, status, mediaRecorder, onFailedAudioQualityCheck }: Props) {
	const [analyser, setAnalyser] = useState<AnalyserNode>();
	const [passedAudioQualityCheck, setPassedAudioQualityCheck] = useState<boolean | null>(null);

	useEffect(() => {
		if (!mediaRecorder?.stream) return;
		const newAudioContext = new AudioContext();
		const source = newAudioContext.createMediaStreamSource(mediaRecorder.stream);
		const newAnalyser = newAudioContext.createAnalyser();
		source.connect(newAnalyser);
		newAnalyser.fftSize = 512;
		setPassedAudioQualityCheck(null);
		setAnalyser(newAnalyser);

		return () => {
			newAudioContext
				?.close()
				.then(() => {
					setAnalyser(undefined);
					setPassedAudioQualityCheck(null);
				})
				.catch(console.error);
		};
	}, [mediaRecorder?.stream]);

	const intervalCallback = useCallback(() => {
		if (!analyser) return;
		const bufferLength = analyser.frequencyBinCount;
		const dataArray = new Uint8Array(bufferLength);
		analyser.getByteFrequencyData(dataArray);
		const sum = dataArray.reduce((a, b) => a + b, 0);
		const average = sum / bufferLength;

		console.log('Audio quality check average', average);
		const passed = average >= VOLUME_TOO_LOW_THRESHOLD;
		if (passed) {
			setPassedAudioQualityCheck(true);
		}
		if (recordingTime >= LENGTH_OF_AUDIO_CHECK_SECONDS) {
			setPassedAudioQualityCheck(false);
			onFailedAudioQualityCheck(average);
		}
	}, [analyser, onFailedAudioQualityCheck, recordingTime]);

	useInterval(
		intervalCallback,
		status === 'recording' && passedAudioQualityCheck === null ? AUDIO_CHECK_INTERVAL : null,
	);
}
