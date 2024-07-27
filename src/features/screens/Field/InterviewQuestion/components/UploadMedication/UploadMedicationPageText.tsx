import { List, ListItem, Stack, Typography } from '@mui/material';

export const UploadMedicationPageText = () => {
	return (
		<Stack px={3} py={4} spacing={3}>
			<Typography variant="h6" color={'primary'}>
				Medication
			</Typography>
			<Stack spacing={2}>
				<Typography variant="h4">Provide a medication list</Typography>
				<Typography variant="body2">
					{"We'll use the page(s) you provide to generate a medication list draft for you to review later."}
				</Typography>
				<Typography variant="body2" component="div">
					<Typography variant="body2">You can:</Typography>
					<List sx={{ listStyleType: 'disc', listStylePosition: 'inside' }}>
						<ListItem sx={{ display: 'list-item' }} dense>
							Upload a new photo of a medication list (handwritten or printed)
						</ListItem>
						<ListItem sx={{ display: 'list-item' }} dense>
							Select referral document page(s) that list current medications
						</ListItem>
					</List>
				</Typography>
			</Stack>
		</Stack>
	);
};
