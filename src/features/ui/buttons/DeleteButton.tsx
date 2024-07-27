import { Delete } from '@mui/icons-material';
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	IconButton,
} from '@mui/material';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useAlert } from '../../../common/hooks/useAlert';
import { UserActionPermissions, hasActionPermission } from '../../../common/utils/permissions';
import { LoadingButton } from '../loading/LoadingButton';

type Props = {
	itemBeingDeleted: string;
	runDelete: () => Promise<void>;
	isDeleting: boolean;
	permissionNeeded?: UserActionPermissions;
	permissionCheckOverride?: boolean;
	withTextButton?: boolean;
};
export const DeleteButton = ({
	runDelete,
	isDeleting,
	permissionNeeded,
	permissionCheckOverride,
	itemBeingDeleted,
	withTextButton = false,
}: Props) => {
	const { data: authData } = useSession();
	const canDelete =
		permissionCheckOverride ??
		(permissionNeeded ? hasActionPermission(permissionNeeded, authData?.user.roles) : true);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const alert = useAlert();

	const handleClickOpen = () => {
		setConfirmOpen(true);
	};

	const handleClose = () => {
		setConfirmOpen(false);
	};

	const handleConfirmDelete = async () => {
		try {
			await runDelete();
			alert.addSuccessAlert({ message: `Successfully deleted ${itemBeingDeleted}` });
			handleClose();
		} catch (error) {
			alert.addErrorAlert({ message: `Error deleting ${itemBeingDeleted}` });
		}
	};

	if (!canDelete) {
		return null;
	}

	return (
		<>
			{withTextButton ? (
				<Button onClick={handleClickOpen} endIcon={<Delete />}>
					Delete
				</Button>
			) : (
				<IconButton onClick={handleClickOpen}>
					<Delete />
				</IconButton>
			)}

			<Dialog open={confirmOpen} onClose={handleClose}>
				<DialogTitle>Confirm Delete</DialogTitle>
				<DialogContent>
					<DialogContentText>Are you sure you want to delete this {itemBeingDeleted}?</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose}>Cancel</Button>
					<LoadingButton
						isLoading={isDeleting}
						label="Delete"
						onClick={() => void handleConfirmDelete()}
					></LoadingButton>
				</DialogActions>
			</Dialog>
		</>
	);
};
