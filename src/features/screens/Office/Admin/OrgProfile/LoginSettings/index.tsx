import { Stack } from '@mui/material';
import { RouterOutputs } from '~/common/utils/api';
import { AllowedDomains } from '~/features/screens/Office/Admin/OrgProfile/LoginSettings/AllowedDomains';
import { LoginProfiles } from '~/features/screens/Office/Admin/OrgProfile/LoginSettings/LoginProfiles';

type Props = {
	org: RouterOutputs['organization']['getUserOrganization'];
};
export function LoginSettings({ org }: Props): JSX.Element {
	return (
		<>
			<Stack spacing={3}>
				<AllowedDomains org={org} data-cy="domain-allow-list" />
				<LoginProfiles />
			</Stack>
		</>
	);
}
