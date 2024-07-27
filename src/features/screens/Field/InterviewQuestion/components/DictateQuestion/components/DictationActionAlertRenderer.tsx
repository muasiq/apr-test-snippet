import { CheckCircleOutline, ErrorOutline } from '@mui/icons-material';
import { useState } from 'react';
import { delay } from '~/common/utils/delay';
import { WaveformIcon } from '~/features/ui/icons/WaveformIcon';
import theme from '~/styles/theme';
import { DictationActionAlert } from './DictationActionAlert';

type Props = {
	isRecording: boolean;
	isPaused: boolean;
	recordingTime: number;
	hasSavedAudioResponse: boolean;
	onDelete: () => void;
};
export const DictationActionAlertRenderer = ({
	recordingTime,
	isRecording,
	isPaused,
	hasSavedAudioResponse,
	onDelete,
}: Props) => {
	const [displayDeleteAlert, setDisplayDeleteAlert] = useState(false);

	const recordingDuration = { minutes: Math.floor(recordingTime / 60), seconds: recordingTime % 60 };
	const formattedDuration = `${recordingDuration.minutes}:${String(recordingDuration.seconds).padStart(2, '0')}`;
	const shouldDisplaySavedAudioAlert = hasSavedAudioResponse && !isRecording && !isPaused;

	const handleDelete = async () => {
		onDelete();
		setDisplayDeleteAlert(true);
		await delay(3000);
		setDisplayDeleteAlert(false);
	};

	if (displayDeleteAlert && !isRecording) {
		return (
			<DictationActionAlert
				alertTitle="Recording Deleted"
				alertBody="Please record new notes"
				actionButtonText="Dismiss"
				icon={<ErrorOutline color="error" />}
				actionButtonClick={() => {
					setDisplayDeleteAlert(false);
				}}
				alertBackgroundColor={theme.palette.errorBackground}
				textColor={theme.palette.alertErrorTextColor}
				alertActionButtonColor={theme.palette.alertErrorTextColor}
			/>
		);
	}

	if (isPaused) {
		return (
			<DictationActionAlert
				alertTitle="Recording Captured"
				alertBody={formattedDuration}
				actionButtonText="Delete"
				icon={<CheckCircleOutline />}
				alertActionButtonColor={theme.palette.success.light}
				alertBackgroundColor={theme.palette.successBackground}
				actionButtonClick={handleDelete}
			/>
		);
	}

	if (isRecording) {
		return (
			<DictationActionAlert
				alertTitle="Recording Audio"
				alertBody={formattedDuration}
				alertActionButtonColor={theme.palette.alertInfoTextColor}
				icon={<WaveformIcon customColor={theme.palette.secondary.main} />}
			/>
		);
	}

	if (shouldDisplaySavedAudioAlert) {
		return (
			<DictationActionAlert
				alertTitle="Recording Saved"
				alertBody="To modify entry, delete current entry."
				alertActionButtonColor={'#FFF'}
				alertBackgroundColor={theme.palette.success.main}
				icon={<CheckCircleOutline sx={{ color: '#FFF' }} />}
				textColor="#FFF"
				actionButtonText="DELETE"
				actionButtonClick={handleDelete}
			/>
		);
	}

	return null;
};
