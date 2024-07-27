/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { Gender, PatientStatus, ProviderType, ReferringPhysician, State } from '@prisma/client';
import { z } from 'zod';
import { requiredString } from '~/common/utils/zod';
import { diagnosesSchema } from '~/server/api/routers/assessment/assessment.inputs';

export const getInfiniteSchema = z.object({
	name: z.string().nullish(),
	limit: z.number().default(10),
	cursor: z.number().nullish(),
	filters: z.record(z.nativeEnum(PatientStatus), z.boolean()).nullish(),
	orderBy: z
		.object({
			field: z.enum([
				'id',
				'name',
				'address',
				'Location.name',
				'Organization.name',
				'SOCVisitCaseManager.name',
				'status',
				'createdAt',
				'updatedAt',
				'SOCVisitDate',
			]),
			sortOrder: z.enum(['asc', 'desc']),
		})
		.nullish(),
});
export type GetInfiniteInput = z.infer<typeof getInfiniteSchema>;

export const getByIdSchema = z.object({
	id: z.number(),
	includes: z.object({
		Organization: z.union([
			z.boolean().default(false),
			z.object({
				include: z.object({
					SkilledNursingServiceCodes: z.boolean().default(false),
					AdditionalEvaluationServiceCodes: z.boolean().default(false),
				}),
			}),
		]),
		PatientArtifacts: z.union([
			z.boolean().default(false),
			z.object({
				include: z.object({
					patientDocumentArtifact: z.object({
						include: z.object({
							paragraphs: z.boolean().default(false),
						}),
					}),
				}),
			}),
		]),
		InterviewQuestion: z.boolean().default(false),
		NurseInterview: z.union([
			z.boolean().default(false),
			z.object({
				include: z.object({
					NurseInterviewThemeSummaries: z.object({
						include: z.object({
							QuestionItems: z.boolean().default(false),
						}),
					}),
				}),
			}),
		]),
		Location: z.boolean().default(false),
		PatientEmergencyContacts: z.boolean().default(false),
		PatientAssociatedPhysicians: z.boolean().default(false),
		PatientReferralSource: z.boolean().default(false),
		PayorSources: z.boolean().default(false),
		NurseConfirmedAssessmentSections: z.boolean().default(false),
		SOCVisitCaseManager: z.boolean().default(false),
	}),
});
export type GetByIdInput = z.infer<typeof getByIdSchema>;

export const deleteByIdSchema = z.object({
	id: z.number(),
});
export type DeleteByIdInput = z.infer<typeof deleteByIdSchema>;

export const getPatientsByStatusSchema = z.object({
	status: z.nativeEnum(PatientStatus),
});
export type GetPatientsByStatusInput = z.infer<typeof getPatientsByStatusSchema>;

const createEmergencyContactSchema = z.object({
	firstName: z.string().nullish(),
	lastName: z.string().nullish(),
	phone: z.string().nullish(),
	relationship: z.string().nullish(),
	type: z.string().array().nullish(),
	homePhone: z.string().nullish(),
	mobilePhone: z.string().nullish(),
	alternatePhone: z.string().nullish(),
	address: z.string().nullish(),
	city: z.string().nullish(),
	state: z.nativeEnum(State).nullish(),
	zip: z.string().nullish(),
	availability: z.string().array().nullish(),
	notes: z.string().nullish(),
});

export type CreateEmergencyContactInput = z.infer<typeof createEmergencyContactSchema>;

const createAssociatedPhysicianSchema = z.object({
	name: z.string().trim().min(1, { message: 'Required' }),
	phone: z.string().trim().length(10, { message: 'Required' }),
	providerType: z.nativeEnum(ProviderType),
	referringPhysician: z.nativeEnum(ReferringPhysician),
	notes: z.string().nullish(),
});

export type CreateAssociatedPhysicianInput = z.infer<typeof createAssociatedPhysicianSchema>;

const createPayorSourceSchema = z.object({
	payorSourceName: z.string().nullish(),
	payorSourceType: z.string().nullish(),
	payorSourceIdentifier: z.string().nullish(),
});
export type CreatePayorSourceInput = z.infer<typeof createPayorSourceSchema>;

const diagnosesSchemaWithOptionalFields = diagnosesSchema.extend({
	symptomControlRating: z.string().nullish(),
	onsetOrExacerbation: z.string().nullish(),
	dateOfOnsetOrExacerbation: z.union([z.string(), z.date()]).nullish(),
});
export type CreateDiagnosesInput = z.infer<typeof diagnosesSchemaWithOptionalFields>;

export const basePatientSchema = z.object({
	EMRIdentifier: requiredString,
	firstName: requiredString,
	middleName: z.string().nullish(),
	lastName: requiredString,
	suffix: z.string().nullish(),
	socialSecurityNumber: z.string().length(9, { message: 'Social Security Number must be 9 digits long' }).nullish(),
	socialSecurityUnknown: z.boolean().nullish(),
	dateOfBirth: z.date(),
	gender: z.nativeEnum(Gender),
	serviceLocationType: requiredString,
	serviceLocationNotes: z.string().nullish(),
	address1: z.string(),
	city: z.string(),
	county: z.string().nullish(),
	state: z.nativeEnum(State),
	zip: z.string(),
	phoneNumber: z.string().length(10, { message: 'Phone number must be 10 digits long' }).nullish(),
	mobilePhoneNumber: z.string().nullish(),
	alternatePhoneNumber: z.string().nullish(),
	contactNotes: z.string().nullish(),
	locationId: z.number(),
	SOCVisitDate: z.date(),
	SOCVisitTime: z.union([z.string(), z.date()]).nullish(),
	physicianOrderedSOCDate: z.date().nullish(),
	physicianOrderedSOCDateNA: z.boolean().nullish(),
	SOCVisitCaseManagerId: z.string().nullish(),
	PatientEmergencyContacts: z.array(createEmergencyContactSchema).nullish(),
	PatientAssociatedPhysicians: z
		.array(createAssociatedPhysicianSchema)
		.nonempty('At least one Associated Provider is required.')
		.nullish(),
	PatientReferralSource: z.object({
		referralDate: z.date().nullish(),
		socDate: z.date().nullish(),
		facilityName: z.string().nullish(),
		facilityType: z.string().nullish(),
		contactName: z.string().nullish(),
		contactPhone: z.string().nullish(),
	}),
	M0150Answer: z.array(z.string(), {
		description: 'Select current payment sources for home care',
	}),
	M0063Answer: z.string().nullish(),
	M0065Answer: z.string().nullish(),
	M0150SpecifyAnswer: z.string().nullish(),
	PayorSources: z.array(createPayorSourceSchema).nullish(),
	checkedResponse: z.object({
		choice: z.object({
			diagnoses: z.array(diagnosesSchemaWithOptionalFields),
		}),
	}),
});

function commonRefinements<T extends z.infer<typeof basePatientSchema>>(schema: z.ZodSchema<T>): z.ZodSchema<T> {
	return schema
		.refine((data) => data.socialSecurityNumber || data.socialSecurityUnknown, {
			message: 'Social Security Number or Social Security Unknown is required.',
			path: ['socialSecurityNumber'],
		})
		.refine((data) => data.phoneNumber || data.mobilePhoneNumber || data.alternatePhoneNumber, {
			message: 'At least one phone number is required.',
			path: ['phoneNumber'],
		})
		.refine((data) => data.physicianOrderedSOCDate || data.physicianOrderedSOCDateNA, {
			message: `Provide physician ordered Start of care date or select "Not Applicable"`,
			path: ['physicianOrderedSOCDate'],
		})
		.refine((data) => data.PatientAssociatedPhysicians?.every((c) => c.phone && c.name), {
			message: `Associated Provider missing one or more required values (First Name, Last Name, Phone Number, Provider Type).`,
			path: ['PatientAssociatedPhysicians.0.notes'],
		})
		.refine(
			(data) => {
				if (data.PatientEmergencyContacts?.length) {
					return data.PatientEmergencyContacts.every(
						(c) =>
							(c.phone || c.mobilePhone || c.homePhone || c.alternatePhone) &&
							c.firstName &&
							c.lastName &&
							c.type,
					);
				}
				return true;
			},
			{
				message: `Emergency contact missing one or more required values (First Name, Last Name, Contact Type, At least one Phone Number).`,
				path: ['PatientEmergencyContacts[0].notes'],
			},
		)
		.refine(
			(data) => {
				if (data.PayorSources?.length) {
					return data.PayorSources.every((c) => c.payorSourceName && c.payorSourceType);
				}
				return true;
			},
			{
				message: `Payor Source missing one or more required values (Payor Source Name and Type).`,
				path: ['PayorSources[0].payorSourceIdentifier'],
			},
		);
}

export const createPatientSchema = commonRefinements(basePatientSchema);

export type CreatePatientInput = z.infer<typeof createPatientSchema>;

const extendedSchema = basePatientSchema.extend({
	id: z.number(),
});

export const updatePatientSchema = commonRefinements(extendedSchema);

export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;

export const assignQAUserToPatientSchema = z.object({
	patientId: z.number(),
	userId: z.string().nullable(),
});

export type AssignQAUserToPatientInput = z.infer<typeof assignQAUserToPatientSchema>;

export const assignDataEntryUserToPatientSchema = z.object({
	patientId: z.number(),
	userId: z.string().nullable(),
});
export type AssignDataEntryUserToPatientInput = z.infer<typeof assignDataEntryUserToPatientSchema>;

export const updatePatientStatus = z.object({
	patientId: z.number(),
	status: z.nativeEnum(PatientStatus),
	nurseSignOffName: z.string().optional(),
});
export type UpdatePatientStatusInput = z.infer<typeof updatePatientStatus>;

export const setPatientStatusAsCompleteSchema = z.object({
	patientId: z.number(),
});
export type SetPatientStatusAsCompleteInput = z.infer<typeof setPatientStatusAsCompleteSchema>;

export const setPatientStatusAsNonAdmitSchema = z.object({
	patientId: z.number(),
});
export type SetPatientStatusAsNonAdmitInput = z.infer<typeof setPatientStatusAsNonAdmitSchema>;

export const setPatientStatusAsNewPatientSchema = z.object({
	patientId: z.number(),
});
export type SetPatientStatusAsNewPatientInput = z.infer<typeof setPatientStatusAsNewPatientSchema>;

export const confirmAssessmentSectionByPatientIdSchema = z.object({
	patientId: z.number(),
	section: z.string(),
});
export type ConfirmAssessmentSectionByPatientIdInput = z.infer<typeof confirmAssessmentSectionByPatientIdSchema>;

export const resetPatientSchema = z.object({
	patientId: z.number(),
});
export type ResetPatientInput = z.infer<typeof resetPatientSchema>;

export const downloadVisitNoteSchema = z.object({
	patientId: z.number(),
	includeExplanations: z.boolean().default(false),
});
export type DownloadVisitNoteInput = z.infer<typeof downloadVisitNoteSchema>;

export const generateTestPatientDataSchema = z.object({
	orgId: z.number(),
	numberOfPatients: z.number(),
	locationId: z.number(),
	caseManagerId: z.string(),
	caseManagerName: z.string().nullable(),
	patientStatus: z.nativeEnum(PatientStatus),
	seedInput: z
		.object({
			seedIds: z.array(z.number()),
		})
		.nullish(),
});
export type GenerateTestPatientDataInput = z.infer<typeof generateTestPatientDataSchema>;
