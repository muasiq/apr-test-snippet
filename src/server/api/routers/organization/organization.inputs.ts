import { ConfigurationType, State } from '@prisma/client';
import { SuperRefinement, z } from 'zod';
export const createLocation = z.object({
	name: z.string(),
});
export type CreateLocationInput = z.infer<typeof createLocation>;

export const updateOrgConfigurationType = z.object({
	configurationType: z.nativeEnum(ConfigurationType),
});

export const updateEmailDomains = z.object({
	emailDomains: z.array(z.string()),
});

const attachmentTypeSchema = z.object({
	description: z.string().min(2),
	type: z.string().min(2),
	location: z.string().min(2),
	notes: z.string().nullish(),
	requiredForSOC: z.boolean().default(false),
});

export const attachmentTypeUpdateSchema = attachmentTypeSchema.extend({ id: z.number().nullish() });
export type AttachmentTypeUpdateInput = z.infer<typeof attachmentTypeUpdateSchema>;

export const deleteAttachmentType = z.object({ id: z.number() });
export type DeleteAttachmentTypeInput = z.infer<typeof deleteAttachmentType>;

export const visitNoteAttachmentTypeUpdateSchema = attachmentTypeSchema.pick({ location: true, type: true });
export type VisitNoteAttachmentTypeInput = z.infer<typeof visitNoteAttachmentTypeUpdateSchema>;

export const loginProfileSchema = z.object({
	firstName: z.string().min(1),
	lastName: z.string().min(1),
	hchbUsername: z.string().min(1),
	hchbPassword: z.string().min(1),
	pointcareUserId: z
		.string()
		.refine((value) => Number.isInteger(Number(value)), { message: 'Pointcare User ID must be a number' }),
	pointcarePassword: z.string().min(1),
	inUse: z.boolean().default(false),
	mainLogin: z.boolean().default(false),
});

export type LoginProfileFormData = z.infer<typeof loginProfileSchema>;

export const deleteLoginProfile = z.object({
	id: z.number(),
});
export type DeleteLoginProfileInput = z.infer<typeof deleteLoginProfile>;

export const locationUpdate = z.object({
	name: z.string(),
	cmsBranchId: z.string().nullish(),
	state: z.nativeEnum(State).nullish(),
});

export type LocationUpdateInput = z.infer<typeof locationUpdate>;

export const deleteLocation = z.object({
	id: z.number(),
});
export type LocationDeleteInput = z.infer<typeof deleteLocation>;

export const vitalSignSchema = z.object({
	temperatureMin: z.number().nullish(),
	temperatureMax: z.number().nullish(),
	pulseMin: z.number().nullish(),
	pulseMax: z.number().nullish(),
	respirationsMin: z.number().nullish(),
	respirationsMax: z.number().nullish(),
	bloodPressureSystolicMin: z.number().nullish(),
	bloodPressureSystolicMax: z.number().nullish(),
	bloodPressureDiastolicMin: z.number().nullish(),
	bloodPressureDiastolicMax: z.number().nullish(),
	oxygenSaturationMin: z.number().nullish(),
	oxygenSaturationMax: z.number().nullish(),
	fastingBloodSugarMin: z.number().nullish(),
	fastingBloodSugarMax: z.number().nullish(),
	randomBloodSugarMin: z.number().nullish(),
	randomBloodSugarMax: z.number().nullish(),
	weightMin: z.number().nullish(),
	weightMax: z.number().nullish(),
	painLevelMin: z.number().nullish(),
	painLevelMax: z.number().nullish(),
	inrLevelMin: z.number().nullish(),
	inrLevelMax: z.number().nullish(),
	prothrombinTimeMin: z.number().nullish(),
	prothrombinTimeMax: z.number().nullish(),
	ankleCircumferenceMin: z.number().nullish(),
	ankleCircumferenceMax: z.number().nullish(),
	calfCircumferenceMin: z.number().nullish(),
	calfCircumferenceMax: z.number().nullish(),
	girthMin: z.number().nullish(),
	girthMax: z.number().nullish(),
	headCircumferenceMin: z.number().nullish(),
	headCircumferenceMax: z.number().nullish(),
	instepCircumferenceMin: z.number().nullish(),
	instepCircumferenceMax: z.number().nullish(),
	thighCircumferenceMin: z.number().nullish(),
	thighCircumferenceMax: z.number().nullish(),
});
export type VitalSignInput = z.infer<typeof vitalSignSchema>;

export const vitalSignSchemaRefine: SuperRefinement<VitalSignInput> = (value, ctx) => {
	for (const [key, val] of Object.entries(value)) {
		if (!val || !key.endsWith('Max')) continue;
		const paramName = key.replace(/Max$/, '');
		const minKey = `${paramName}Min` as keyof VitalSignInput;
		const minValue = value[minKey];
		if (minValue && minValue >= val) {
			ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Min must be less than Max', path: [minKey] });
			ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Min must be less than Max', path: [key] });
		}
	}
};

export const vitalSignConfigSchema = vitalSignSchema
	.extend({ name: z.string().min(1) })
	.superRefine(vitalSignSchemaRefine);
export type VitalSignConfigInput = z.infer<typeof vitalSignConfigSchema>;

export const vitalSignConfigUpdateSchema = vitalSignSchema
	.extend({ id: z.number(), name: z.string().min(1) })
	.superRefine(vitalSignSchemaRefine);
export type VitalSignConfigUpdateInput = z.infer<typeof vitalSignConfigUpdateSchema>;

export const vitalSignConfigFormSchema = z.object({
	configs: z.array(
		vitalSignSchema
			.extend({ id: z.number().nullish(), name: z.string().min(1) })
			.superRefine(vitalSignSchemaRefine),
	),
});
export type VitalSignConfigFormInput = z.infer<typeof vitalSignConfigFormSchema>;
export type VitalSignConfigFormState = {
	vitalSignConfigs: VitalSignConfigInput[];
};

export const vitalSignConfigDeleteSchema = z.object({ id: z.number() });
export type VitalSignConfigDeleteInput = z.infer<typeof vitalSignConfigDeleteSchema>;

export const associatedPhysicianSchema = z.object({ name: z.string() });
export type AssociatedPhysicianInput = z.infer<typeof associatedPhysicianSchema>;

export const getAssociatedPhysiciansSchema = z.object({
	page: z.number(),
	pageSize: z.number(),
	searchText: z.string().nullish(),
	sortBy: z.enum(['name', 'updatedAt', 'id']).default('updatedAt'),
	sortDirection: z.enum(['asc', 'desc']).default('desc'),
});

export type GetAssociatedPhysiciansInput = z.infer<typeof getAssociatedPhysiciansSchema>;

export const updateAssociatedPhysician = associatedPhysicianSchema.extend({
	id: z.number(),
});
export type UpdateAssociatedPhysicianInput = z.infer<typeof updateAssociatedPhysician>;

export const removeAssociatedPhysician = z.object({
	id: z.number(),
});
export type RemoveAssociatedPhysicianInput = z.infer<typeof removeAssociatedPhysician>;

export const associatedFacilitySchema = z.object({
	name: z.string(),
	street: z.string(),
	city: z.string(),
	state: z.nativeEnum(State),
	zip: z.string(),
	phone: z.string().nullish(),
	fax: z.string().nullish(),
	facilityType: z.string(),
});
export type AssociatedFacilityInput = z.infer<typeof associatedFacilitySchema>;

export const getAssociatedFacilitiesSchema = z.object({
	page: z.number(),
	pageSize: z.number(),
	searchText: z.string().nullish(),
	sortBy: z.enum(['name', 'updatedAt', 'id']).default('updatedAt'),
	sortDirection: z.enum(['asc', 'desc']).default('desc'),
});

export type GetAssociatedFacilitiesInput = z.infer<typeof getAssociatedFacilitiesSchema>;

export const updateAssociatedFacility = associatedFacilitySchema.extend({
	id: z.number(),
});
export type UpdateAssociatedFacilityInput = z.infer<typeof updateAssociatedFacility>;

export const removeAssociatedFacility = z.object({
	id: z.number(),
});
export type RemoveAssociatedFacilityInput = z.infer<typeof removeAssociatedFacility>;

export const supplySchema = z.object({
	package: z.string(),
	category: z.string(),
	vendor: z.string(),
});
export type SupplyInput = z.infer<typeof supplySchema>;

export const getSuppliesSchema = z.object({
	page: z.number(),
	pageSize: z.number(),
	searchText: z.string().nullish(),
	sortBy: z.enum(['name', 'updatedAt', 'id']).default('updatedAt'),
	sortDirection: z.enum(['asc', 'desc']).default('desc'),
});
export type GetSuppliesInput = z.infer<typeof getSuppliesSchema>;

export const updateSupplySchema = supplySchema.extend({
	id: z.number(),
});
export type UpdateSupplyInput = z.infer<typeof updateSupplySchema>;

export const removeSupply = z.object({
	id: z.number(),
});
export type RemoveSupplyInput = z.infer<typeof removeSupply>;

const physicalAssessmentCategorySchema = z.object({
	name: z.string(),
});

export const physicalAssessmentCategoryUpdateSchema = physicalAssessmentCategorySchema;
export type PhysicalAssessmentCategoryUpdateInput = z.infer<typeof physicalAssessmentCategoryUpdateSchema>;

export const physicalAssessmentCategoryDeleteSchema = z.object({
	id: z.number(),
});
export type PhysicalAssessmentCategoryDeleteInput = z.infer<typeof physicalAssessmentCategoryDeleteSchema>;

export const physicalAssessmentCategoryFormSchema = z.object({
	categories: z.array(physicalAssessmentCategorySchema),
});

export type PhysicalAssessmentCategoryFormState = z.infer<typeof physicalAssessmentCategoryFormSchema>;

const skilledNursingServiceCodeSchema = z.object({
	code: z.string().min(1),
	description: z.string().min(1),
});

export const skilledNursingServiceCodeUpdateSchema = skilledNursingServiceCodeSchema;
export type SkilledNursingServiceCodeUpdateInput = z.infer<typeof skilledNursingServiceCodeUpdateSchema>;

export const skilledNursingServiceCodeDeleteSchema = z.object({
	id: z.number(),
});
export type SkilledNursingServiceCodeDeleteInput = z.infer<typeof skilledNursingServiceCodeDeleteSchema>;

export const skilledNursingServiceCodeFormSchema = z.object({
	codes: z.array(skilledNursingServiceCodeSchema),
});

export type SkilledNursingServiceCodeFormState = z.infer<typeof skilledNursingServiceCodeFormSchema>;

const additionalEvaluationServiceCodeSchema = z.object({
	code: z.string().min(1),
	description: z.string().min(1),
	discipline: z.string().min(1),
});

export const additionalEvaluationServiceCodeUpdateSchema = additionalEvaluationServiceCodeSchema;
export type AdditionalEvaluationServiceCodeUpdateInput = z.infer<typeof additionalEvaluationServiceCodeUpdateSchema>;

export const additionalEvaluationServiceCodeDeleteSchema = z.object({
	id: z.number(),
});
export type AdditionalEvaluationServiceCodeDeleteInput = z.infer<typeof additionalEvaluationServiceCodeDeleteSchema>;

export const additionalEvaluationServiceCodeFormSchema = z.object({
	codes: z.array(additionalEvaluationServiceCodeSchema),
});

export type AdditionalEvaluationServiceCodeFormState = z.infer<typeof additionalEvaluationServiceCodeFormSchema>;

export const additionalDropdownConfigurationSchema = z.object({
	attachmentOptions: z.array(z.string().min(1)).min(1),
	attachmentLocations: z.array(z.string().min(1)).min(1),
	serviceLocations: z.array(z.string().min(1)).min(1),
	patientContactRelationship: z.array(z.string().min(1)).min(1),
	patientContactAvailability: z.array(z.string().min(1)).min(1),
	payorType: z.array(z.string().min(1)).min(1),
	facilityType: z.array(z.string().min(1)).min(1),
	advanceDirectiveType: z.array(z.string().min(1)).min(1),
	advanceDirectiveContents: z.array(z.string().min(1)).min(1),
	emergencyContactType: z.array(z.string()).default([]),
	supplyDeliveryMethod: z.array(z.string().min(1)).min(1),
	vaccinationType: z.array(z.string().min(1)).min(1),
	vaccinationSource: z.array(z.string().min(1)).min(1),
	medicationFrequency: z.array(z.string().min(1)).min(1),
	medicationRoute: z.array(z.string().min(1)).min(1),
	additionalMedicationDescriptors: z.array(z.string().min(1)).min(1),
});
export type AdditionalDropdownConfigurationInput = z.infer<typeof additionalDropdownConfigurationSchema>;
