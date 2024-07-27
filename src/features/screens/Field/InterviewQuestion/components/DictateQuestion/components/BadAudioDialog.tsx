import { Button, Dialog, Stack, Typography } from '@mui/material';
import { useShallowRouterQuery } from '~/common/hooks/useShallowRouterQuery';

type Props = {
	handleCloseDialog: () => void;
};

export function BadAudioDialog({ handleCloseDialog }: Props) {
	const { push, router } = useShallowRouterQuery();

	function handleTypeAnswers() {
		handleCloseDialog();
		push({ dictate: undefined });
	}

	function handleRefreshPage() {
		void router.reload();
	}

	return (
		<Dialog
			open={true}
			fullWidth
			sx={{
				bgcolor: 'rgba(24, 12, 17, 0.7)',
			}}
			PaperProps={{
				sx: {
					bgcolor: 'transparent',
					boxShadow: 'none',
				},
			}}
		>
			<Stack textAlign={'center'} spacing={2} justifyContent={'center'} alignItems={'center'} mb={4}>
				<Typography variant="h4" color={'primary'}>
					Weak audio signal
				</Typography>
				<Typography variant="body2" color="white">
					We are having a hard time hearing you. Please check your microphone or make sure your headphones are
					properly connected and then try again.
				</Typography>
			</Stack>
			<Stack spacing={2}>
				<Button variant="outlined" sx={{ py: 1 }} onClick={handleRefreshPage}>
					TRY AGAIN
				</Button>
				<Button variant="outlined" sx={{ py: 1 }} onClick={handleTypeAnswers}>
					TYPE MY ANSWERS
				</Button>
			</Stack>
		</Dialog>
	);
}
