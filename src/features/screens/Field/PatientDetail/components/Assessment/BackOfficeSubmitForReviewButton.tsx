import { Box } from '@mui/material';
import { PatientStatus } from '@prisma/client';
import { useAlert } from '~/common/hooks/useAlert';
import { useShallowRouterQuery } from '~/common/hooks/useShallowRouterQuery';
import { api } from '~/common/utils/api';
import { trpc } from '~/common/utils/trpc';
import { LoadingButton } from '~/features/ui/loading/LoadingButton';
import { PatientWithJoins } from '../../../../../../server/api/routers/patient/patient.types';

type Props = {
	patientData: PatientWithJoins;
	isLoadingPatientData: boolean;
	allQuestionsCompleted: boolean;
};

export const BackOfficeSubmitForReviewButton = ({
	allQuestionsCompleted,
	isLoadingPatientData,
	patientData,
}: Props) => {
	const alert = useAlert();
	const utils = trpc.useUtils();
	const { push } = useShallowRouterQuery();

	const updatePatientStatus = api.patient.updatePatientStatus.useMutation({
		onSuccess: async () => {
			push({ step: 1 });
			await utils.patient.getById.invalidate();
			alert.addSuccessAlert({ message: 'Successfully sent for final approval' });
		},
	});

	return (
		<Box p={3} boxShadow={'0px -4px 8px -2px rgba(59, 31, 43, 0.12)'} bgcolor={'white'}>
			<LoadingButton
				data-cy="submit-for-approval-button"
				fullWidth
				disabled={!allQuestionsCompleted || patientData?.status !== 'WithQA'}
				label={'Submit for approval'}
				isLoading={isLoadingPatientData || updatePatientStatus.isLoading}
				onClick={() =>
					updatePatientStatus.mutateAsync({
						patientId: patientData.id,
						status: PatientStatus.SignoffNeeded,
					})
				}
				color="primary"
				variant="contained"
			/>
		</Box>
	);
};
