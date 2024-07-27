import { AssessmentAnswer, Prisma } from '@prisma/client';
import { CustomAssessmentNumber } from '~/assessments/apricot/custom';
import { Configuration } from '~/assessments/configurations';
import { AssessmentQuestion } from '~/assessments/types';
import { RpaAssessmentAnswerWithQuestionText, generateAnswer } from '../patient-rpa.utils';
import { generateAddonEvaluationsResponse } from './addonEvaluation';
import { generateAdvanceDirectivesResponse } from './advanceDirectives';
import { generateCarePlanResponse } from './careplan';
import { generateFacilitiesResponse } from './facilities';
import { generateHomeHealthAideVisitFrequencyResponse } from './homeHealthAideVisitFrequency';
import { generateMedAdminResponse } from './medAdmin';
import { generateMedicationResponse } from './medications';
import { generateSkilledNursingVisitFrequencyResponse } from './skilledNursingVisitFrequency';
import { generateSupplyListResponse } from './supplyList';
import { generateVaccinationResponse } from './vaccination';

export const getAssessmentCustomFormResponses = (
	question: AssessmentQuestion,
	assessment: AssessmentAnswer,
	configuration: Configuration,
): RpaAssessmentAnswerWithQuestionText => {
	return generateAnswer(
		assessment.assessmentNumber,
		question.text,
		customFormResponseSwitch(assessment, configuration) as Prisma.JsonValue,
		question.mappedType,
		assessment.integrationStatus,
		assessment.integrationMessage,
	);
};

function customFormResponseSwitch(assessment: AssessmentAnswer, configuration: Configuration) {
	switch (assessment.assessmentNumber as CustomAssessmentNumber) {
		case CustomAssessmentNumber.HOME_HEALTH_AIDE_VISIT_FREQUENCIES:
			return generateHomeHealthAideVisitFrequencyResponse(assessment);

		case CustomAssessmentNumber.SKILLED_NURSING_VISIT_FREQUENCIES:
			return generateSkilledNursingVisitFrequencyResponse(assessment);

		case CustomAssessmentNumber.MEDICATIONS:
			return generateMedicationResponse(assessment);

		case CustomAssessmentNumber.ADDITIONAL_EVALUATION:
			return generateAddonEvaluationsResponse(assessment);
		case CustomAssessmentNumber.PLAN_BUILDER:
			return generateCarePlanResponse(assessment, configuration.pathways, configuration.pathwaysNesting);

		case CustomAssessmentNumber.VACCINATIONS:
			return generateVaccinationResponse(assessment);

		case CustomAssessmentNumber.ADVANCE_DIRECTIVES:
			return generateAdvanceDirectivesResponse(assessment);

		case CustomAssessmentNumber.FACILITIES:
			return generateFacilitiesResponse(assessment);

		case CustomAssessmentNumber.MED_ADMIN:
			return generateMedAdminResponse(assessment);

		case CustomAssessmentNumber.SUPPLY_LIST:
			return generateSupplyListResponse(assessment);

		case CustomAssessmentNumber.VITAL_SIGN_PARAMETERS:
		case CustomAssessmentNumber.DIAGNOSES:
		case CustomAssessmentNumber.PROCEDURES:
			return assessment.checkedResponse;

		default:
			throw new Error('Custom assessment number not found');
	}
}

export function isAssessmentCustomForm(assessmentNumber: string) {
	return Object.values(CustomAssessmentNumber).includes(assessmentNumber as CustomAssessmentNumber);
}
