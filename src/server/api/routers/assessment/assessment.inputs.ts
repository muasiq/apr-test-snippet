import { ConfigurationType, State } from '@prisma/client';
import { z } from 'zod';
import { daysOfWeekOptions, frequencyOptions, getDaysFromFrequency } from '~/assessments/util/visitFrequencyUtil';
import { isListedMedication } from '~/common/utils/medication';
import { FdbDrugType, MedicationDescriptorType, medStatuses } from '../../../../common/constants/medication';
import { interactionsSchema } from '../../common/fdb/schema';
import { vitalSignSchema, vitalSignSchemaRefine } from '../organization/organization.inputs';

const assessmentSelectAllThatApplySchema = z.object({
	choice: z.array(z.string()),
});

export const assessmentFreeFormSchema = z.object({
	choice: z.union([z.string(), z.date(), z.number()]),
});
export type AssessmentFreeForm = z.infer<typeof assessmentFreeFormSchema>;

const medicationSchema = z
	.object({
		configurationType: z.nativeEnum(ConfigurationType).default(ConfigurationType.HomeCareHomeBase),
		name: z.string().min(1, { message: 'Required' }),
		dose: z.string().nullish(),
		doseAmount: z.number().nullish(),
		doseUnit: z.string().min(1, { message: 'Required' }),
		startDate: z.union([z.date(), z.string()]),
		endDate: z.union([z.date(), z.string()]).nullish(),
		status: z.enum(medStatuses),
		agencyAdministered: z.enum(['Yes', 'No']).nullish(), // deprecated for additionalMedicationDescriptors
		additionalDescriptors: z
			.array(z.nativeEnum(MedicationDescriptorType))
			.min(1, 'Please select at least one option')
			.refine((data) => !data.includes(MedicationDescriptorType.NONE) || data.length <= 1, {
				message: 'Cannot select "None of These" with other options',
			}),
		instructions: z.string().nullish(),
		route: z.string().min(1, { message: 'Required' }),
		alternativeRoute: z.string().nullish(),
		frequency: z.string().min(1, { message: 'Required' }),
		reason: z.string().nullish(),
		notes: z.string().nullish(),
		classification: z.string().nullish(),
		strength: z.string().nullish(),
		fdb: z
			.object({
				type: z.nativeEnum(FdbDrugType).default(FdbDrugType.DISPENSABLE_DRUG),
				id: z.string(),
				name: z.string(),
				availableDoseUnits: z.array(z.string()).optional(),
			})
			.nullish(),
		understanding: z
			.array(z.string().trim().min(1))
			.min(1, 'Please select at least one option')
			.refine((data) => !data.includes('None of These') || data.length <= 1, {
				message: 'Cannot select "None of These" with other options',
			}),
		understandingNotes: z.string().nullish(),
	})
	.refine(
		(data) => {
			// strength required for unlisted medication
			const isListed = isListedMedication(data);
			if (!isListed && !data.strength) {
				return false;
			}
			return true;
		},
		{ message: 'Required', path: ['strength'] },
	)
	.refine(
		(data) => {
			const isRequired = data.doseUnit === 'Per instructions' || data.frequency === 'As directed';
			if (isRequired && !data.instructions) {
				return false;
			}
			return true;
		},
		{ message: 'Required', path: ['instructions'] },
	)
	.refine(
		(data) => {
			const isRequired = data.doseUnit !== 'Per instructions';
			if (isRequired && !Number.isFinite(data.doseAmount)) {
				return false;
			}
			return true;
		},
		{ message: 'Required', path: ['doseAmount'] },
	)
	.refine(
		(data) => {
			const isRequired = data.frequency === 'As needed' || data.frequency.includes('PRN');
			if (isRequired && !data.reason) {
				return false;
			}
			return true;
		},
		{ message: 'Required', path: ['reason'] },
	);

export type MedicationSchema = z.infer<typeof medicationSchema>;

export const assessmentMedicationSchema = z.object({
	choice: z.object({
		medications: z.array(medicationSchema),
	}),
	interactions: z
		.discriminatedUnion('verified', [
			z.object({ verified: z.literal(false), data: interactionsSchema.shape.data }),
			z.object({
				verified: z.literal(true),
				data: interactionsSchema.shape.data,
				verifiedBy: z.string(),
				verifiedAt: z.union([z.date(), z.string()]),
			}),
		])
		.optional(),
});

export type AssessmentMedicationSchema = z.infer<typeof assessmentMedicationSchema>;

const supplySchema = z
	.object({
		category: z.string(),
		orderNeeded: z.enum(['Yes', 'No']),
		package: z.string().nullish(),
		deliveryMethod: z.string().nullish(),
		quantityToOrder: z.number().int().min(1).nullish(),
		quantityDelivered: z.number().int().min(0).nullish(),
	})
	.refine((data) => !(data.orderNeeded === 'Yes' && !data.package), {
		message: 'Required',
		path: ['package'],
	})
	.refine((data) => !(data.orderNeeded === 'Yes' && !data.deliveryMethod), {
		message: 'Required',
		path: ['deliveryMethod'],
	});
export const assessmentSupplySchema = z.object({
	choice: z.object({
		supplies: z.array(supplySchema),
	}),
});

export const informationLeftWithCaregiverOptions = ['N/A', 'Yes', 'No'] as const;
const advancedDirectiveSchema = z.object({
	type: z.string().min(1),
	location: z.string().trim().min(1),
	contents: z.array(z.string().min(1)),
	contactName: z.string().nullish(),
	contactPhone: z.string().nullish(),
	informationLeftWithCaregiver: z.enum(informationLeftWithCaregiverOptions),
});
export type AdvancedDirective = z.infer<typeof advancedDirectiveSchema>;

const skilledNursingVisitFrequencySchema = z.object({
	serviceCode: z.array(z.string()).min(1),
	frequency: z.enum(frequencyOptions),
	numberOfWeeks: z.number().int().min(1).max(9),
	daysOfWeek: z.array(z.enum(daysOfWeekOptions)).min(1),
	startDate: z.union([z.date(), z.string().min(1)], { message: 'Start date is required' }),
	endDate: z.union([z.date(), z.string().min(1)], { message: 'End date is required' }),
});
export type SkilledNursingVisitFrequencySchema = z.infer<typeof skilledNursingVisitFrequencySchema>;

const homeHealthAideVisitFrequencySchema = skilledNursingVisitFrequencySchema.omit({ serviceCode: true });
export type HomeHealthAideVisitFrequencySchema = z.infer<typeof homeHealthAideVisitFrequencySchema>;

export const assessmentHomeHealthAideVisitFrequenciesSchema = z.object({
	choice: z.object({
		homeHealthAideVisitFrequencies: z.array(
			homeHealthAideVisitFrequencySchema.refine(
				({ frequency, startDate, endDate, daysOfWeek }) => {
					const actualDays = getDaysFromFrequency(frequency, new Date(startDate), new Date(endDate));
					return actualDays.length === daysOfWeek.length;
				},
				{ message: 'Days of week must match frequency', path: ['daysOfWeek'] },
			),
		),
	}),
});

export const assessmentAdvanceDirectivesSchema = z.object({
	choice: z.object({
		advanceDirectives: z.array(advancedDirectiveSchema),
	}),
});

export const diagnosesSchema = z.object({
	diagnosisCode: z.string().min(1),
	diagnosisDescription: z.string().min(1),
	symptomControlRating: z.string().min(1),
	onsetOrExacerbation: z.string().min(1),
	dateOfOnsetOrExacerbation: z.union([z.string().min(1), z.date()]),
});
export type DiagnosesInput = z.infer<typeof diagnosesSchema>;

export const assessmentDiagnosisSchema = z.object({
	choice: z.object({
		diagnoses: z.array(diagnosesSchema),
	}),
});
export type AssessmentDiagnosisInput = z.infer<typeof assessmentDiagnosisSchema>;

const procedureSchema = z.object({
	procedureCode: z.string().min(1),
	procedureDescription: z.string().min(1),
	onsetOrExacerbation: z.string().min(1),
	dateOfOnsetOrExacerbation: z.union([z.string().min(1), z.date()]),
});

export const assessmentProcedureSchema = z.object({
	choice: z.object({
		procedures: z.array(procedureSchema),
	}),
});

const additionalEvaluationSchema = z.object({
	serviceCode: z.string(),
	discipline: z.string().nullish(),
	date: z.union([z.string(), z.date()]),
});
export type AdditionalEvaluationInput = z.infer<typeof additionalEvaluationSchema>;

export const assessmentAdditionalEvaluationSchema = z.object({
	choice: z.object({ addonEvaluations: z.array(additionalEvaluationSchema) }),
});

const problemItemSchema = z.object({
	name: z.string().min(1, { message: 'Required' }),
	goalDetails: z.string(),
	interventionDetails: z.string(),
});

export const assessmentPlanBuilderSchema = z.object({
	choice: z.object({
		areas: z
			.array(
				z.object({
					category: z.string(),
					problems: z.array(problemItemSchema).min(1),
				}),
			)
			.min(1, { message: 'Required' }),
	}),
});
export type AssessmentPlanBuilder = z.infer<typeof assessmentPlanBuilderSchema>;

const interventionsPerformedDuringVisitDetailsSchema = z.object({
	intervention: z.string().min(1),
	response: z.string().min(1),
	performedOn: z.array(z.string().min(1)),
	completedDuringVisit: z.string().min(1),
	notes: z.string().min(1),
});
export type InterventionsPerformedDuringVisitDetails = z.infer<typeof interventionsPerformedDuringVisitDetailsSchema>;

export const assessmentMedAdminSchema = z.object({
	choice: z.object({
		med_administer_records: z.array(
			z.object({
				name: z.string(),
				time: z.union([z.string(), z.date()]).optional(),
				dose: z.string().optional(),
				route: z.string().optional(),
				frequency: z.string().optional(),
				prnReason: z.string().optional(),
				location: z.string().optional(),
				patientResponse: z.array(z.string()).optional(),
				comment: z.string().optional(),
			}),
		),
	}),
});

export const assessmentVaccinationSchema = z.object({
	choice: z.object({
		vaccines: z.array(
			z.object({
				vaccineType: z
					.string({ invalid_type_error: 'Vaccine type is required' })
					.min(1, { message: 'Vaccine type is required' }),
				administeredBy: z.string().trim().min(1, 'Administered by field is required'),
				administerDate: z.union([z.date(), z.string().min(1, 'Administer date is required')]),
				notes: z.string().nullish(),
			}),
		),
	}),
});

export const assessmentSkilledNursingVisitFrequenciesSchema = z.object({
	choice: z.object({
		skilledNursingVisitFrequencies: z
			.array(
				skilledNursingVisitFrequencySchema.refine(
					({ frequency, startDate, endDate, daysOfWeek }) => {
						const actualDays = getDaysFromFrequency(frequency, new Date(startDate), new Date(endDate));
						return actualDays.length === daysOfWeek.length;
					},
					{ message: 'Days of week must match frequency', path: ['daysOfWeek'] },
				),
			)
			.min(1, { message: 'Please add at least one skilled nursing visit frequency' }),
	}),
});
export type AssessmentSkilledNursingVisitFrequencies = z.infer<typeof assessmentSkilledNursingVisitFrequenciesSchema>;

const facilitySchema = z.object({
	type: z.string().trim().min(1),
	name: z.string().trim().min(1),
	address: z.string().nullish(),
	city: z.string().nullish(),
	state: z.nativeEnum(State, { invalid_type_error: 'Select a valid state' }).nullish(),
	contactName: z.string().nullish(),
	phone: z.string().length(10).nullish(),
	fax: z.string().length(10).nullish(),
});
export type FacilityInput = z.infer<typeof facilitySchema>;

export const assessmentFacilitySchema = z.object({
	choice: z.object({
		facilities: z.array(facilitySchema),
	}),
});
export type AssessmentFacilityInput = z.infer<typeof assessmentFacilitySchema>;

export const assessmentVitalSignParamsSchema = z.object({
	choice: z.object({
		vitalSignParameters: vitalSignSchema
			.extend({ profile: z.union([z.enum(['Custom']), z.number().int()]).nullish() })
			.superRefine(vitalSignSchemaRefine),
	}),
});
export type AssessmentVitalSignParams = z.infer<typeof assessmentVitalSignParamsSchema>;

export const checkedResponseUnion = z.union([
	assessmentSelectAllThatApplySchema,
	assessmentFreeFormSchema,
	assessmentMedicationSchema,
	assessmentMedAdminSchema,
	assessmentVaccinationSchema,
	assessmentDiagnosisSchema,
	assessmentPlanBuilderSchema,
	assessmentSupplySchema,
	assessmentAdvanceDirectivesSchema,
	assessmentSkilledNursingVisitFrequenciesSchema,
	assessmentHomeHealthAideVisitFrequenciesSchema,
	assessmentProcedureSchema,
	assessmentAdditionalEvaluationSchema,
	assessmentFacilitySchema,
	assessmentVitalSignParamsSchema,
]);

export type CheckedResponseUnion = z.infer<typeof checkedResponseUnion>;

export const assessmentCheckSchema = z.object({
	patientId: z.number(),
	assessmentNumber: z.string(),
	skipGeneratedGuess: z.boolean().optional().default(false),
	checkedResponse: checkedResponseUnion,
});
export type AssessmentCheckInput = z.infer<typeof assessmentCheckSchema>;

export const verifyMedicationInteractionsAssessmentSchema = z.object({
	patientId: z.number(),
});
export type VerifyMedicationInteractionsAssessmentInput = z.infer<typeof verifyMedicationInteractionsAssessmentSchema>;

export const unicornButton = z.object({ patientId: z.number() });
export type UnicornButtonInput = z.infer<typeof unicornButton>;

export const getAllAssessmentQuestionsForPatientSchema = z.object({
	patientId: z.number(),
	assessmentNumbers: z.array(z.string()).optional(),
});
export type GetAllAssessmentQuestionsForPatientInput = z.infer<typeof getAllAssessmentQuestionsForPatientSchema>;

export const generateAssessmentAnswer = z.object({
	patientId: z.number(),
	assessmentNumber: z.string(),
	retry: z.boolean().optional(),
});
export type GenerateAssessmentAnswerInput = z.infer<typeof generateAssessmentAnswer>;

export const generateAllAssessmentSuggestionsForPatient = z.object({
	patientId: z.number(),
});
export type GenerateAllAssessmentSuggestionsForPatientInput = z.infer<
	typeof generateAllAssessmentSuggestionsForPatient
>;

export const getAssessmentQuestionForPatients = z.object({
	patientIds: z.array(z.number()).min(1),
	assessmentNumber: z.string().min(1),
});
export type GetAssessmentQuestionForPatientsInput = z.infer<typeof getAssessmentQuestionForPatients>;

export const getAssessmentQuestionForPatient = z.object({
	patientId: z.number(),
	assessmentNumber: z.string().min(1),
});
export type GetAssessmentQuestionForPatientInput = z.infer<typeof getAssessmentQuestionForPatient>;
