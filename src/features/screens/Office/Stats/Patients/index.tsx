import { Container } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { DateRangePicker, LocalizationProvider } from '@mui/x-date-pickers-pro';
import { SingleInputDateRangeField } from '@mui/x-date-pickers-pro/SingleInputDateRangeField';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { PatientStatus } from '@prisma/client';
import { LoadingSpinner } from '../../../../ui/loading/LoadingSpinner';
import { usePatientsScreen } from './index.hook';

export const PatientsScreen = () => {
	const { isLoadingPatientStats, dateRange, updateDateRange, dataset } = usePatientsScreen();

	return (
		<Container sx={{ height: '90vh', width: '100vw', py: 10 }}>
			<LocalizationProvider dateAdapter={AdapterDateFns}>
				<DateRangePicker
					sx={{ minWidth: '300px' }}
					slots={{ field: SingleInputDateRangeField }}
					value={dateRange}
					onChange={(newValue) => updateDateRange(newValue)}
				/>
			</LocalizationProvider>
			{isLoadingPatientStats || !dataset ? (
				<LoadingSpinner />
			) : (
				<BarChart
					dataset={dataset}
					series={Object.values(PatientStatus).map((s) => ({ dataKey: s, label: s, stack: 'total' }))}
					xAxis={[{ dataKey: 'SOCDate', scaleType: 'band' }]}
					yAxis={[{ dataKey: 'count' }]}
				></BarChart>
			)}
		</Container>
	);
};
