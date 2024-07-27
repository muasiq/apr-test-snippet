import { Box } from '@mui/material';
import { PatientArtifactTag } from '@prisma/client';
import { ChangeEvent, useRef } from 'react';
import { useAlert } from '~/common/hooks/useAlert';
import { useShallowRouterQuery } from '~/common/hooks/useShallowRouterQuery';
import { PatientWithJoins } from '~/server/api/routers/patient/patient.types';
import { trpc } from '../../../../../../common/utils/trpc';
import { InterviewState } from '../../common/interviewState';
import { saveInterviewUploadQuestion } from '../SyncInterviewUploadQuestions';
import { UploadMedicationPageText } from './UploadMedicationPageText';
import { UploadMedicationSelectArtifact } from './UploadMedicationSelectArtifact';
import { UploadMedicationSpeedDial } from './UploadMedicationSpeedDial';

type Props = {
	patientData: PatientWithJoins;
};

export const UploadMedicationPrompt = ({ patientData }: Props): JSX.Element => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const alert = useAlert();
	const { push } = useShallowRouterQuery();
	const trpcUtils = trpc.useUtils();

	const handleNewFileClick = () => {
		fileInputRef.current?.click();
	};

	const handleFromApricotClick = () => {
		push({ selectMedicationArtifact: true });
	};

	const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
		if (!event.target.files) return;

		try {
			for (const file of event.target.files) {
				if (file) {
					await saveInterviewUploadQuestion({
						file,
						patientId: patientData.id,
						tagName: PatientArtifactTag.Medication,
						attemptsToSend: 0,
					});
				}
			}
			push({
				interviewState: InterviewState.PHOTO_UPLOAD_WOUNDS,
				currentQuestion: undefined,
			});

			void trpcUtils.patient.getById.invalidate();
		} catch (error: unknown) {
			alert.addErrorAlert({ message: 'Error uploading photos' });
			console.error('error uploading photos!', error);
		}
	};

	return (
		<>
			<UploadMedicationPageText />
			<Box
				bgcolor={'#FFF'}
				height={'72px'}
				borderRadius={'16px 16px 0px 0px'}
				boxShadow={
					'0px 2px 4px -1px rgba(0, 0, 0, 0.20), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12);'
				}
				position={'fixed'}
				bottom={0}
				left={0}
				right={0}
			>
				<UploadMedicationSpeedDial
					handleNewFileClick={handleNewFileClick}
					handleFromApricotClick={handleFromApricotClick}
				/>
			</Box>

			<UploadMedicationSelectArtifact patientId={patientData.id} />
			<input
				multiple
				type="file"
				ref={fileInputRef}
				onChange={handleFileChange}
				style={{ display: 'none' }}
				accept={'image/*,.pdf'}
			/>
		</>
	);
};
