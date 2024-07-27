import { z } from 'zod';

export const patientStatsSchema = z.object({
	from: z.date(),
	to: z.date(),
});
export type PatientStats = z.infer<typeof patientStatsSchema>;
