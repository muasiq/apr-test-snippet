import { Box, Stack, Typography } from '@mui/material';
import { PatientWithJoins } from '../../../../../server/api/routers/patient/patient.types';
import { FULL_HEIGHT_MINUS_NAVBAR } from '../../../../ui/layouts/TopNav';
import { useStartOrResumeInterview } from '../../PatientDetail/common/hooks/useStartOrResumeInterview';
import { AnswerModeBackForward } from './AnswerModeBackForward';

type Props = {
	patientData: PatientWithJoins;
};
export const ResumeDictationChoice = ({ patientData }: Props): JSX.Element => {
	const { startOrResumeInterview } = useStartOrResumeInterview();

	const pushDictateChoice = (dictate: boolean) => {
		if (!patientData) return;

		void startOrResumeInterview(patientData, dictate);
	};

	return (
		<Stack
			height={FULL_HEIGHT_MINUS_NAVBAR}
			justifyContent={'center'}
			alignItems={'center'}
			spacing={4}
			textAlign={'center'}
		>
			<Box>
				<Typography mb={2} variant="h4">
					Let&apos;s pick up where you left off.
				</Typography>
				<Typography variant="body2">How would you like to answer?</Typography>
			</Box>
			<AnswerModeBackForward onForward={(dictate: boolean) => pushDictateChoice(dictate)} />
		</Stack>
	);
};
