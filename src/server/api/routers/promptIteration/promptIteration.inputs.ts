import { z } from 'zod';

export enum PromptIterationTestMode {
	PATIENT_SELECT = 'PatientSelect',
	NUMBER_SELECT = 'NumberSelect',
}

export const runBackTestForSuggestionsSchema = z.object({
	assessmentNumber: z.string().min(1),
	sampleSize: z.number().min(1).max(20).default(10),
	patientTestIds: z.array(z.number()).max(20),
	testMode: z.nativeEnum(PromptIterationTestMode),
	templateOverrides: z.object({
		codingInstructions: z.string().nullish(),
		template: z.string().nullish(),
		alternateQuestionText: z.string().optional(),
		hints: z.string().optional(),
		examples: z.string().optional(),
	}),
});
export type RunBackTestForSuggestionsInput = z.infer<typeof runBackTestForSuggestionsSchema>;
