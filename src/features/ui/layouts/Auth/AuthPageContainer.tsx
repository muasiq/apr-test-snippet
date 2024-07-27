import { Box, Container, Grow, Slide, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import { PropsWithChildren } from 'react';
import { AuthCardHeight } from '../../cards/Auth/AuthCard';
import { DarkBackgroundImage } from '../DarkBackgroundImage';

type Props = {
	helperText?: string;
};

export const AuthPageContainer = ({
	children,
	helperText = 'Home health care documentation done in 15 minutes, flat.',
}: PropsWithChildren<Props>) => {
	return (
		<Box
			sx={{
				position: 'relative',
				height: '100vh',
				bgcolor: 'primary.dark',
				overflow: 'hidden',
				zIndex: 0,
			}}
		>
			<DarkBackgroundImage />
			<Stack
				sx={{
					height: `calc(100% - ${AuthCardHeight})`, // Adjusted for the height of the sign in card
					justifyContent: 'center',
					alignItems: 'center',
					zIndex: 0,
				}}
				px={2}
				spacing={2}
			>
				<Grow in timeout={1000}>
					<Image src="/apricot-logo-long.svg" alt="Apricot Logo" width={400} height={100} />
				</Grow>
				<Grow in timeout={1250}>
					<Typography variant="h5" color={'primary.light'} textAlign={'center'}>
						{helperText}
					</Typography>
				</Grow>
			</Stack>
			<Slide direction="up" in timeout={1000}>
				<Box sx={{ position: 'fixed', bottom: 0, width: '100%' }}>
					<Container disableGutters>{children}</Container>
				</Box>
			</Slide>
		</Box>
	);
};
