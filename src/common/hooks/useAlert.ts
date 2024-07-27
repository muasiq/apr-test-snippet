import { createContext, useContext } from 'react';

export type Alert = {
	title?: string;
	message: string;
	severity: 'error' | 'success' | 'info' | 'warning';
	autoHideDuration?: number;
};

export type SimpleAlertParams = {
	title?: string;
	message: string;
};

type AlertContextType = {
	addAlert: (alert: Alert) => void;
	addSuccessAlert: (alert: SimpleAlertParams) => void;
	addErrorAlert: (alert: SimpleAlertParams) => void;
	addInfoAlert: (alert: SimpleAlertParams) => void;
};

export const AlertContext = createContext<AlertContextType>({
	addAlert: () => {
		throw new Error('addAlert() not implemented. Are you using AlertProvider?');
	},
	addSuccessAlert: () => {
		throw new Error('addSuccessAlert() not implemented. Are you using AlertProvider?');
	},
	addErrorAlert: () => {
		throw new Error('addErrorAlert() not implemented. Are you using AlertProvider?');
	},
	addInfoAlert() {
		throw new Error('addInfoAlert() not implemented. Are you using AlertProvider?');
	},
});

export function useAlert() {
	return useContext(AlertContext);
}
