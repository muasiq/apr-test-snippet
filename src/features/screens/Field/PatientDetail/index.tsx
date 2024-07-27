import { CheckCircleOutline } from '@mui/icons-material';
import { Alert, AlertTitle, Stack, Typography } from '@mui/material';
import { PatientStatus } from '@prisma/client';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { match } from 'ts-pattern';
import { api } from '~/common/utils/api';
import { isPostSignOffStatus } from '~/common/utils/patientStatusUtils';
import theme from '~/styles/theme';
import { useAlert } from '../../../../common/hooks/useAlert';
import { useShallowRouterQuery } from '../../../../common/hooks/useShallowRouterQuery';
import { Pages } from '../../../../common/utils/showNavBars';
import { PatientWithJoinsInclude } from '../../../../server/api/routers/patient/patient.types';
import { LoadingSpinner } from '../../../ui/loading/LoadingSpinner';
import { PatientDetailTabs } from '../../Office/PatientDetail/components/PatientDetailTabView';
import { InterviewFlow } from '../InterviewQuestion/components/InterviewFlow';
import { SignOffDrawer } from '../InterviewQuestion/components/SignOffDrawer/SignOffDrawer';
import { PatientDetailCard } from './components/PatientDetailCard';
import { PatientInfoDrawer } from './components/PatientInfoDrawer';
import { SOCInterview } from './components/SOCInterview';

export const PatientDetailScreen = () => {
	const alert = useAlert();
	const router = useRouter();

	const { push, pushReplaceQuery } = useShallowRouterQuery();
	const { patientId, openPatientDetails, openSignOff, interviewOpen } = router.query as {
		patientId: string;
		openPatientDetails?: string;
		openSignOff?: string;
		interviewOpen?: string;
	};

	const setOpenPatientDetails = () => {
		push({ openPatientDetails: true, currentTab: PatientDetailTabs.INFORMATION });
	};

	const setClosePatientDetails = () => {
		push({ openPatientDetails: false });
	};

	const {
		data: patientData,
		isLoading: isLoadingPatientData,
		error: patientDataError,
	} = api.patient.getById.useQuery(
		{
			id: Number(patientId),
			includes: PatientWithJoinsInclude,
		},
		{
			enabled: !!patientId && !Number.isNaN(Number(patientId)),
		},
	);

	useEffect(() => {
		if (isLoadingPatientData) return;
		if (patientDataError) {
			alert.addErrorAlert({ message: patientDataError.message });
			void router.push(Pages.FIELD_SCHEDULE);
			return;
		}
		if (!patientData) {
			alert.addErrorAlert({ message: 'Patient not found' });
			void router.push(Pages.FIELD_SCHEDULE);
			return;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoadingPatientData, patientData, patientDataError, router]);

	if (isLoadingPatientData) return <LoadingSpinner />;
	if (!patientData) return <Typography>Patient data not found</Typography>;

	const hideBaseOfPage = openPatientDetails === 'true' || openSignOff === 'true' || interviewOpen === 'true';

	return (
		<>
			{isPostSignOffStatus(patientData.status) && (
				<Alert
					severity="success"
					sx={{ bgcolor: theme.palette.success.main, color: '#FFF', mx: -2, borderRadius: 0, mb: 1 }}
					icon={<CheckCircleOutline sx={{ color: '#FFF' }} />}
				>
					<AlertTitle>Successfully submitted</AlertTitle>
					{successMessageBasedOnStatus(patientData.status)}
				</Alert>
			)}
			{!hideBaseOfPage && (
				<Stack spacing={2} pb={4}>
					<PatientDetailCard patient={patientData} setOpenPatientDetails={setOpenPatientDetails} />
					<SOCInterview />
				</Stack>
			)}
			<PatientInfoDrawer
				patient={patientData}
				open={openPatientDetails === 'true'}
				close={() => setClosePatientDetails()}
			/>
			<InterviewFlow />
			<SignOffDrawer
				open={!!openSignOff}
				onClose={() =>
					void pushReplaceQuery({
						patientId: patientData.id,
					})
				}
				patientData={patientData}
			/>
		</>
	);
};

function successMessageBasedOnStatus(status: PatientStatus): string {
	return match(status)
		.with(PatientStatus.Complete, () => 'Apricot has entered your approved documentation into your EMR')
		.with(PatientStatus.ReadyForEMR, () => 'Apricot will enter your approved documentation into your EMR for you.')
		.with(PatientStatus.AddingToEMR, () => 'Apricot is entering your approved documentation into your EMR for you.')
		.otherwise(() => '');
}
