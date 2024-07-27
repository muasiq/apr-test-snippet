import { z } from 'zod';

export const searchMedicationSchema = z.object({
	term: z.string().min(2),
	limit: z.number().max(400).default(100),
	offset: z.number().default(0),
});

export type SearchMedication = z.infer<typeof searchMedicationSchema>;

export const getDispensableDrug = z.object({
	id: z.string(),
	include: z
		.object({
			availableDoseUnits: z.boolean().default(false),
		})
		.optional(),
});

export type GetDispensableDrug = z.infer<typeof getDispensableDrug>;
