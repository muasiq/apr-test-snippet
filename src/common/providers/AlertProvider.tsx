import { Container, Alert as MuiAlert, Slide, Snackbar, Typography } from '@mui/material';
import { useCallback, useState } from 'react';
import { AlertContext, type Alert, type SimpleAlertParams } from '../hooks/useAlert';

type AlertProviderProps = {
	children: React.ReactNode;
	verticalPosition?: 'top' | 'bottom';
	horizontalPosition?: 'left' | 'center' | 'right';
};
export function AlertProvider({ children, verticalPosition, horizontalPosition }: AlertProviderProps) {
	const [alerts, setAlerts] = useState<Alert[]>([]);

	const addAlert = useCallback((alert: Alert) => {
		setAlerts((prevAlerts) => [...prevAlerts, alert]);
	}, []);

	const addSuccessAlert = useCallback(
		({ title, message }: SimpleAlertParams) => {
			addAlert({
				title,
				message,
				severity: 'success',
				autoHideDuration: 3000,
			});
		},
		[addAlert],
	);

	const addErrorAlert = useCallback(
		({ title, message }: SimpleAlertParams) => {
			addAlert({
				title,
				message,
				severity: 'error',
			});
		},
		[addAlert],
	);

	const addInfoAlert = useCallback(
		({ title, message }: SimpleAlertParams) => {
			addAlert({
				title,
				message,
				severity: 'info',
			});
		},
		[addAlert],
	);

	const onCloseSnackbar = (i: number) => {
		setAlerts((prevAlerts) => prevAlerts.filter((_, alertIndex) => alertIndex !== i));
	};

	return (
		<AlertContext.Provider value={{ addAlert, addSuccessAlert, addErrorAlert, addInfoAlert }}>
			{children}
			<Container>
				{alerts.map((alert, i) => (
					<Snackbar
						key={i}
						open={true}
						autoHideDuration={alert.autoHideDuration ?? undefined}
						onClose={() => onCloseSnackbar(i)}
						TransitionComponent={Slide}
						anchorOrigin={{
							vertical: verticalPosition ?? 'bottom',
							horizontal: horizontalPosition ?? 'center',
						}}
					>
						<MuiAlert
							severity={alert.severity}
							sx={{
								mb: 1,
								width: '400px',
								'& .MuiAlert-icon': {
									display: 'flex',
									alignItems: 'center',
								},
							}}
							onClose={() => onCloseSnackbar(i)}
						>
							<Typography fontWeight={500}>{alert.title}</Typography>
							<Typography>{alert.message}</Typography>
						</MuiAlert>
					</Snackbar>
				))}
			</Container>
		</AlertContext.Provider>
	);
}
