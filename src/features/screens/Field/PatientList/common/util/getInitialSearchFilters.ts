import { PatientStatus } from '@prisma/client';

export const getInitialSearchFilters = (): Record<PatientStatus, boolean> => {
	return Object.values(PatientStatus).reduce(
		(acc, status) => {
			acc[status] = false;
			return acc;
		},
		{} as Record<PatientStatus, boolean>,
	);
};
