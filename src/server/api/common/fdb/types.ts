import { z } from 'zod';
import { dispensableDrugSchema, interactionsSchema } from './schema';

export type DispensableDrug = z.infer<typeof dispensableDrugSchema>;

export type Interactions = z.infer<typeof interactionsSchema>;

export type FDBSearchType = 'Contains' | 'StartsWith' | 'TextEqual' | 'All' | 'Exhaustive';
