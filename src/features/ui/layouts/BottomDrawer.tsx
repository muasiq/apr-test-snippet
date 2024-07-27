import { Close } from '@mui/icons-material';
import { Box, Button, Divider, Drawer, IconButton, Stack, Typography } from '@mui/material';
import { PropsWithChildren } from 'react';
import theme from '~/styles/theme';

type Props = {
	label: string;
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	closeButtonText?: React.ReactNode;
	noPadding?: boolean;
	dataCy?: string;
};

export const BottomDrawer = ({
	closeButtonText,
	label,
	isOpen,
	setIsOpen,
	children,
	noPadding,
	dataCy,
}: PropsWithChildren<Props>) => {
	return (
		<Drawer anchor="bottom" open={isOpen} onClose={() => setIsOpen(false)}>
			<Box bgcolor={theme.palette.common.white} sx={{ minHeight: '100vh' }}>
				{/* Sticky Drawer Header */}
				<Box
					sx={{
						position: 'sticky',
						top: 0,
						zIndex: 999,
						backgroundColor: 'inherit',
					}}
				>
					<Stack
						direction={'row'}
						alignItems={'center'}
						justifyContent={'space-between'}
						p={2}
						minHeight={75}
					>
						<Typography variant="h5">{label}</Typography>
						{closeButtonText ? (
							<Button data-cy={dataCy ?? 'close-bottom-drawer'} onClick={() => setIsOpen(false)}>
								{closeButtonText}
							</Button>
						) : (
							<IconButton data-cy={dataCy ?? 'close-bottom-drawer'} onClick={() => setIsOpen(false)}>
								<Close sx={{ color: theme.palette.text.primary }} />
							</IconButton>
						)}
					</Stack>
					<Divider
						sx={{
							borderWidth: '1px',
						}}
					/>
				</Box>
				<Box p={noPadding ? 0 : 2}>{children}</Box>
			</Box>
		</Drawer>
	);
};
