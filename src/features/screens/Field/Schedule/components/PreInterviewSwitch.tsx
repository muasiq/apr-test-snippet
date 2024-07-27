import { Box, Button, Container, Fade, Stack, Typography } from '@mui/material';
import { Patient } from '@prisma/client';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { BackButton } from '~/features/ui/buttons/BackButton';
import { FULL_HEIGHT_MINUS_NAVBAR } from '~/features/ui/layouts/TopNav';
import theme from '~/styles/theme';
import { useShallowRouterQuery } from '../../../../../common/hooks/useShallowRouterQuery';
import { PatientWithJoins } from '../../../../../server/api/routers/patient/patient.types';
import { useStartOrResumeInterview } from '../../PatientDetail/common/hooks/useStartOrResumeInterview';

type Props = {
	notStarted: Patient[];
	inProgress: Patient[];
};
type InterviewTab = 'new' | 'existing' | 'newOrInProgress';

export const PreInterviewSwitch = ({ notStarted, inProgress }: Props) => {
	const { checkForDictationChoiceAndThenStartOrResume } = useStartOrResumeInterview();
	const router = useRouter();
	const { push } = useShallowRouterQuery();
	const { interviewTab } = router.query as { interviewTab: InterviewTab | undefined };

	const [activePatientList, setActivePatientList] = useState<Patient[]>([]);

	const initialActionText =
		notStarted.length || inProgress.length ? 'What would you like to do?' : 'No patients to assess';
	const newAssessmentText = notStarted.length ? 'Start new assessment' : 'No new assessments';
	const existingAssessmentText = inProgress.length ? 'Finish existing assessment' : 'No existing assessments';

	const patientListText =
		interviewTab === 'new'
			? 'Which patient would you like to start assessing?'
			: interviewTab === 'existing'
				? 'Which patient would you like to finish assessing?'
				: '';

	const handleInitialAction = (state: InterviewTab) => {
		push({ interviewTab: state });
		setActivePatientList(state === 'new' ? notStarted : state === 'existing' ? inProgress : []);
	};

	return (
		<Container>
			<Fade in={interviewTab === 'newOrInProgress'} exit={false} unmountOnExit>
				<Stack
					width="100%"
					height={FULL_HEIGHT_MINUS_NAVBAR}
					justifyContent={'center'}
					alignItems={'center'}
					spacing={4}
					px={2}
					py={4}
				>
					<Typography mb={2} variant="h4">
						{initialActionText}
					</Typography>

					<Stack spacing={1} width={'100%'}>
						<Button
							disabled={!notStarted.length}
							fullWidth
							variant="contained"
							onClick={() => handleInitialAction('new')}
						>
							{newAssessmentText}
						</Button>

						<Button
							disabled={!inProgress.length}
							fullWidth
							variant="outlined"
							onClick={() => handleInitialAction('existing')}
						>
							{existingAssessmentText}
						</Button>
					</Stack>
				</Stack>
			</Fade>
			<Fade in={interviewTab !== 'newOrInProgress'} exit={false} unmountOnExit>
				<Box>
					<Stack px={2} py={4} spacing={4}>
						<Stack>
							<Box ml={-1}>
								<BackButton iconColor={theme.palette.heading} />
							</Box>
							<Typography variant="h4">{patientListText}</Typography>
						</Stack>
						{activePatientList.map((patient) => (
							<Button
								key={patient.id}
								fullWidth
								variant="outlined"
								sx={{
									borderColor: theme.palette.secondary.light,
									color: theme.palette.text.primary,
									py: 2,
									'&:hover': {
										borderColor: theme.palette.secondary.light,
										bgcolor: theme.palette.secondary.light,
										color: theme.palette.text.primary,
									},
								}}
								onClick={() => checkForDictationChoiceAndThenStartOrResume(patient as PatientWithJoins)}
							>
								{patient.firstName} {patient.lastName}
							</Button>
						))}
					</Stack>
				</Box>
			</Fade>
		</Container>
	);
};
