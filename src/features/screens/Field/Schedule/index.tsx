import { Stack, Typography } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAlert } from '~/common/hooks/useAlert';
import { api } from '~/common/utils/api';
import { ApricotAccordion } from '~/features/ui/Accordion/ApricotAccordion';
import { ApricotAccordionPatientDetailList } from '~/features/ui/Accordion/ApricotAccordionPatientDetailList';
import { LoadingSpinner } from '../../../ui/loading/LoadingSpinner';
import { PullToRefresh } from '../../../ui/loading/PullToRefresh';
import { PatientDrawer } from '../PatientDetail/PatientDrawer';
import {
	getForReviewPatients,
	getInProgressPatients,
	getNotStartedPatients,
	getTodayPatients,
	getUpNextPatients,
} from './common/util/accordionScheduleFilters';
import { MagicButton } from './components/MagicButton';
import { PreInterviewSwitch } from './components/PreInterviewSwitch';

export const ScheduleScreen = () => {
	const router = useRouter();
	const { interviewTab } = router.query as { interviewTab: string | undefined };
	const { data: sessionData } = useSession();
	const alert = useAlert();
	const { data: patientData, isLoading, error } = api.patient.getScheduleView.useQuery();

	useEffect(() => {
		if (error) {
			alert.addErrorAlert({
				title: 'Error fetching patients',
				message: error.message,
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [error]);

	const todaysPatients = getTodayPatients(patientData);
	const upNextPatients = getUpNextPatients(patientData);
	const notStartedPatients = getNotStartedPatients(patientData);
	const inProgressPatients = getInProgressPatients(patientData);
	const forReviewPatients = getForReviewPatients(patientData);

	if (isLoading) {
		return <LoadingSpinner />;
	}

	return (
		<>
			<PullToRefresh />
			<Stack spacing={4}>
				<Stack alignItems={'center'} spacing={4}>
					<Typography variant="h3">Welcome, {sessionData?.user.name?.split(' ')[0]}</Typography>
					<MagicButton />
				</Stack>
				<Stack spacing={2}>
					<Typography variant="h4">My Schedule</Typography>
					<ApricotAccordion
						numberOfItems={todaysPatients.length}
						title="Today"
						defaultExpanded
						isLoading={isLoading}
					>
						<ApricotAccordionPatientDetailList patients={todaysPatients} />
					</ApricotAccordion>
					<ApricotAccordion numberOfItems={upNextPatients.length} title="Up next" defaultExpanded={false}>
						<ApricotAccordionPatientDetailList patients={upNextPatients} />
					</ApricotAccordion>
				</Stack>
				<Stack spacing={2}>
					<Typography variant="h4">Action needed</Typography>
					<ApricotAccordion
						numberOfItems={notStartedPatients.length}
						title="Not Started"
						defaultExpanded
						isLoading={isLoading}
					>
						<ApricotAccordionPatientDetailList patients={notStartedPatients} />
					</ApricotAccordion>
					<ApricotAccordion defaultExpanded numberOfItems={inProgressPatients.length} title="In Progress">
						<ApricotAccordionPatientDetailList patients={inProgressPatients} />
					</ApricotAccordion>
					<ApricotAccordion defaultExpanded numberOfItems={forReviewPatients.length} title="For Review">
						<ApricotAccordionPatientDetailList patients={forReviewPatients} />
					</ApricotAccordion>
				</Stack>
			</Stack>
			<PatientDrawer open={!!interviewTab} onClose={() => void router.push(`/field/schedule`)} patientName={``}>
				<PreInterviewSwitch
					notStarted={[...todaysPatients, ...notStartedPatients]}
					inProgress={inProgressPatients}
				/>
			</PatientDrawer>
		</>
	);
};
