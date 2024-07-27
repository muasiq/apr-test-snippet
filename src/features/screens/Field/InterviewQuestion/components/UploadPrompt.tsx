import { Box, Stack, Typography } from '@mui/material';
import { PatientArtifactTag } from '@prisma/client';
import { useRouter } from 'next/router';
import { ChangeEvent, useRef, useState } from 'react';
import { delay } from '~/common/utils/delay';
import { useAlert } from '../../../../../common/hooks/useAlert';
import { useShallowRouterQuery } from '../../../../../common/hooks/useShallowRouterQuery';
import { FULL_HEIGHT_MINUS_NAVBAR } from '../../../../ui/layouts/TopNav';
import { InterviewState, SliderQuestions } from '../common/interviewState';
import { InterviewQuestionFileUploadList } from './InterviewQuestionFileUploadList';
import { saveInterviewUploadQuestion } from './SyncInterviewUploadQuestions';
import { UploadBackForward } from './Upload/UploadBackForward';

const photoFlow = [
	{
		item: InterviewState.PHOTO_UPLOAD_WOUNDS,
		type: PatientArtifactTag.Wounds,
		text: 'Upload wound photos from your visit',
		noneText: 'Patient has no wounds',
		nextQuestionParams: (didUpload: boolean) => ({
			interviewState: InterviewState.PHOTO_UPLOAD_DOCUMENTATION,
			didUploadWounds: didUpload,
		}),
		prevQuestionParams: () => ({
			interviewState: InterviewState.DISTANCE_AND_MINUTES,
			currentQuestion: SliderQuestions.DISTANCE,
		}),
	},
	{
		item: InterviewState.PHOTO_UPLOAD_DOCUMENTATION,
		type: PatientArtifactTag.ReferralDocument,
		text: 'Upload photos of all documents created or collected during the visit.',
		noneText: "I'll upload these later",
		nextQuestionParams: (_didUpload: boolean) => ({ interviewState: InterviewState.AREAS_TO_REPORT_ON }),
		prevQuestionParams: () => ({
			interviewState: InterviewState.PHOTO_UPLOAD_WOUNDS,
		}),
	},
];
export const UploadPrompt = (): JSX.Element => {
	const alerts = useAlert();
	const { push } = useShallowRouterQuery();
	const router = useRouter();
	const [uploadedFiles, setUploadedFiles] = useState<{ file: File }[]>([]);
	const { patientId } = router.query as { patientId: string; interviewState: InterviewState };
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [uploading, setUploading] = useState(false);
	const [loadingNextQuestion, setLoadingNextQuestion] = useState(false);
	const [loadSuccessIcon, setLoadSuccessIcon] = useState(false);

	const currentPhotoFlow = photoFlow.find((item) => item.item === router.query.interviewState);
	if (!currentPhotoFlow) return <></>;

	const handleUploadLaterClick = async () => {
		await saveInterviewUploadQuestion({
			patientId: Number(patientId),
			tagName: currentPhotoFlow.type,
			attemptsToSend: 0,
		});
		void handleNextQuestion(false);
	};

	const handleForward = () => {
		if (uploadedFiles.length) {
			void handleNextQuestion(true);
		} else {
			void handleUploadLaterClick();
		}
	};

	const handleBack = () => {
		push(currentPhotoFlow.prevQuestionParams());
	};

	const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
		if (!event.target.files) return;
		setUploading(true);

		try {
			for (const file of event.target.files) {
				if (file) {
					setUploadedFiles((prev) => [...prev, { file, isUploading: true }]);
					await saveInterviewUploadQuestion({
						file,
						patientId: Number(patientId),
						tagName: currentPhotoFlow.type,
						attemptsToSend: 0,
					});
				}
			}
		} catch (error: unknown) {
			alerts.addErrorAlert({ message: 'Error uploading photos' });
			console.error('error uploading photos!', error);
		}
		setUploading(false);
	};

	const handleNextQuestion = async (didUpload: boolean) => {
		setLoadingNextQuestion(true);
		setUploadedFiles([]);
		setLoadingNextQuestion(false);
		setLoadSuccessIcon(true);
		await delay(1000);
		push(currentPhotoFlow.nextQuestionParams(didUpload));
		setLoadSuccessIcon(false);
	};

	return (
		<>
			<Stack height={FULL_HEIGHT_MINUS_NAVBAR} flexDirection={'column'} textAlign={'center'}>
				<Stack flexGrow={1} justifyContent={'center'} alignItems={'center'}>
					<Box p={5}>
						<Typography sx={{ textAlign: 'center' }} mb={2} variant="h4">
							{currentPhotoFlow.text}
						</Typography>
					</Box>
					<Stack spacing={2} p={3}>
						<InterviewQuestionFileUploadList uploadedFiles={uploadedFiles} />
					</Stack>
					<input
						multiple
						type="file"
						ref={fileInputRef}
						onChange={handleFileChange}
						style={{ display: 'none' }}
						accept={'image/*'}
					/>
				</Stack>
			</Stack>
			<UploadBackForward
				forwardDisabled={uploading}
				onBack={handleBack}
				onUploadClick={() => fileInputRef.current?.click()}
				onForward={handleForward}
				isUploading={loadingNextQuestion}
				loadSuccessIcon={loadSuccessIcon}
			/>
		</>
	);
};
