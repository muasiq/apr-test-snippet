import { useSession } from 'next-auth/react';
import { api } from '../../../common/utils/api';
import { canDeleteArtifact } from '../../../common/utils/canDeleteArtifact';
import { UserActionPermissions } from '../../../common/utils/permissions';
import { trpc } from '../../../common/utils/trpc';
import { DeleteButton } from './DeleteButton';

type Props = {
	artifactId: number;
	userThatUploadedId?: string | null;
	onDeleteSuccess: () => void;
};
export const DeleteArtifactButton = ({ artifactId, userThatUploadedId, onDeleteSuccess }: Props) => {
	const trpcUtils = trpc.useUtils();
	const { data: userData } = useSession();

	const { mutateAsync: deleteArtifact, isLoading: isDeleting } = api.patientArtifact.deleteArtifact.useMutation({
		onSuccess: () => {
			void trpcUtils.patientArtifact.getAllSignedImageUrlsByIdAndTagname.invalidate();
			onDeleteSuccess();
		},
	});

	const handleConfirmDelete = async () => {
		await deleteArtifact({ artifactId });
	};

	if (!userData) return null;

	return (
		<DeleteButton
			isDeleting={isDeleting}
			itemBeingDeleted="artifact"
			runDelete={handleConfirmDelete}
			permissionCheckOverride={canDeleteArtifact(userData.user.id, userData.user.roles, userThatUploadedId)}
			permissionNeeded={UserActionPermissions.DELETE_ARTIFACTS}
			withTextButton={true}
		/>
	);
};
