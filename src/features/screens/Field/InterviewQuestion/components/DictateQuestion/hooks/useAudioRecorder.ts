// forked from https://github.com/samhirtarif/react-audio-recorder
import { useCallback, useEffect, useRef, useState } from 'react';

export interface RecorderControls {
	startRecording: () => void;
	stopRecording: () => Promise<Blob>;
	togglePauseResume: () => void;
	recordingTime: number;
	status: RecorderStatus;
	mediaRecorder?: MediaRecorder;
}

export type MediaAudioTrackConstraints = Pick<
	MediaTrackConstraints,
	| 'deviceId'
	| 'groupId'
	| 'autoGainControl'
	| 'channelCount'
	| 'echoCancellation'
	| 'noiseSuppression'
	| 'sampleRate'
	| 'sampleSize'
>;

export type RecorderStatus = 'idle' | 'loading' | 'recording' | 'paused' | 'stopped';

/**
 * @returns Controls for the recording. Details of returned controls are given below
 *
 * @param `audioTrackConstraints`: Takes a {@link https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackSettings#instance_properties_of_audio_tracks subset} of `MediaTrackConstraints` that apply to the audio track
 * @param `onNotAllowedOrFound`: A method that gets called when the getUserMedia promise is rejected. It receives the DOMException as its input.
 *
 * @details `startRecording`: Calling this method would result in the recording to start. Sets `isRecording` to true
 * @details `stopRecording`: This results in a recording in progress being stopped and the resulting audio being present in `recordingBlob`. Sets `isRecording` to false
 * @details `togglePauseResume`: Calling this method would pause the recording if it is currently running or resume if it is paused. Toggles the value `isPaused`
 * @details `isRecording`: A boolean value that represents whether a recording is currently in progress
 * @details `isPaused`: A boolean value that represents whether a recording in progress is paused
 * @details `recordingTime`: Number of seconds that the recording has gone on. This is updated every second
 * @details `mediaRecorder`: The current mediaRecorder in use
 */
const useAudioRecorder = ({
	audioTrackConstraints,
	onNotAllowedOrFound,
	mediaRecorderOptions,
}: {
	audioTrackConstraints?: MediaAudioTrackConstraints;
	onNotAllowedOrFound?: (exception: DOMException) => void;
	mediaRecorderOptions?: MediaRecorderOptions;
}): RecorderControls => {
	const [status, setStatus] = useState<RecorderStatus>('idle');
	const [recordingTime, setRecordingTime] = useState(0);
	const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder>();

	const timerInterval = useRef<NodeJS.Timeout>();

	const _startTimer = useCallback(() => {
		const interval = setInterval(() => {
			setRecordingTime((time) => time + 1);
		}, 1000);
		timerInterval.current = interval;
	}, []);

	const _stopTimer = useCallback(() => {
		if (timerInterval.current) {
			clearInterval(timerInterval.current);
		}
		timerInterval.current = undefined;
	}, []);

	/**
	 * Calling this method would result in the recording to start. Sets `isRecording` to true
	 */
	const startRecording = useCallback(() => {
		if (timerInterval.current) {
			console.error('Recording already in progress');
			return;
		}
		setStatus('loading');

		navigator.mediaDevices
			.getUserMedia({ audio: audioTrackConstraints ?? true })
			.then((stream) => {
				setStatus('recording');
				const recorder: MediaRecorder = new MediaRecorder(stream, mediaRecorderOptions);
				recorder.addEventListener('error', logErrorEvent);
				setMediaRecorder(recorder);
				recorder.start();
				_startTimer();
			})
			.catch((err: DOMException) => {
				setStatus('idle');
				_stopTimer();
				console.error('Error creating audio stream', err);
				onNotAllowedOrFound?.(err);
			});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [_startTimer, onNotAllowedOrFound, mediaRecorderOptions]);

	/**
	 * Calling this method results in a recording in progress being stopped and the resulting audio being present in `recordingBlob`. Sets `isRecording` to false
	 */
	const stopRecording = useCallback(() => {
		return new Promise<Blob>((resolve, reject) => {
			function onDataAvailable(event: BlobEvent) {
				removeListeners();
				const blob = event.data;
				cleanupMediaRecorderTracks(mediaRecorder);

				setMediaRecorder(undefined);
				resolve(blob);
			}

			function onError(event: Event) {
				console.error('Error while recording', event);
				removeListeners();
				reject(event);
			}

			function addListeners() {
				mediaRecorder?.addEventListener('dataavailable', onDataAvailable);
				mediaRecorder?.addEventListener('error', onError);
			}

			function removeListeners() {
				mediaRecorder?.removeEventListener('dataavailable', onDataAvailable);
				mediaRecorder?.removeEventListener('error', onError);
			}

			addListeners();
			mediaRecorder?.stop();
			_stopTimer();
			setRecordingTime(0);
			setStatus('stopped');
		});
	}, [mediaRecorder, _stopTimer]);

	/**
	 * Calling this method would pause the recording if it is currently running or resume if it is paused. Toggles the value `isPaused`
	 */
	const togglePauseResume = useCallback(() => {
		if (status === 'paused') {
			setStatus('recording');
			mediaRecorder?.resume();
			_startTimer();
		} else {
			setStatus('paused');
			_stopTimer();
			mediaRecorder?.pause();
		}
	}, [status, mediaRecorder, _startTimer, _stopTimer]);

	useEffect(() => {
		return () => {
			if (mediaRecorder && mediaRecorder?.state !== 'inactive') {
				mediaRecorder.stop();
				cleanupMediaRecorderTracks(mediaRecorder);
				mediaRecorder.removeEventListener('error', logErrorEvent);
				_stopTimer();
			}
		};
	}, [mediaRecorder, _stopTimer]);

	return {
		startRecording,
		stopRecording,
		togglePauseResume,
		recordingTime,
		status,
		mediaRecorder,
	};
};

function cleanupMediaRecorderTracks(mediaRecorder?: MediaRecorder) {
	mediaRecorder?.stream.getTracks().forEach((t) => t.stop());
}

function logErrorEvent(event: Event) {
	console.error('Error while recording', event);
}

export default useAudioRecorder;
