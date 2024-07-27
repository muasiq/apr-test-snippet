import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { LoadingButton } from '../loading/LoadingButton';

type Props = {
	title: string;
	body: string;
	open?: boolean;
	onConfirm: () => void;
	onClose: () => void;
	confirmButtonLabel?: string;
	isLoading?: boolean;
};
export function ConfirmDialog({
	title = 'Confirm',
	body,
	onConfirm,
	onClose,
	open = true,
	isLoading = false,
	confirmButtonLabel = 'Confirm',
}: Props): JSX.Element {
	return (
		<>
			<Dialog open={open} onClose={onClose}>
				<DialogTitle>{title}</DialogTitle>
				<DialogContent>
					<DialogContentText>{body}</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={onClose} data-cy="cancel-button">
						Cancel
					</Button>
					<LoadingButton
						isLoading={isLoading}
						label={confirmButtonLabel}
						onClick={() => void onConfirm()}
					></LoadingButton>
				</DialogActions>
			</Dialog>
		</>
	);
}
