import { Box, Fade } from '@mui/material';
import { useRouter } from 'next/router';
import { useConfiguration } from '~/common/hooks/useConfiguration';
import { api } from '~/common/utils/api';
import { PatientWithJoins } from '../../../../../../server/api/routers/patient/patient.types';
import { PatientDrawer } from '../../../PatientDetail/PatientDrawer';
import { Assessment } from '../../../PatientDetail/components/Assessment/Assessment';
import { ConfirmSignoffDialog } from './ConfirmSignoffDialog';

type Props = {
	open: boolean;
	onClose: () => void;
	patientData: PatientWithJoins;
};

export function SignOffDrawer({ onClose, open, patientData }: Props) {
	const router = useRouter();
	const { confirmSignOff } = router.query as { confirmSignOff?: string };

	return (
		<PatientDrawer open={open} onClose={onClose} patientName={`${patientData.firstName} ${patientData.lastName}`}>
			{confirmSignOff === 'true' && (
				<Box>
					<ConfirmSignoffDialog patientId={patientData.id} />
				</Box>
			)}
			<Fade in={confirmSignOff === 'false' || !confirmSignOff} unmountOnExit exit={false}>
				<Box>
					<SignOffDrawerContent patientData={patientData} />
				</Box>
			</Fade>
		</PatientDrawer>
	);
}

function SignOffDrawerContent({ patientData }: { patientData: PatientWithJoins }) {
	const { configuration } = useConfiguration();
	const assessmentQuestionsQuery = api.assessment.getAllAssessmentQuestionsForPatient.useQuery(
		{ patientId: Number(patientData.id) },
		{ enabled: !!configuration },
	);

	return (
		<Assessment
			patientData={patientData}
			isLoadingPatientData={false}
			isLoadingAssessmentData={assessmentQuestionsQuery.isLoading}
			assessmentQuestionsForPatient={assessmentQuestionsQuery.data}
		/>
	);
}
