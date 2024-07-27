import { ConfigurationType } from '@prisma/client';
import { RouterOutputs } from '../../../../../../common/utils/api';
import { Configuration } from '../../../../../configurations';

const MAHC_RISK_ASSESSMENT_PARENT_OASIS_NUMBER = 'AC1997';
export function MAHCRiskAssessmentPrerequisiteCheck(
	answers: RouterOutputs['assessment']['getAllAssessmentQuestionsForPatient'],
	configuration: Configuration,
): boolean {
	if (configuration.configurationType === ConfigurationType.WellSky) {
		return true;
	}
	const displayMAHCRiskAssessmentScore = answers.find(
		(item) =>
			item.assessmentNumber === MAHC_RISK_ASSESSMENT_PARENT_OASIS_NUMBER &&
			(item.checkedResponse as { choice: string })?.choice?.toLowerCase() === 'yes',
	);
	return !!displayMAHCRiskAssessmentScore;
}
