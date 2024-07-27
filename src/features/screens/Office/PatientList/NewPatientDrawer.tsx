import { SwipeableDrawer } from '@mui/material';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { ConfirmDialog } from '~/features/ui/Dialog/ConfirmDialog';
import { NewPatientForm } from './NewPatientForm';

export const NewPatientDrawer = (): JSX.Element => {
	const router = useRouter();
	const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
	const drawerIsOpen = router.query.newPatient === 'true';
	const close = () => {
		void router.push(
			{
				pathname: router.pathname,
			},
			undefined,
			{ shallow: true },
		);
	};

	const openConfirmDialog = () => {
		setConfirmDialogOpen(true);
	};

	return (
		<>
			<SwipeableDrawer onOpen={() => null} anchor="right" open={drawerIsOpen} onClose={openConfirmDialog}>
				<NewPatientForm closeForm={close} />
			</SwipeableDrawer>
			<ConfirmDialog
				title="Unsaved Changes Detected"
				body="Are you sure you want to exit? Any information that you've entered will be cleared."
				confirmButtonLabel="Exit"
				open={confirmDialogOpen}
				onConfirm={() => {
					close();
					setConfirmDialogOpen(false);
				}}
				onClose={() => setConfirmDialogOpen(false)}
			/>
		</>
	);
};
