import { Box, Container } from '@mui/material';
import { useRouter } from 'next/router';
import { type PropsWithChildren } from 'react';
import { renderNavBars } from '~/common/utils/showNavBars';
import { BackButton } from '../buttons/BackButton';
import { BottomNav } from './BottomNav';
import { TopNav } from './TopNav';

export const GlobalLayout = ({ children }: PropsWithChildren) => {
	const router = useRouter();
	const isFieldAppPage = router.pathname.startsWith('/field');

	const isAuthRoute = router.pathname.startsWith('/auth');
	if (isAuthRoute) {
		return <>{children}</>;
	}

	const shouldDisplayNav = renderNavBars(router.pathname);

	return (
		<Box
			sx={{
				minHeight: '100vh',
				backgroundImage: 'url(/backdrop-full.png)',
				backgroundSize: 'cover',
				backgroundPosition: 'center',
				backgroundRepeat: 'no-repeat',
				backgroundAttachment: 'fixed',
			}}
		>
			<Container maxWidth={isFieldAppPage ? 'lg' : false}>
				{shouldDisplayNav ? (
					<TopNav />
				) : (
					<Box py={3}>
						<BackButton />
					</Box>
				)}
				{children}
			</Container>
			{shouldDisplayNav && <BottomNav />}
		</Box>
	);
};
