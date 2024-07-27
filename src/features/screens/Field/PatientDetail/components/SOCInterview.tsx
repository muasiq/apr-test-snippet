import { CheckCircle, CircleOutlined, Unpublished } from '@mui/icons-material';
import { Box, Card, CardActionArea, CardContent, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useShallowRouterQuery } from '~/common/hooks/useShallowRouterQuery';
import { SOCInterviewActionButton } from '~/features/screens/Field/PatientDetail/components/SOCInterviewActionButton';
import { useMixpanel } from '~/features/ui/layouts/Mixpanel/useMixpanel';
import theme from '~/styles/theme';
import {
	NurseInterviewBaselineThemes,
	NurseInterviewPhysicalAssessmentThemes,
	allThemes,
	interview,
} from '../../../../../assessments/nurse-interview/questions';
import { api } from '../../../../../common/utils/api';
import { PatientWithJoins, PatientWithJoinsInclude } from '../../../../../server/api/routers/patient/patient.types';
import { LoadingSpinner } from '../../../../ui/loading/LoadingSpinner';
import { useStartOrResumeInterview } from '../common/hooks/useStartOrResumeInterview';

export const SOCInterview = () => {
	const mixpanel = useMixpanel();
	const { checkForDictationChoiceAndThenStartOrResume } = useStartOrResumeInterview();
	const router = useRouter();
	const { push } = useShallowRouterQuery();
	const patientId = Number(router.query.patientId);
	const { data: patientData, isLoading } = api.patient.getById.useQuery(
		{ id: patientId, includes: PatientWithJoinsInclude },
		{ enabled: !!patientId },
	);

	if (isLoading || !patientData || patientData?.id !== patientId) return <LoadingSpinner />;

	const handleSignOffClick = () => {
		push({ openSignOff: true });
	};

	const handleStartOrResumeButtonClick = () => {
		if (hasUserStartedSOCInterview) {
			mixpanel?.track('Resume Nurse Interview');
		} else {
			mixpanel?.track('Start Nurse Interview');
		}
		void checkForDictationChoiceAndThenStartOrResume(patientData);
	};

	const hasUserStartedSOCInterview =
		!!patientData.NurseInterview && patientData.NurseInterview?.minutesSpentWithPatient !== null;

	return (
		<Box
			sx={{
				border: '2px solid #FFF',
				borderRadius: '16px',
				bgcolor: theme.palette.glass,
			}}
		>
			<Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} p={2}>
				<Typography variant="h5">SOC Interview</Typography>
				<SOCInterviewActionButton
					SOCVisitCaseManagerId={patientData.SOCVisitCaseManagerId}
					status={patientData.status}
					handleStartOrResumeButtonClick={handleStartOrResumeButtonClick}
					hasUserStartedSOCInterview={hasUserStartedSOCInterview}
					handleSignOffClick={handleSignOffClick}
				/>
			</Stack>
			{allThemes.map((themeName, index) => (
				<Card
					key={index}
					sx={{
						bgcolor: theme.palette.glass,
						borderBottom: themeName !== allThemes[allThemes.length - 1] ? '2px solid #FFF' : 'none',
						borderRadius: 0,
						boxShadow: 'none',
					}}
				>
					<CardActionArea disabled>
						<CardContent
							sx={{
								p: 2,
							}}
						>
							<Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
								<Stack direction={'row'} spacing={2}>
									{lookupThemeProgress(themeName, patientData) === -1 ? (
										<>
											<Unpublished color="primary" />
										</>
									) : lookupThemeProgress(themeName, patientData) < 1 ? (
										<CircleOutlined color="primary" />
									) : (
										<CheckCircle color="primary" />
									)}
									<Typography variant="body1">{themeName}</Typography>
									{lookupThemeProgress(themeName, patientData) === -1 && (
										<Typography color="primary">(WNL)</Typography>
									)}
								</Stack>
							</Stack>
						</CardContent>
					</CardActionArea>
				</Card>
			))}
		</Box>
	);
};

function lookupThemeProgress(
	themeName: NurseInterviewBaselineThemes | NurseInterviewPhysicalAssessmentThemes,
	patientData: PatientWithJoins,
) {
	if (
		!Object.values(NurseInterviewBaselineThemes).includes(themeName as NurseInterviewBaselineThemes) &&
		patientData.NurseInterview &&
		patientData.NurseInterview?.minutesSpentWithPatient !== null &&
		patientData.NurseInterview?.selectedThemesToReportOn?.length &&
		!patientData.NurseInterview?.selectedThemesToReportOn?.includes(themeName)
	)
		return -1;
	const filtered = patientData.InterviewQuestion.filter(
		(question) => question.interviewQuestionTheme.toString() === themeName.toString(),
	);
	if (filtered.length === 0) return 0;
	return filtered.length / interview.filter((question) => question.theme.toString() === themeName.toString()).length;
}
