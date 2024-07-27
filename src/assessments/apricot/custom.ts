import {
	assessmentAdditionalEvaluationSchema,
	assessmentAdvanceDirectivesSchema,
	assessmentDiagnosisSchema,
	assessmentFacilitySchema,
	assessmentHomeHealthAideVisitFrequenciesSchema,
	assessmentMedAdminSchema,
	assessmentMedicationSchema,
	assessmentPlanBuilderSchema,
	assessmentProcedureSchema,
	assessmentSkilledNursingVisitFrequenciesSchema,
	assessmentSupplySchema,
	assessmentVaccinationSchema,
	assessmentVitalSignParamsSchema,
} from '~/server/api/routers/assessment/assessment.inputs';
import { AllAssessmentQuestions, AssessmentQuestionSources, AssessmentQuestionType } from '../types';

export enum CustomSuggesters {
	DIAGNOSIS = 'Diagnosis',
	MEDICATION = 'Medication',
	MEDICATION_ADMINISTRATION = 'MedicationAdministration',
	VACCINATION = 'Vaccination',
	CARE_PLAN = 'CarePlan',
	SUPPLY_LIST = 'SupplyList',
	ADVANCE_DIRECTIVES = 'AdvanceDirectives',
	SKILLED_NURSING_VISIT_FREQUENCIES = 'SkilledNursingVisitFrequencies',
	HOME_HEALTH_AIDE_VISIT_FREQUENCIES = 'HomeHealthAideVisitFrequencies',
	PROCEDURES = 'Procedures',
	ADDITIONAL_EVALUATION = 'AdditionalEvaluation',
	FACILITIES = 'Facilities',
	VITAL_SIGN_PARAMETERS = 'VitalSignParameters',
}

export enum CustomAssessmentNumber {
	VACCINATIONS = 'vaccinations_custom',
	MED_ADMIN = 'med_admin_custom',
	DIAGNOSES = 'diagnoses_custom',
	PLAN_BUILDER = 'plan_builder_custom',
	MEDICATIONS = 'medications_custom',
	SUPPLY_LIST = 'supply_list_custom',
	ADVANCE_DIRECTIVES = 'advance_directives_custom',
	SKILLED_NURSING_VISIT_FREQUENCIES = 'skilled_nursing_visit_frequencies_custom',
	HOME_HEALTH_AIDE_VISIT_FREQUENCIES = 'home_health_aide_visit_frequencies_custom',
	PROCEDURES = 'procedures_custom',
	ADDITIONAL_EVALUATION = 'addon_evaluation_custom',
	FACILITIES = 'facilities_custom',
	VITAL_SIGN_PARAMETERS = 'vital_sign_parameters_custom',
}

export const customAssessmentSchema = {
	[CustomAssessmentNumber.VACCINATIONS]: assessmentVaccinationSchema,
	[CustomAssessmentNumber.MED_ADMIN]: assessmentMedAdminSchema,
	[CustomAssessmentNumber.DIAGNOSES]: assessmentDiagnosisSchema,
	[CustomAssessmentNumber.PLAN_BUILDER]: assessmentPlanBuilderSchema,
	[CustomAssessmentNumber.MEDICATIONS]: assessmentMedicationSchema,
	[CustomAssessmentNumber.PROCEDURES]: assessmentProcedureSchema,
	[CustomAssessmentNumber.SUPPLY_LIST]: assessmentSupplySchema,
	[CustomAssessmentNumber.ADVANCE_DIRECTIVES]: assessmentAdvanceDirectivesSchema,
	[CustomAssessmentNumber.SKILLED_NURSING_VISIT_FREQUENCIES]: assessmentSkilledNursingVisitFrequenciesSchema,
	[CustomAssessmentNumber.HOME_HEALTH_AIDE_VISIT_FREQUENCIES]: assessmentHomeHealthAideVisitFrequenciesSchema,
	[CustomAssessmentNumber.ADDITIONAL_EVALUATION]: assessmentAdditionalEvaluationSchema,
	[CustomAssessmentNumber.FACILITIES]: assessmentFacilitySchema,
	[CustomAssessmentNumber.VITAL_SIGN_PARAMETERS]: assessmentVitalSignParamsSchema,
} as const;

export const customQuestions: AllAssessmentQuestions = [
	{
		id: CustomAssessmentNumber.MEDICATIONS,
		text: 'Medication List',
		mappedType: AssessmentQuestionType.Medication,
		suggestionGenerator: CustomSuggesters.MEDICATION,
		source: AssessmentQuestionSources.Custom,
	},
	{
		id: CustomAssessmentNumber.MED_ADMIN,
		text: 'Medication Administration',
		mappedType: AssessmentQuestionType.MedAdmin,
		suggestionGenerator: CustomSuggesters.MEDICATION_ADMINISTRATION,
		source: AssessmentQuestionSources.Custom,
	},
	{
		id: CustomAssessmentNumber.VACCINATIONS,
		text: 'Vaccinations',
		mappedType: AssessmentQuestionType.Vaccination,
		suggestionGenerator: CustomSuggesters.VACCINATION,
		source: AssessmentQuestionSources.Custom,
	},
	{
		id: CustomAssessmentNumber.DIAGNOSES,
		text: 'Diagnoses',
		mappedType: AssessmentQuestionType.Diagnosis,
		suggestionGenerator: CustomSuggesters.DIAGNOSIS,
		source: AssessmentQuestionSources.Custom,
	},
	{
		id: CustomAssessmentNumber.PROCEDURES,
		text: 'Procedures',
		mappedType: AssessmentQuestionType.Procedures,
		suggestionGenerator: CustomSuggesters.PROCEDURES,
		source: AssessmentQuestionSources.Custom,
	},
	{
		id: CustomAssessmentNumber.PLAN_BUILDER,
		text: 'Care Plan Builder',
		mappedType: AssessmentQuestionType.PlanBuilder,
		suggestionGenerator: CustomSuggesters.CARE_PLAN,
		source: AssessmentQuestionSources.Custom,
	},
	{
		id: CustomAssessmentNumber.SUPPLY_LIST,
		text: 'Supplies',
		mappedType: AssessmentQuestionType.SupplyList,
		suggestionGenerator: CustomSuggesters.SUPPLY_LIST,
		source: AssessmentQuestionSources.Custom,
	},
	{
		id: CustomAssessmentNumber.ADVANCE_DIRECTIVES,
		text: 'Advance Directives',
		mappedType: AssessmentQuestionType.AdvanceDirectives,
		suggestionGenerator: CustomSuggesters.ADVANCE_DIRECTIVES,
		source: AssessmentQuestionSources.Custom,
	},
	{
		id: CustomAssessmentNumber.SKILLED_NURSING_VISIT_FREQUENCIES,
		text: 'Skilled Nursing Visit Frequencies',
		mappedType: AssessmentQuestionType.SkilledNursingVisitFrequencies,
		suggestionGenerator: CustomSuggesters.SKILLED_NURSING_VISIT_FREQUENCIES,
		source: AssessmentQuestionSources.Custom,
	},
	{
		id: CustomAssessmentNumber.ADDITIONAL_EVALUATION,
		text: 'Add-On Evaluations',
		mappedType: AssessmentQuestionType.AdditionalEvaluation,
		suggestionGenerator: CustomSuggesters.ADDITIONAL_EVALUATION,
		source: AssessmentQuestionSources.Custom,
	},
	{
		id: CustomAssessmentNumber.HOME_HEALTH_AIDE_VISIT_FREQUENCIES,
		text: 'Home Health Aide Visit Frequencies',
		mappedType: AssessmentQuestionType.HomeHealthAideVisitFrequencies,
		suggestionGenerator: CustomSuggesters.HOME_HEALTH_AIDE_VISIT_FREQUENCIES,
		source: AssessmentQuestionSources.Custom,
	},
	{
		id: CustomAssessmentNumber.FACILITIES,
		text: 'Related Facilities',
		mappedType: AssessmentQuestionType.Facilities,
		suggestionGenerator: CustomSuggesters.FACILITIES,
		source: AssessmentQuestionSources.Custom,
	},
	{
		id: CustomAssessmentNumber.VITAL_SIGN_PARAMETERS,
		text: 'Select the vital sign notification profile most appropriate for this patient:',
		originalText: 'Vital Sign Parameters',
		mappedType: AssessmentQuestionType.VitalSignParameters,
		suggestionGenerator: CustomSuggesters.VITAL_SIGN_PARAMETERS,
		source: AssessmentQuestionSources.Custom,
	},
];