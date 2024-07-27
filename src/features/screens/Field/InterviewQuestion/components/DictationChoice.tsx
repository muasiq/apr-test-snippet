import { Stack, Step, StepLabel, Stepper, Typography } from '@mui/material';
import { NurseInterviewBaselineThemes, interview } from '../../../../../assessments/nurse-interview/questions';
import { useShallowRouterQuery } from '../../../../../common/hooks/useShallowRouterQuery';
import { PatientWithJoins } from '../../../../../server/api/routers/patient/patient.types';
import { FULL_HEIGHT_MINUS_NAVBAR } from '../../../../ui/layouts/TopNav';
import { InterviewState } from '../common/interviewState';
import { AnswerModeBackForward } from './AnswerModeBackForward';

type Props = {
	patientData: PatientWithJoins;
};
export const DictationChoice = ({ patientData }: Props): JSX.Element => {
	const { push } = useShallowRouterQuery();

	const pushDictateChoice = (dictate: boolean) => {
		push({
			dictate,
			questionShortLabel: interview[0]!.shortLabel,
			interviewState: InterviewState.MAIN_INTERVIEW,
			physicalAssessmentThemes: patientData.NurseInterview?.selectedThemesToReportOn,
		});
	};

	return (
		<>
			<Stack p={5} height={FULL_HEIGHT_MINUS_NAVBAR} flexDirection={'column'} textAlign={'center'}>
				<Stack flexGrow={1} justifyContent={'center'} alignItems={'center'}>
					<Typography sx={{ textAlign: 'center' }} mb={2} variant="h4">
						Thanks. Lets start with the patient&apos;s baseline information.
					</Typography>
					<Stepper orientation="vertical" activeStep={-1}>
						{Object.values(NurseInterviewBaselineThemes).map((theme) => {
							return (
								<Step key={theme}>
									<StepLabel>{theme}</StepLabel>
								</Step>
							);
						})}
					</Stepper>
				</Stack>
			</Stack>
			<AnswerModeBackForward onForward={(dictate: boolean) => pushDictateChoice(dictate)} />
		</>
	);
};
