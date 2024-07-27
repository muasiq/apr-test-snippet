import { Box, Stack } from '@mui/material';
import { useRef, useState } from 'react';
import { LiveAudioVisualizer } from 'react-audio-visualize';
import { useEventListener } from 'usehooks-ts';
import { NurseInterviewQuestion } from '~/assessments/nurse-interview/questions';
import { delay } from '~/common/utils/delay';
import { FULL_HEIGHT_MINUS_NAVBAR } from '~/features/ui/layouts/TopNav';
import { useAlert } from '../../../../../../common/hooks/useAlert';
import theme from '../../../../../../styles/theme';
import { QuestionDetails } from '../AnswerQuestion/QuestionDetails';
import { QuestionThemeAndProgressHeader } from '../AnswerQuestion/QuestionThemAndProgressHeader';
import { AudioQualityCheck } from './components/AudioQualityCheck';
import { DictationActionAlertRenderer } from './components/DictationActionAlertRenderer';
import { DictationActionButton } from './components/DictationActionButton';
import { DictationBackButton } from './components/DictationBackButton';
import { DictationNextButton } from './components/DictationNextButton';
import { useAudioRecorderWithNoSleep } from './hooks/useAudioRecorderWithNoSleep';
import { useNotAllowedOrFound } from './hooks/useNotAllowedOrFound';
import { audioTrackConstraints } from './util/constants';

const MIN_RECORDING_TIME = process.env.NODE_ENV === 'production' ? 2 : 0;

type AudioActions = 'backButton' | 'forwardButton';

export type AudioRecording = {
	blob: Blob;
	audioUrl: string;
};

const alertMessage = {
	backButton: {
		title: 'Cannot go back',
		message: 'Cannot go back step while recording',
	},
	forwardButton: {
		title: 'Cannot increment step',
		message: 'Cannot increment step while recording',
	},
};

type Props = {
	hasTextResponse: boolean;
	handleNextButtonClick: (blob?: Blob) => void;
	handlePreviousButtonClick: (blob?: Blob) => void;
	hasSavedAudioResponse: boolean;
	isLoading: boolean;
	filteredInterview: NurseInterviewQuestion[];
	questionShortLabel: string | undefined;
	currentWoundNumber: string;
	currentQuestion: NurseInterviewQuestion | undefined;
	saveResponse: (blob: Blob) => Promise<void>;
};

export const DictateQuestion = ({
	hasTextResponse,
	handleNextButtonClick,
	handlePreviousButtonClick,
	hasSavedAudioResponse: hasSavedAudioResponseProp,
	isLoading,
	currentWoundNumber,
	filteredInterview,
	questionShortLabel,
	currentQuestion,
	saveResponse,
}: Props) => {
	const documentRef = useRef<Document>(document);
	const alert = useAlert();
	const [savingAudioAction, setSavingAudioAction] = useState<AudioActions>();
	const [successAudioAction, setSuccessAudioAction] = useState<AudioActions>();
	const [isDeleted, setIsDeleted] = useState(false);

	const onNotAllowedOrFound = useNotAllowedOrFound();
	const { status, recordingTime, startRecording, stopRecording, togglePauseResume, mediaRecorder } =
		useAudioRecorderWithNoSleep({ audioTrackConstraints, onNotAllowedOrFound });

	const isRecording = status === 'recording';
	const isPaused = status === 'paused';
	const isSuccess = !!successAudioAction;
	const isSaving = !!savingAudioAction;

	const hasSavedAudioResponse = hasSavedAudioResponseProp && !isDeleted;
	const isReady = !(isLoading || isSaving || isSuccess || hasSavedAudioResponse || hasTextResponse);
	const canStart = isReady && (status === 'idle' || status === 'paused' || status === 'stopped');
	const canStop = isReady && status === 'recording' && recordingTime >= MIN_RECORDING_TIME;

	const onVisibilityChange = () => {
		if (document.hidden) {
			if (isRecording || isPaused) {
				void stopRecording();
			}
		}
	};
	useEventListener('visibilitychange', onVisibilityChange, documentRef);

	function handleDictationActionButtonClick() {
		if (!canStart && !canStop) return;

		if (isRecording || isPaused) {
			togglePauseResume();
		} else {
			startRecording();
		}
	}

	const isPageChanging = useRef<boolean>();
	const handlePageChange = (action: AudioActions) => async () => {
		if (isPageChanging.current) return;
		if (isRecording && !isPaused) {
			alert.addErrorAlert(alertMessage[action]);
			console.error('Cannot change page while recording', { action });
			return;
		}

		isPageChanging.current = true;
		if (isPaused) {
			try {
				setSavingAudioAction(action);

				const blob = await stopRecording();
				if (!blob.size) {
					alert.addErrorAlert({
						title: 'Audio Recording Problem',
						message: `Sorry, there was a problem with your audio recording. Please try again. Often this happens when you switch between apps while recording.`,
					});
					console.error(`Recording blob size is ${blob?.size}`, blob);
					return;
				}

				await saveResponse(blob);
				setSavingAudioAction(undefined);
				await setSuccess(action);
			} catch (error) {
				console.error('error saving interview question', { error, action });
			}
		}

		const handler = {
			backButton: handlePreviousButtonClick,
			forwardButton: handleNextButtonClick,
		}[action];

		isPageChanging.current = false;
		handler();
	};

	async function setSuccess(action: AudioActions) {
		setSuccessAudioAction(action);
		await delay(1500);
		setSuccessAudioAction(undefined);
	}

	return (
		<Box height={FULL_HEIGHT_MINUS_NAVBAR} flexDirection={'column'} display={'flex'}>
			<Box
				flexGrow={1}
				overflow={'auto'}
				sx={{
					scrollbarWidth: 'none',
					msOverflowStyle: 'none',
				}}
			>
				<DictationActionAlertRenderer
					isRecording={isRecording}
					isPaused={isPaused}
					recordingTime={recordingTime}
					hasSavedAudioResponse={hasSavedAudioResponse}
					onDelete={() => {
						if (isPaused) {
							void stopRecording();
						} else {
							setIsDeleted(true);
						}
					}}
				/>
				<Box px={3} pt={4}>
					<QuestionThemeAndProgressHeader
						currentInterview={filteredInterview}
						currentShortLabel={questionShortLabel}
					/>

					<QuestionDetails
						currentQuestion={currentQuestion}
						currentWoundNumber={currentWoundNumber}
						questionShortLabel={questionShortLabel}
					/>
				</Box>
				<Box height={50} /> {/* Spacer */}
			</Box>
			<Stack
				position={'sticky'}
				mt={-4.5}
				bottom={20}
				width={'100%'}
				textAlign={'center'}
				alignItems={'center'}
				justifyContent={'center'}
				zIndex={2}
				spacing={3}
				direction={'row'}
				left={0}
			>
				<DictationBackButton
					disabled={isLoading || isSuccess || isSaving}
					isVisible={!isRecording || isPaused}
					onClick={handlePageChange('backButton')}
					isSuccess={successAudioAction === 'backButton'}
					isLoading={savingAudioAction === 'backButton'}
				/>
				<DictationActionButton
					hasTextResponse={hasTextResponse}
					disabled={!(canStart || canStop)}
					onClick={handleDictationActionButtonClick}
					status={status}
				/>
				<DictationNextButton
					disabled={isLoading || isSuccess || isSaving}
					isVisible={isPaused || !isReady}
					onClick={handlePageChange('forwardButton')}
					isSuccess={successAudioAction === 'forwardButton'}
					isLoading={savingAudioAction === 'forwardButton'}
				/>
			</Stack>
			<Box
				sx={{ position: 'fixed', bottom: 0, height: '72px', left: 0, right: 0 }}
				zIndex={1}
				boxShadow={
					'0px 2px 4px -1px rgba(0, 0, 0, 0.20), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12);'
				}
				borderRadius={'16px 16px 0px 0px;'}
				bgcolor={'#FFF'}
			>
				{mediaRecorder && (
					<LiveAudioVisualizer
						width={window.innerWidth}
						gap={1}
						barWidth={4}
						mediaRecorder={mediaRecorder}
						barColor={theme.palette.secondary.light}
						fftSize={512}
						maxDecibels={-10}
						minDecibels={-80}
						smoothingTimeConstant={0.4}
						height={'auto'}
					/>
				)}
			</Box>
			<AudioQualityCheck
				status={status}
				mediaRecorder={mediaRecorder}
				stopRecording={stopRecording}
				recordingTime={recordingTime}
			/>
		</Box>
	);
};
