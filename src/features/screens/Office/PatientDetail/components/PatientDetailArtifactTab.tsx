import { Box, Grid, Stack, Typography } from '@mui/material';
import { PatientArtifactTag, PatientStatus } from '@prisma/client';
import { useRouter } from 'next/router';
import { ChangeEvent, useRef } from 'react';
import { CustomAssessmentNumber } from '~/assessments/apricot/custom';
import { useShallowRouterQuery } from '~/common/hooks/useShallowRouterQuery';
import { RouterOutputs, api } from '~/common/utils/api';
import { isNurseInterviewPending, isPostQAStatus } from '~/common/utils/patientStatusUtils';
import { ArtifactDrawer } from '~/features/ui/Dialog/ArtifactDrawer';
import { SignedUrlImage } from '~/features/ui/images/SignedUrlImage';
import { LoadingSpinner } from '~/features/ui/loading/LoadingSpinner';
import { DocumentViewer } from '~/features/ui/pdf/DocumentViewer';
import { useAlert } from '../../../../../common/hooks/useAlert';
import { SchemaAssessmentAnswer } from '../../../../../common/types/AssessmentSuggestionAndChoice';
import { PatientWithJoins } from '../../../../../server/api/routers/patient/patient.types';
import { If } from '../../../../ui/util/If';
import { MedicationEntry } from '../../../Field/InterviewQuestion/components/ReviewPage/MedicationEntry';
import { saveInterviewUploadQuestion } from '../../../Field/InterviewQuestion/components/SyncInterviewUploadQuestions';
import { UploadMedicationSelectArtifact } from '../../../Field/InterviewQuestion/components/UploadMedication/UploadMedicationSelectArtifact';
import { UploadMedicationSpeedDial } from '../../../Field/InterviewQuestion/components/UploadMedication/UploadMedicationSpeedDial';
import { ArtifactGridItem } from './ArtifactGridItem';
import { ArtifactUpload } from './ArtifactUpload';
import { BackOfficeSelectedArtifact } from './BackOfficeSelectedArtifact';

type Props = {
	patientId: number;
	tagName: PatientArtifactTag;
	patientArtifacts: PatientWithJoins['PatientArtifacts'];
	patientStatus: PatientStatus;
	isFieldAppView: boolean;
};

const medicationsInfoText =
	"Upload a photo of the patient's current medication list or select the referral page(s) with this information. Once the patient record is in Pending Signoff status, a digital medication list will appear below.";

export const PatientDetailArtifactTab = ({
	patientId,
	patientStatus,
	tagName,
	patientArtifacts,
	isFieldAppView,
}: Props) => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const alert = useAlert();
	const router = useRouter();
	const { push } = useShallowRouterQuery();
	const isMedsTab = tagName === PatientArtifactTag.Medication;

	const { data, isLoading, error } = api.patientArtifact.getAllSignedImageUrlsByIdAndTagname.useQuery(
		{
			patientId: Number(patientId),
			tagName: tagName,
		},
		{ enabled: !!patientId },
	);

	const assessmentQuery = api.assessment.getAssessmentQuestionForPatient.useQuery(
		{
			patientId,
			assessmentNumber: CustomAssessmentNumber.MEDICATIONS,
		},
		{ enabled: isMedsTab },
	);

	const answer = assessmentQuery.data as SchemaAssessmentAnswer;

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
						patientId: patientId,
						tagName: PatientArtifactTag.Medication,
						attemptsToSend: 0,
					});
				}
			}
		} catch (error: unknown) {
			alert.addErrorAlert({ message: 'Error uploading photos' });
			console.error('error uploading photos!', error);
		}
	};

	const selectedArtifact = data?.find((artifact) => artifact.id === Number(router.query.selectedArtifact)) ?? null;

	const canUploadMeds = isNurseInterviewPending(patientStatus);
	const canViewMedList = isPostQAStatus(patientStatus);

	const handleArtifactClick = (
		artifact: RouterOutputs['patientArtifact']['getAllSignedImageUrlsByIdAndTagname'][0],
	) => {
		push({ selectedArtifact: artifact.id });
	};

	if (selectedArtifact) {
		if (isFieldAppView) {
			const isFilePdf = selectedArtifact.fileType.endsWith('pdf');
			return (
				<>
					<ArtifactDrawer selectedArtifact={selectedArtifact}>
						{isFilePdf ? (
							<Box
								sx={{ height: { xs: 'calc(100dvh - 200px)' } }}
								position={'relative'}
								flexGrow={1}
								overflow={'auto'}
							>
								<DocumentViewer
									patientArtifacts={patientArtifacts}
									artifactId={selectedArtifact.id}
									artifactUrl={selectedArtifact.url}
								/>
							</Box>
						) : (
							<Box
								sx={{ height: { xs: 'calc(100dvh - 200px)' } }}
								position={'relative'}
								flexGrow={1}
								overflow={'auto'}
							>
								<SignedUrlImage
									artifactId={selectedArtifact.id}
									imageUrl={selectedArtifact.url}
									fileName={selectedArtifact.fileName}
								/>
							</Box>
						)}
					</ArtifactDrawer>
				</>
			);
		}
		return <BackOfficeSelectedArtifact selectedArtifact={selectedArtifact} patientArtifacts={patientArtifacts} />;
	}

	return (
		<>
			<If condition={isMedsTab && !!data?.length}>
				<Stack direction="column" mb={2} spacing={1}>
					<Typography variant="body1b">Medication Document(s)</Typography>
					<Typography variant="body2">{medicationsInfoText}</Typography>
				</Stack>
			</If>
			<If condition={isMedsTab && !answer && canUploadMeds}>
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

				<UploadMedicationSelectArtifact patientId={patientId} />
				<input
					multiple
					type="file"
					ref={fileInputRef}
					onChange={handleFileChange}
					style={{ display: 'none' }}
					accept={'image/*,.pdf'}
				/>
			</If>
			<If condition={!isMedsTab}>
				<ArtifactUpload patientId={patientId} tagName={tagName} />
			</If>
			<If condition={!!error}>
				<Typography>There was an error loading the data for this tab</Typography>
				<Typography>{error?.message}</Typography>
			</If>
			<If condition={isLoading}>
				<LoadingSpinner />
			</If>
			<If condition={!isLoading}>
				<Grid container spacing={2}>
					{data?.length ? (
						data.map((artifact, index) => (
							<ArtifactGridItem
								key={index}
								artifact={artifact}
								handleArtifactClick={handleArtifactClick}
							/>
						))
					) : (
						<Box width={'100%'} textAlign={'center'} mt={5} px={3}>
							<If condition={isMedsTab}>
								<Typography variant="body2">{medicationsInfoText}</Typography>
							</If>
							<If condition={!isMedsTab}>
								<Typography variant="body2">No items found</Typography>
							</If>
						</Box>
					)}
				</Grid>
			</If>
			<If condition={isMedsTab && !!answer && canViewMedList}>
				<Box my={3}>
					<MedicationEntry
						patientId={patientId}
						answer={answer}
						readOnly={patientStatus !== 'SignoffNeeded'}
					/>
				</Box>
			</If>
		</>
	);
};
