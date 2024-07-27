import { z } from 'zod';

const clinicalEffectSchema = z.object({
	ClinicalEffectCode: z.string(),
	ClinicalEffectDesc: z.string(),
});

const screenDrugSchema = z.object({
	DrugDose: z.string().nullish(),
	Prospective: z.boolean(),
	DrugDesc: z.string(),
	DrugID: z.string(),
	DrugConceptType: z.number(),
});

const screenResultSchema = z.object({
	ScreenMessage: z.string(),
	ClinicalEffectsNarrative: z.string(),
	ClinicalEffects: z.array(clinicalEffectSchema),
	Severity: z.string(),
	InteractionID: z.number(),
	SeverityDesc: z.string(),
	ScreenDrugs: z.array(screenDrugSchema),
});

const screenNoteSchema = z.object({
	MessageText: z.string(),
});

export const dispensableDrugSchema = z.object({
	// brand name
	DispensableDrugID: z.string(),
	DispensableDrugDesc: z.string(),

	// generic name
	DispensableGenericID: z.string(),
	DispensableGenericDesc: z.string(),

	RouteDesc: z.string(),
	MedStrength: z.string().nullish(),
	MedStrengthUnit: z.string().nullish(),
	DoseFormDesc: z.string(),
});

export const drugSearchResponseSchema = createSearchResponseSchema(dispensableDrugSchema);

export const getDispensableDrugResponseSchema = z.object({ DispensableDrug: dispensableDrugSchema });

export const interactionsSchema = z.object({
	isSuccess: z.boolean(),
	data: z.array(screenResultSchema),
	errors: z.array(screenNoteSchema).optional(),
});

export const screenResponseSchema = z.object({
	DDIScreenResponse: z.object({
		IsSuccessful: z.boolean(),
		DDIScreenResults: z.array(screenResultSchema),
		Notes: z.array(screenNoteSchema).optional(),
	}),
});

export const clinicalQuantitySchema = z.object({
	ClinicalQuantityDesc: z.string(),
	SubUnitOfMeasureDesc: z.string(),
});
export const clinicalQuantitiesResponseSchema = createSearchResponseSchema(clinicalQuantitySchema);

function createSearchResponseSchema<ItemType extends z.ZodTypeAny>(itemSchema: ItemType) {
	return z.object({
		offset: z.number(),
		limit: z.number(),
		TotalResultCount: z.number(),
		Items: z.array(itemSchema),
	});
}
