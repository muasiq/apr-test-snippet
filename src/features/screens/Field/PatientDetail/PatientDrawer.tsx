import { Close } from '@mui/icons-material';
import { Box, Drawer, IconButton, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import { NAVBAR_HEIGHT } from '~/features/ui/layouts/TopNav';
import theme from '../../../../styles/theme';

type Props = {
	open: boolean;
	onClose: () => void;
	patientName: string;
	children: React.ReactNode;
};

export const INTERVIEW_DRAWER_HEADER_HEIGHT = '60px';

export const PatientDrawer = ({ open, onClose, patientName, children }: Props): JSX.Element => {
	return (
		<>
			<Drawer
				anchor="bottom"
				open={open}
				onClose={onClose}
				PaperProps={{
					style: {
						backgroundImage: 'url(/backdrop-full.png)',
						backgroundSize: 'cover',
						backgroundPosition: 'center',
						backgroundRepeat: 'no-repeat',
						height: '100%',
						width: '100%',
						zIndex: 100,
					},
				}}
			>
				<Stack
					height="100%"
					sx={{
						overflowX: 'hidden',
					}}
				>
					<Stack height="100%">
						<Box
							sx={{
								position: 'sticky',
								top: 0,
								zIndex: 999,
							}}
						>
							<Stack
								height={NAVBAR_HEIGHT}
								direction={'row'}
								alignItems={'center'}
								justifyContent={'center'}
								p={2}
								borderBottom={`1px solid ${theme.palette.divider}`}
							>
								<Box sx={{ position: 'absolute', left: 16, top: 25 }}>
									<Image src={'/logo.svg'} width={93} height={20} alt="logo" />
								</Box>
								<Typography variant="subtitle2">{patientName}</Typography>
								<Box sx={{ position: 'absolute', right: 16, top: 15 }}>
									<IconButton onClick={onClose} data-cy="patient-drawer-close-btn">
										<Close sx={{ color: theme.palette.text.primary }} />
									</IconButton>
								</Box>
							</Stack>
						</Box>
						<Stack height={'100%'}>{children}</Stack>
					</Stack>
				</Stack>
			</Drawer>
		</>
	);
};
