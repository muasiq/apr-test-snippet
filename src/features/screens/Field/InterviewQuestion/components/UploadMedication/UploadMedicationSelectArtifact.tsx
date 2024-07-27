import { Check } from '@mui/icons-material';
import { Box, Grid, IconButton, Typography } from '@mui/material';
import { PatientArtifactTag } from '@prisma/client';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useShallowRouterQuery } from '~/common/hooks/useShallowRouterQuery';
import { api } from '~/common/utils/api';
import { BottomDrawer } from '~/features/ui/layouts/BottomDrawer';
import { LoadingSpinner } from '~/features/ui/loading/LoadingSpinner';
import { InterviewState, SliderQuestions } from '../../common/interviewState';
import { saveInterviewUploadQuestion } from '../SyncInterviewUploadQuestions';
import { UploadMedicationArtifactItem } from './UploadMedicationArtifactItem';

type Props = {
	patientId: number;
};

export type ArtifactDetails = {
	id: number;
	artifactType: 'image' | 'pdf';
	relevantPages?: number[];
};

export const UploadMedicationSelectArtifact = ({ patientId }: Props) => {
	const { push } = useShallowRouterQuery();
	const router = useRouter();
	const isInterview = router.query.interviewState === InterviewState.PHOTO_UPLOAD_MEDICATION;
	const [selectedArtifacts, setSelectedArtifacts] = useState<ArtifactDetails[]>([]);

	const saveRelevantMedPagesMutation = api.patientArtifact.saveArtifactRelevantMedPages.useMutation();

	const { selectMedicationArtifact } = router.query as {
		selectMedicationArtifact?: string;
	};

	const { data, error, isFetching } = api.patientArtifact.getAllSignedImageUrlsByIdAndTagname.useQuery(
		{
			patientId,
			tagName: PatientArtifactTag.ReferralDocument,
			viewOnly: true,
		},
		{
			enabled: selectMedicationArtifact === 'true',
			refetchOnWindowFocus: false,
		},
	);

	const handleSubmitArtifacts = async () => {
		for (const artifact of selectedArtifacts) {
			await saveRelevantMedPagesMutation.mutateAsync({
				artifactId: artifact.id,
				relevantMedPages: artifact.relevantPages ?? [],
			});
		}
		await saveInterviewUploadQuestion({
			patientId: Number(patientId),
			tagName: PatientArtifactTag.Medication,
			attemptsToSend: 0,
		});
		if (isInterview) {
			push({
				interviewState: InterviewState.DISTANCE_AND_MINUTES,
				currentQuestion: SliderQuestions.MINUTES_WITH_PATIENT,
				selectMedicationArtifact: undefined,
			});
		} else {
			push({
				selectMedicationArtifact: undefined,
			});
		}
	};

	if (error) {
		return (
			<>
				<Typography>There was an error loading the data for this tab</Typography>
				<Typography>{error.message}</Typography>
			</>
		);
	}

	return (
		<BottomDrawer
			dataCy="pdf-med-select-drawer-close"
			label={'Documents'}
			isOpen={selectMedicationArtifact === 'true'}
			setIsOpen={() => push({ selectMedicationArtifact: undefined })}
		>
			<Typography variant="body2" color={'text.secondary'}>
				View or add documents related to the patient&apos;s health, medical history, care.
			</Typography>
			{selectMedicationArtifact === 'true' && isFetching ? (
				<LoadingSpinner />
			) : (
				<Grid container spacing={2}>
					{data?.length ? (
						data.map((artifact, index) => (
							<UploadMedicationArtifactItem
								key={index}
								artifact={artifact}
								artifactDetails={selectedArtifacts.find((a) => a.id === artifact.id) ?? null}
								setArtifactDetails={setSelectedArtifacts}
							/>
						))
					) : (
						<Box width={'100%'} textAlign={'center'} mt={5}>
							<Typography variant="body2">No items found</Typography>
						</Box>
					)}
				</Grid>
			)}
			<Box height={'100px'} />
			<IconButton
				data-cy="submit-selected-artifacts"
				sx={{
					position: 'fixed',
					bottom: 24,
					right: 0,
					left: 0,
					mr: 'auto',
					ml: 'auto',
					bgcolor: 'primary.main',
					color: '#FFF',
					width: '72px',
					height: '72px',
					'&:disabled': {
						bgcolor: '#EFE1E7',
						color: '#D5C0C9',
						borderColor: '#D5C0C9',
					},
					'&:hover': {
						bgcolor: 'primary.main',
						color: '#FFF',
						borderColor: '#D5C0C9',
					},
				}}
				size="large"
				disabled={!selectedArtifacts.length}
				onClick={handleSubmitArtifacts}
			>
				<Check />
			</IconButton>
		</BottomDrawer>
	);
};
