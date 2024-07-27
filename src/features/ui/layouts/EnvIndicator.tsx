import { Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { UserActionPermissions } from '../../../common/utils/permissions';
import theme from '../../../styles/theme';
import { PermissionGuard } from '../auth/PermissionGuard';

export const EnvIndicator = () => {
	const [host, setHost] = useState<string | null>(null);
	useEffect(() => {
		setHost(window?.location?.hostname);
	}, []);
	const env = getEnv(host ?? '');
	return (
		<PermissionGuard neededPermission={UserActionPermissions.SEE_ENV_INDICATOR}>
			<Typography color={ColorMap[env]} variant="body1">
				{env}
			</Typography>
		</PermissionGuard>
	);
};

enum Env {
	LOCALHOST = 'Localhost',
	STAGING = 'Staging',
	PROD = 'Prod',
}

const ColorMap = {
	[Env.LOCALHOST]: theme.palette.success.light,
	[Env.STAGING]: theme.palette.warning.light,
	[Env.PROD]: theme.palette.error.light,
};

const getEnv = (url: string) => {
	const urlIsIPAddress = /^\d/.test(url);
	if (url.includes('localhost') || urlIsIPAddress) return Env.LOCALHOST;
	if (url.includes('staging')) return Env.STAGING;
	return Env.PROD;
};
