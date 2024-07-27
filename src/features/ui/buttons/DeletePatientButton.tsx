import { api } from '../../../common/utils/api';
import { UserActionPermissions } from '../../../common/utils/permissions';
import { trpc } from '../../../common/utils/trpc';
import { DeleteButton } from './DeleteButton';

type Props = {
	patientId: number;
	onDeleteSuccess: () => void;
};
export const DeletePatientButton = ({ patientId, onDeleteSuccess }: Props) => {
	const trpcUtils = trpc.useUtils();

	const { mutateAsync: deletePatient, isLoading: isDeleting } = api.patient.delete.useMutation({
		onSuccess: () => {
			onDeleteSuccess();
			void trpcUtils.patient.getInfinite.invalidate();
		},
	});

	const handleConfirmDelete = async () => {
		await deletePatient({ id: patientId });
	};

	return (
		<DeleteButton
			isDeleting={isDeleting}
			itemBeingDeleted="patient"
			runDelete={handleConfirmDelete}
			permissionNeeded={UserActionPermissions.ARCHIVE_PATIENT_RECORD}
		/>
	);
};
