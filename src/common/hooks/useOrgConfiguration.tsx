import { api } from '../utils/api';

export const useOrgConfiguration = () => {
	const configurationQuery = api.configuration.getCurrentConfigurationForOrg.useQuery();

	if (!configurationQuery.data) {
		return { configuration: null };
	}
	return { configuration: configurationQuery.data };
};
