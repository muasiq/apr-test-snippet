import { Box, Container, Stack, Typography } from '@mui/material';
import { PatientStatus } from '@prisma/client';
import { useShallowRouterQuery } from '~/common/hooks/useShallowRouterQuery';
import { api } from '~/common/utils/api';
import { trpc } from '~/common/utils/trpc';

import { useState } from 'react';
import { useAlert } from '~/common/hooks/useAlert';
import { LoadingButton } from '~/features/ui/loading/LoadingButton';
import { SignatureTextField } from '../../../../../ui/inputs/SignatureTextField';
import { BackForward } from '../AnswerQuestion/BackForward';

type Props = {
	patientId: number;
};

export const ConfirmSignoffDialog = ({ patientId }: Props) => {
	const [nurseSignOffName, setNurseSignOffName] = useState('');
	const [showError, setShowError] = useState(false);
	const { pushReplaceQuery, push } = useShallowRouterQuery();
	const alert = useAlert();
	const utils = trpc.useUtils();

	const updatePatientStatus = api.patient.updatePatientStatus.useMutation({
		onSuccess: () => {
			void utils.patient.getById.invalidate();
			pushReplaceQuery({ patientId });
		},
		onError: (error) => {
			alert.addErrorAlert({ message: error.message });
		},
	});

	const handleConfirmSignOff = () => {
		if (!nurseSignOffName.trim()) {
			setShowError(true);
			return;
		}
		setShowError(false);
		updatePatientStatus.mutate({
			patientId,
			status: PatientStatus.ReadyForEMR,
			nurseSignOffName: nurseSignOffName,
		});
	};

	const handleBack = () => {
		push({ confirmSignOff: false });
	};
	return (
		<>
			<Container>
				<Stack justifyContent={'center'} spacing={4}>
					<Stack spacing={2} pt={4} textAlign={'center'}>
						<Typography variant="h4">One last step. Sign and submit!</Typography>
						<Typography variant="body2">
							Entering your full name below serves as an attestation that the information contained herein
							was approved by the signing agent, and services were ordered by the physician(s) identified.
						</Typography>
					</Stack>
					<SignatureTextField
						value={nurseSignOffName}
						onChange={setNurseSignOffName}
						showError={showError}
						helperText={'A name is required to approve and sign off'}
					/>
					<Stack spacing={1}>
						<LoadingButton
							data-cy="sign-off-submit-button"
							label="SUBMIT"
							isLoading={updatePatientStatus.isLoading}
							variant="contained"
							onClick={handleConfirmSignOff}
						/>
					</Stack>
				</Stack>
			</Container>

			<Box
				px={3}
				py={3}
				borderRadius={'16px 16px 0 0'}
				boxShadow={
					'0px 2px 4px -1px rgba(0, 0, 0, 0.20), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12);'
				}
				position={'fixed'}
				height={'72px'}
				border={0}
				left={0}
				right={0}
				bottom={0}
				bgcolor={'#FFF'}
			>
				<BackForward onForward={() => null} forwardDisabled={true} onBack={handleBack} />
			</Box>
		</>
	);
};
