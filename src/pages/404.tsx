import { Box, Typography } from '@mui/material';

export default function Custom404() {
	return (
		<Box
			display={'flex'}
			alignItems={'center'}
			justifyContent={'center'}
			height={'100vh'}
			width={'100%'}
			textAlign={'center'}
		>
			<Typography variant="h1">
				<b style={{ color: 'red' }}>404</b> - Page Not Found 🫡
			</Typography>
		</Box>
	);
}
