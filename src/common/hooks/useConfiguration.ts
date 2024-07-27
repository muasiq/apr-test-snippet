import { useRouter } from 'next/router';
import { api } from '../utils/api';

export const useConfiguration = () => {
	const router = useRouter();
	const { patientId } = router.query as { patientId: string };
	const parsedPatientId = Number(patientId);
	const configurationQuery = api.configuration.getConfigurationForPatient.useQuery(
		{ patientId: parsedPatientId },
		{ enabled: !!patientId },
	);

	if (!patientId || !configurationQuery.data) {
		return { configuration: null };
	}
	return { configuration: configurationQuery.data };
};
