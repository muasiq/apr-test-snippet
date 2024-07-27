import { Box, Fade, Grid, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { answerSuggestionStillLoading } from '~/assessments/util/assessmentStateUtils';
import { api } from '~/common/utils/api';
import { PatientWithJoinsInclude } from '../../../../server/api/routers/patient/patient.types';
import theme from '../../../../styles/theme';
import { LoadingSpinner } from '../../../ui/loading/LoadingSpinner';
import { Assessment } from '../../Field/PatientDetail/components/Assessment/Assessment';
import { AssessmentStatusProvider } from '../../Field/PatientDetail/components/Assessment/hooks/useAssessmentStatus';
import { PatientDetailTabView } from './components/PatientDetailTabView';

export const OfficePatientDetailScreen = () => {
	const router = useRouter();

	const { patientId, qaOpen } = router.query as {
		patientId: string;
		qaOpen: string;
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
			cacheTime: Infinity,
		},
	);

	const { data: assessmentQuestionsForPatient, isLoading: isLoadingAssessmentData } =
		api.assessment.getAllAssessmentQuestionsForPatient.useQuery(
			{
				patientId: Number(patientId),
			},
			{
				refetchInterval: (data) => {
					const itemsToRefetchFor = (data ?? []).filter(
						(a) => !a.checkedResponse && answerSuggestionStillLoading(a),
					);
					console.log({ itemsToRefetchFor });
					return itemsToRefetchFor.length ? 5000 : false;
				},
			},
		);

	useEffect(() => {
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = '';
		};
	}, []);

	if (isLoadingPatientData) return <LoadingSpinner />;
	if (!patientData) return <Typography>Patient data not found</Typography>;
	if (patientDataError) return <Typography>patientDataError: {patientDataError.message}</Typography>;

	const splitView = qaOpen === 'true';
	return (
		<Box sx={{ bgcolor: theme.palette.common.white }}>
			<Grid container>
				<Grid item xs={splitView ? 6 : 12}>
					<PatientDetailTabView
						patientData={patientData}
						assessmentQuestionsForPatient={assessmentQuestionsForPatient}
					/>
				</Grid>
				<Grid
					item
					xs={splitView ? 6 : 0}
					borderLeft={splitView ? `1px solid ${theme.palette.divider}` : 'none'}
					borderRight={splitView ? `1px solid ${theme.palette.divider}` : 'none'}
				>
					<Fade in={splitView} unmountOnExit exit={false}>
						<Box>
							<AssessmentStatusProvider>
								<Assessment
									isLoadingAssessmentData={isLoadingAssessmentData}
									assessmentQuestionsForPatient={assessmentQuestionsForPatient}
									isLoadingPatientData={isLoadingPatientData}
									patientData={patientData}
								/>
							</AssessmentStatusProvider>
						</Box>
					</Fade>
				</Grid>
			</Grid>
		</Box>
	);
};
