import { Chip, ChipProps, Menu, MenuItem } from '@mui/material';
import { PatientStatus } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { match, P } from 'ts-pattern';
import { useAlert } from '~/common/hooks/useAlert';
import { api } from '~/common/utils/api';
import { patientStatusEnumToText } from '~/common/utils/patientStatusToText';
import { EMRDataEntryStatuses } from '~/common/utils/patientStatusUtils';
import { hasActionPermission, UserActionPermissions } from '~/common/utils/permissions';
import { trpc } from '~/common/utils/trpc';
import { ConfirmDialog } from '../Dialog/ConfirmDialog';
import { LoadingSpinner } from '../loading/LoadingSpinner';
import { If } from '../util/If';

type Props = {
	status: PatientStatus;
	patientId?: number;
	size?: ChipProps['size'];
};
export const PatientStatusChip = ({ status, patientId, size = 'small' }: Props) => {
	const router = useRouter();
	const { data } = useSession();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [changedStatus, setChangedStatus] = useState<null | PatientStatus>(null);
	const open = Boolean(anchorEl);
	const openDialog = Boolean(changedStatus);
	const utils = trpc.useUtils();
	const alert = useAlert();

	const changeStatus = api.patient.manuallyChangePatientStatus.useMutation({
		onSuccess: async () => {
			alert.addSuccessAlert({
				message: 'Patient record has been updated.',
			});
			await utils.patient.getById.invalidate();
		},
		onError: (error) => {
			alert.addErrorAlert({
				title: 'Error',
				message: error.message,
			});
		},
	});

	const setAsComplete = api.patient.setPatientStatusAsComplete.useMutation({
		onSuccess: () => {
			alert.addSuccessAlert({
				message: 'Patient record has been marked as complete.',
			});
			void router.push('/office/patient/list');
		},
		onError: (error) => {
			alert.addErrorAlert({
				title: 'Error',
				message: error.message,
			});
		},
	});

	const setAsNonAdmit = api.patient.setPatientStatusAsNonAdmit.useMutation({
		onSuccess: async () => {
			alert.addSuccessAlert({
				message: 'Patient record has been marked as non-admit.',
			});
			await utils.patient.getById.invalidate();
		},
		onError: (error) => {
			alert.addErrorAlert({
				title: 'Error',
				message: error.message,
			});
		},
	});

	const setAsNewPatient = api.patient.setPatientStatusAsNewPatient.useMutation({
		onSuccess: async () => {
			alert.addSuccessAlert({
				message: 'Patient record has been marked as new patient.',
			});
			await utils.patient.getById.invalidate();
		},
		onError: (error) => {
			alert.addErrorAlert({
				title: 'Error',
				message: error.message,
			});
		},
	});

	const chipStatusDetails = (status: PatientStatus) => {
		return match(status)
			.with(PatientStatus.NewPatient, () => ({
				label: patientStatusEnumToText(status),
				color: 'secondary' as const,
			}))
			.with(PatientStatus.Incomplete, () => ({
				label: patientStatusEnumToText(status),
				color: 'primary' as const,
			}))
			.with(PatientStatus.WithQA, () => ({ label: patientStatusEnumToText(status), color: 'info' as const }))
			.with(PatientStatus.SignoffNeeded, () => ({
				label: patientStatusEnumToText(status),
				color: 'warning' as const,
			}))
			.with(P.union(...EMRDataEntryStatuses), () => ({
				label: patientStatusEnumToText(status),
				color: 'info' as const,
			}))
			.with(PatientStatus.Complete, () => ({ label: patientStatusEnumToText(status), color: 'success' as const }))
			.with(PatientStatus.NonAdmit, () => ({ label: patientStatusEnumToText(status), color: 'default' as const }))
			.exhaustive();
	};

	const { label, color } = chipStatusDetails(status);
	const canEditPatientStatus = hasActionPermission(
		UserActionPermissions.MANUALLY_CHANGE_STATUS_OF_PATIENT_RECORD,
		data?.user.roles,
	);
	const canMarkAsComplete = hasActionPermission(
		UserActionPermissions.MANUALLY_SET_PATIENT_RECORD_AS_COMPLETE,
		data?.user.roles,
	);
	const canMarkAsNonAdmit = hasActionPermission(
		UserActionPermissions.MANUALLY_SET_PATIENT_RECORD_AS_NON_ADMIT,
		data?.user.roles,
	);
	const canMarkAsNewPatient = hasActionPermission(
		UserActionPermissions.MANUALLY_SET_PATIENT_RECORD_AS_NEW_PATIENT,
		data?.user.roles,
	);
	const hasUpdatePermission = canEditPatientStatus || canMarkAsComplete || canMarkAsNonAdmit || canMarkAsNewPatient;

	const getMenuItemLabel = (patientStatus: PatientStatus) => {
		const { color } = chipStatusDetails(patientStatus);
		return {
			backgroundColor: color === 'default' ? 'inherit' : color,
			color: color === 'default' ? 'text.primary' : 'common.white',
		};
	};

	const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
		if (hasUpdatePermission) {
			setAnchorEl(event.currentTarget);
		}
	};

	const handleClose = (newStatus?: PatientStatus) => {
		setAnchorEl(null);
		if (patientId && newStatus && newStatus !== status) {
			setChangedStatus(newStatus);
		}
	};

	const handleDialogClose = () => {
		setChangedStatus(null);
	};
	const confirmChangeStatus = () => {
		if (!patientId || !changedStatus) return;

		if (canEditPatientStatus) {
			changeStatus.mutate({ patientId, status: changedStatus });
		} else if (canMarkAsNonAdmit && changedStatus === PatientStatus.NonAdmit) {
			setAsNonAdmit.mutate({ patientId });
		} else if (canMarkAsComplete) {
			setAsComplete.mutate({ patientId });
		} else if (canMarkAsNewPatient && changedStatus === PatientStatus.NewPatient) {
			setAsNewPatient.mutate({ patientId });
		}
		handleDialogClose();
	};

	return (
		<>
			<ConfirmDialog
				title="Change Patient Status"
				body="Are you sure you want to change the patient status?"
				open={openDialog}
				onConfirm={confirmChangeStatus}
				onClose={handleDialogClose}
			/>

			{changeStatus.isLoading && <LoadingSpinner />}
			<Chip
				data-cy="current-status"
				size={size}
				label={label}
				color={color}
				onClick={handleClick}
				sx={{
					width: 'fit-content',
					cursor: canEditPatientStatus ? 'pointer' : 'default',
					'&:hover': {
						bgcolor: canEditPatientStatus ? `${color}.dark` : `${color}.main`,
					},
				}}
			/>
			<If condition={hasUpdatePermission}>
				<Menu id="status-menu" anchorEl={anchorEl} open={open} onClose={() => handleClose()}>
					{getStatusList(status, {
						canEditPatientStatus,
						canMarkAsComplete,
						canMarkAsNonAdmit,
						canMarkAsNewPatient,
					}).map((patientStatus) => (
						<MenuItem
							key={patientStatus}
							onClick={() => handleClose(patientStatus)}
							sx={{
								bgcolor: `${getMenuItemLabel(patientStatus).backgroundColor}.main`,
								color: getMenuItemLabel(patientStatus).color,
								border: patientStatus === status ? '2px solid black' : 'none',
								'&:hover': {
									bgcolor: `${getMenuItemLabel(patientStatus).backgroundColor}.light`,
								},
							}}
						>
							{chipStatusDetails(patientStatus).label}
						</MenuItem>
					))}
				</Menu>
			</If>
		</>
	);
};

function getStatusList(
	currentStatus: PatientStatus,
	{
		canEditPatientStatus,
		canMarkAsComplete,
		canMarkAsNonAdmit,
		canMarkAsNewPatient,
	}: {
		canEditPatientStatus: boolean;
		canMarkAsComplete: boolean;
		canMarkAsNonAdmit: boolean;
		canMarkAsNewPatient: boolean;
	},
): PatientStatus[] {
	if (canEditPatientStatus) {
		return Object.values(PatientStatus);
	}

	if (canMarkAsComplete && currentStatus !== PatientStatus.Complete) {
		return [currentStatus, PatientStatus.Complete];
	}
	if (canMarkAsNonAdmit && currentStatus !== PatientStatus.NonAdmit) {
		return [currentStatus, PatientStatus.NonAdmit];
	}
	if (canMarkAsNewPatient && currentStatus !== PatientStatus.NewPatient) {
		return [currentStatus, PatientStatus.NewPatient];
	}
	return [currentStatus];
}
