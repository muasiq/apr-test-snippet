import { z } from 'zod';

export const getConfigurationForPatient = z.object({
	patientId: z.number(),
});
export type GetConfigurationForPatient = z.infer<typeof getConfigurationForPatient>;
