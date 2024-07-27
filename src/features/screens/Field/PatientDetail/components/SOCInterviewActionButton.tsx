import { Check } from '@mui/icons-material';
import { Button, Chip } from '@mui/material';
import { PatientStatus } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { match, P } from 'ts-pattern';
import { nurseInterviewPendingStatuses, postSignOffStatuses } from '~/common/utils/patientStatusUtils';
import theme from '~/styles/theme';

type Props = {
	SOCVisitCaseManagerId: string | null;
	status: PatientStatus;
	handleStartOrResumeButtonClick: () => void;
	hasUserStartedSOCInterview: boolean;
	handleSignOffClick: () => void;
};
export function SOCInterviewActionButton({
	SOCVisitCaseManagerId,
	status,
	hasUserStartedSOCInterview,
	handleStartOrResumeButtonClick,
	handleSignOffClick,
}: Props): JSX.Element {
	const { data: user } = useSession();
	const isAssignedNurse = SOCVisitCaseManagerId === user?.user.id;

	if (!SOCVisitCaseManagerId) return <Chip label="No Nurse Assigned"></Chip>;

	if (!isAssignedNurse) return <Chip label="Other Nurse Assigned"></Chip>;

	return match(status)
		.returnType<JSX.Element>()
		.with(P.union(...nurseInterviewPendingStatuses), () => {
			return (
				<Button
					data-cy="soc-interview-start-button"
					variant="contained"
					onClick={handleStartOrResumeButtonClick}
				>
					{hasUserStartedSOCInterview ? 'Resume' : 'Start'}
				</Button>
			);
		})
		.with(PatientStatus.WithQA, () => <Chip label="Drafting"></Chip>)
		.with(PatientStatus.SignoffNeeded, () => {
			return (
				<Button data-cy="soc-sign-off-button" variant="contained" onClick={handleSignOffClick}>
					Sign Off
				</Button>
			);
		})
		.with(P.union(...postSignOffStatuses), () => {
			return (
				<Button
					variant="contained"
					disableTouchRipple
					startIcon={<Check />}
					sx={{ bgcolor: theme.palette.success.main, '&:hover': { bgcolor: theme.palette.success.main } }}
				>
					Completed
				</Button>
			);
		})
		.with(PatientStatus.NonAdmit, () => <Chip label="Non Admit"></Chip>)
		.exhaustive();
}
