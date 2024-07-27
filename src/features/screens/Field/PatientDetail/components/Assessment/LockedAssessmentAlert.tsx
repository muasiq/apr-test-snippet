import { Lock } from '@mui/icons-material';
import { Alert, AlertTitle, Box, Typography } from '@mui/material';

export const LockedAssessmentAlert = () => {
	return (
		<Box>
			<Alert icon={<Lock />} severity="success" sx={{ borderRadius: 0 }}>
				<AlertTitle>Documentation sent for review.</AlertTitle>
				<Typography variant="body2">All items have been locked pending review.</Typography>
			</Alert>
		</Box>
	);
};
