import { Button } from '@mui/material';
import { LoadingButton } from '~/features/ui/loading/LoadingButton';

type Props = {
	uploadedFiles: { file: File }[];
	handleNextQuestion: (didUpload: boolean) => void;
	handleUploadLaterClick: () => void;
	currentPhotoFlow: {
		noneText: string;
	};
	fileInputRef: React.RefObject<HTMLInputElement>;
	isUploading: boolean;
};

export const InterviewQuestionFileUploadButtons = ({
	currentPhotoFlow,
	fileInputRef,
	handleNextQuestion,
	handleUploadLaterClick,
	uploadedFiles,
	isUploading,
}: Props) => {
	const uploadButtonText = uploadedFiles.length > 0 ? 'Upload more' : 'Upload';
	return (
		<>
			<LoadingButton
				label={uploadButtonText}
				isLoading={isUploading}
				fullWidth
				onClick={() => fileInputRef.current?.click()}
				variant="contained"
			/>
			{uploadedFiles.length ? (
				<Button
					data-cy="soc-interview-upload-next-question-button"
					fullWidth
					onClick={() => handleNextQuestion(true)}
					variant="outlined"
				>
					Next Question
				</Button>
			) : (
				<Button
					data-cy="soc-interview-upload-none-button"
					fullWidth
					onClick={handleUploadLaterClick}
					variant="outlined"
				>
					{currentPhotoFlow.noneText}
				</Button>
			)}
		</>
	);
};
