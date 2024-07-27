import { Box, Button, Stack, Step, StepLabel, Stepper, ToggleButton, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
	NurseInterviewGroups,
	NurseInterviewPhysicalAssessmentThemes,
	interview,
} from '../../../../../assessments/nurse-interview/questions';
import { useShallowRouterQuery } from '../../../../../common/hooks/useShallowRouterQuery';
import { PatientWithJoins } from '../../../../../server/api/routers/patient/patient.types';
import { LoadingSpinner } from '../../../../ui/loading/LoadingSpinner';
import { InterviewState } from '../common/interviewState';
import { saveInterviewSetupQuestion } from './SyncInterviewSetupQuestions';

type Props = {
	patientData: PatientWithJoins;
};

export const WithinNormalLimits = ({ patientData }: Props): JSX.Element => {
	const router = useRouter();

	const { patientId, dictate } = router.query as {
		patientId: string;
		questionShortLabel?: string;
		dictate?: string;
	};
	const [selections, setSelections] = useState<NurseInterviewPhysicalAssessmentThemes[]>([]);
	const { push, pushReplaceQuery } = useShallowRouterQuery();

	const physicalAssessmentThemes = patientData?.NurseInterview?.selectedThemesToReportOn;

	const pushSelections = async () => {
		if (!patientData?.NurseInterview?.selectedThemesToReportOn) return;

		await saveInterviewSetupQuestion({
			patientId: Number(patientId),
			selectedThemesToReportOn: [...patientData?.NurseInterview?.selectedThemesToReportOn, ...selections],
			hasConfirmedThemesWithinNormalLimits: true,
		});

		const nextQuestion = interview
			.filter((i) => i.group === NurseInterviewGroups.PhysicalAssessment)
			.find((q) => selections.includes(q.theme as NurseInterviewPhysicalAssessmentThemes));
		pushReplaceQuery({
			interviewOpen: true,
			questionShortLabel: nextQuestion!.shortLabel,
			patientId,
			dictate,
			preventBack: true,
			physicalAssessmentThemes: selections,
			interviewState: InterviewState.MAIN_INTERVIEW,
		});
	};

	const [addMore, setAddMore] = useState(false);

	const nextScreen = async () => {
		await saveInterviewSetupQuestion({
			patientId: Number(patientId),
			hasConfirmedThemesWithinNormalLimits: true,
		});
		push({ interviewState: InterviewState.REVIEW_PROMPT });
	};

	const themesLeftOut = Object.values(NurseInterviewPhysicalAssessmentThemes).filter(
		(theme) => !physicalAssessmentThemes?.includes(theme),
	);

	useEffect(() => {
		if (!physicalAssessmentThemes) return;
		// no themes left to report on, so move to review
		if (themesLeftOut.length === 0) {
			void nextScreen();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [themesLeftOut, physicalAssessmentThemes]);

	if (!physicalAssessmentThemes) return <LoadingSpinner />;

	return (
		<>
			{!addMore ? (
				<>
					<Box p={5} width={'100%'}>
						<Typography sx={{ textAlign: 'center' }} mb={2} variant="h4">
							The following reports will be marked as &quot;within normal limits&quot;.
						</Typography>
						<Box pb={10} sx={{ height: '50vh', overflow: 'scroll' }}>
							<Stepper orientation="vertical" activeStep={-1}>
								{themesLeftOut.map((theme) => {
									return (
										<Step key={theme}>
											<StepLabel>{theme}</StepLabel>
										</Step>
									);
								})}
							</Stepper>
						</Box>
					</Box>
					<Stack sx={{ position: 'fixed', bottom: '60px', left: '10px', right: '10px' }} spacing={2}>
						<Button
							data-cy="soc-interview-i-understand-button"
							fullWidth
							onClick={() => nextScreen()}
							variant="contained"
						>
							I Understand
						</Button>
						<Button fullWidth onClick={() => setAddMore(true)} variant="outlined">
							Add More Info
						</Button>
					</Stack>
				</>
			) : (
				<>
					<Typography sx={{ textAlign: 'center' }} px={3} pt={4} mb={2} variant="h4">
						Select the additional areas you would like to report on.
					</Typography>
					<Stack
						pb={5}
						sx={{ overflowY: 'scroll', height: '65vh' }}
						alignItems={'center'}
						direction="column"
						spacing={2}
					>
						{themesLeftOut.map((theme) => {
							return (
								<ToggleButton
									color="primary"
									sx={{ borderRadius: '16px', width: '90%' }}
									key={theme}
									selected={selections.includes(theme)}
									onChange={() => {
										if (selections.includes(theme)) {
											setSelections(selections.filter((selection) => selection !== theme));
										} else {
											setSelections([...selections, theme]);
										}
									}}
									value={theme}
								>
									{theme}
								</ToggleButton>
							);
						})}
					</Stack>
					<Button
						disabled={selections.length === 0}
						onClick={pushSelections}
						sx={{ position: 'fixed', bottom: '30px', left: '10px', right: '10px' }}
						variant="contained"
					>
						Continue Report
					</Button>
				</>
			)}
		</>
	);
};
