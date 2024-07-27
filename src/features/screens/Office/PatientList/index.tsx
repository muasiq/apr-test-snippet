import { Add } from '@mui/icons-material';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import theme from '../../../../styles/theme';
import { OfficePatientListTable } from './OfficePatientListTable';

export const OfficePatientListScreen = (): JSX.Element => {
	const router = useRouter();

	const handleNewPatientClick = () => {
		void router.push(
			{
				pathname: router.pathname,
				query: { ...router.query, newPatient: true },
			},
			undefined,
			{ shallow: true },
		);
	};

	return (
		<Box
			bgcolor={theme.palette.common.white}
			sx={{
				display: 'flex',
				flexDirection: 'column',
				height: '90vh',
				[theme.breakpoints.down('sm')]: {},
				[theme.breakpoints.up('sm')]: {
					py: 5,
					px: 5,
				},
			}}
		>
			<Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mb={2}>
				<Typography variant={'h4'}>Patients</Typography>
				<Button
					data-cy="new-patient-button"
					onClick={handleNewPatientClick}
					startIcon={<Add />}
					variant="contained"
				>
					New Patient
				</Button>
			</Stack>
			<OfficePatientListTable />
		</Box>
	);
};
