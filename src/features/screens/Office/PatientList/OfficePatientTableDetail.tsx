import { Grid, MenuItem, Stack, TextField } from '@mui/material';
import { useAlert } from '~/common/hooks/useAlert';
import { api } from '~/common/utils/api';
import { LoadingButton } from '~/features/ui/loading/LoadingButton';
import type { PatientWithJoins } from '~/server/api/routers/patient/patient.types';

type OfficePatientTableDetailProps = {
	patient: PatientWithJoins;
	canAssignQa?: boolean;
	canAssignDataEntry?: boolean;
	canResetPatient?: boolean;
};

export const OfficePatientTableDetail = ({
	patient,
	canAssignQa,
	canAssignDataEntry,
	canResetPatient,
}: OfficePatientTableDetailProps) => {
	const utils = api.useUtils();
	const qaUsers = api.user.getQaUsers.useQuery(undefined, { enabled: canAssignQa });
	const dataEntryUsers = api.user.getDataEntryUsers.useQuery(undefined, { enabled: canAssignDataEntry });

	const alert = useAlert();
	const assignQaUser = api.patient.assignQaUserToPatient.useMutation({
		onSuccess() {
			void utils.patient.getInfinite.invalidate();
		},
		onError(error) {
			alert.addErrorAlert({
				title: 'Error',
				message: error.message ?? 'Error Assigning QA',
			});
		},
	});
	const assignDataEntryUser = api.patient.assignDataEntryUserToPatient.useMutation({
		onSuccess() {
			void utils.patient.getInfinite.invalidate();
		},
		onError(error) {
			alert.addErrorAlert({
				title: 'Error',
				message: error.message ?? 'Error Assigning Data Entry',
			});
		},
	});

	const resetPatient = api.patient.resetPatient.useMutation({
		onSuccess() {
			void utils.patient.getInfinite.invalidate();
			alert.addSuccessAlert({ message: 'Patient data reset successfully' });
		},
		onError(error) {
			alert.addErrorAlert({
				title: 'Error',
				message: error.message ?? 'Error Resetting Patient',
			});
		},
	});

	return (
		<Grid container spacing={2} p={2}>
			{canAssignQa && (
				<Grid md={6} xs={12} item>
					<TextField
						select
						disabled={assignQaUser.isLoading}
						label="Assign QA"
						fullWidth
						value={patient.qaAssignedUserId ?? ''}
						SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 600 } } } }}
						onChange={(e) => {
							assignQaUser.mutate({
								patientId: patient.id,
								userId: e.target.value,
							});
						}}
					>
						{qaUsers.data?.map((user) => (
							<MenuItem key={user.id} value={user.id}>
								{user.name}
							</MenuItem>
						))}
					</TextField>
				</Grid>
			)}
			{canAssignDataEntry && (
				<Grid md={6} xs={12} item>
					<TextField
						select
						fullWidth
						disabled={assignDataEntryUser.isLoading}
						label="Assign Data Entry"
						value={patient.dataEntryAssignedUserId ?? ''}
						SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 600 } } } }}
						onChange={(e) => {
							assignDataEntryUser.mutate({
								patientId: patient.id,
								userId: e.target.value,
							});
						}}
					>
						{dataEntryUsers.data?.map((user) => (
							<MenuItem key={user.id} value={user.id}>
								{user.name}
							</MenuItem>
						))}
					</TextField>
				</Grid>
			)}
			{canResetPatient && (
				<Grid xs={12} item>
					<Stack direction="row" spacing={1}>
						<LoadingButton
							onClick={() =>
								resetPatient.mutate({
									patientId: patient.id,
								})
							}
							isLoading={resetPatient.isLoading}
							label="Reset Demo Patient"
						/>
					</Stack>
				</Grid>
			)}
		</Grid>
	);
};
