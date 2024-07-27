import { Close } from '@mui/icons-material';
import {
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogContent,
	DialogTitle,
	IconButton,
	Stack,
	Typography,
} from '@mui/material';
import { useDialogState } from '~/common/hooks/useDialogState';
import { api } from '~/common/utils/api';
import { UserActionPermissions } from '~/common/utils/permissions';
import { PermissionGuard } from '~/features/ui/auth/PermissionGuard';
import { downloadFile } from '~/features/ui/util/downloadFile';
import { PatientWithJoins } from '~/server/api/routers/patient/patient.types';

export function DownloadVisitNote({ patientData }: { patientData: PatientWithJoins }) {
	const downloadDialogProps = useDialogState();

	return (
		<>
			<VisitNoteDownloadDialog {...downloadDialogProps} patientData={patientData} />
			<PermissionGuard neededPermission={UserActionPermissions.DOWNLOAD_VISIT_NOTE}>
				<Box m={2}>
					<Button
						variant="contained"
						color="primary"
						onClick={downloadDialogProps.open}
						disabled={downloadDialogProps.isOpen}
					>
						Print Visit Note
					</Button>
				</Box>
			</PermissionGuard>
		</>
	);
}

function VisitNoteDownloadDialog({
	patientData,
	isOpen,
	close,
}: {
	patientData: PatientWithJoins;
	isOpen: boolean;
	close: () => void;
}) {
	const { data, isLoading } = api.patient.getVisitNoteSignedUrls.useQuery(
		{ patientId: patientData.id },
		{ refetchInterval: (data) => (data?.status === 'processing' ? 5000 : false), enabled: isOpen },
	);

	let content = null;

	if (isLoading) {
		content = (
			<Stack alignItems="center" m={4}>
				<CircularProgress />
			</Stack>
		);
	}

	if (data?.status === 'processing') {
		content = (
			<Stack alignItems="center" m={4} gap={4}>
				<CircularProgress />
				<Typography variant="body1">Generating visit note...</Typography>
			</Stack>
		);
	}

	if (data?.status === 'ready') {
		content = (
			<Stack alignItems="center" gap={4} m={1}>
				<Typography variant="body1">Would you like to include explanation text?</Typography>
				<Stack gap={2}>
					<Button
						onClick={() => {
							const signedUrl = data.signedUrls.find((d) => d.type === 'visitNote')!.signedUrl;
							downloadFile(signedUrl);
							close();
						}}
						variant="contained"
					>
						Visit Note Only
					</Button>
					<Button
						onClick={() => {
							const signedUrl = data.signedUrls.find(
								(d) => d.type === 'visitNoteWithExplanations',
							)!.signedUrl;
							downloadFile(signedUrl);
							close();
						}}
						variant="contained"
					>
						Visit Note with Explanations
					</Button>
				</Stack>
			</Stack>
		);
	}

	return (
		<Dialog open={isOpen} onClose={close} PaperProps={{ sx: { minWidth: 250 } }}>
			<DialogTitle>Print Visit Note </DialogTitle>
			<IconButton aria-label="close" onClick={close} sx={{ position: 'absolute', right: 8, top: 8 }}>
				<Close />
			</IconButton>
			<DialogContent>{content}</DialogContent>
		</Dialog>
	);
}
