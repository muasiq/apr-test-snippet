import { PatientStatus } from '@prisma/client';
import { pageHeadingHasAllRelevantQuestionsConfirmed } from '~/assessments/util/assessmentStateUtils';
import { RouterOutputs } from '~/common/utils/api';
import { WOUND_HEADING } from '../../../../../../assessments/apricot/util';
import { Configuration } from '../../../../../../assessments/configurations';
import { NurseInterviewPhysicalAssessmentThemes } from '../../../../../../assessments/nurse-interview/questions';
import { PatientWithJoins } from '../../../../../../server/api/routers/patient/patient.types';

export function isSectionConfirmedByNurse(
	groupHeading: string,
	nurseConfirmedAssessmentSections: RouterOutputs['patient']['getById']['NurseConfirmedAssessmentSections'],
) {
	return !!nurseConfirmedAssessmentSections.find((section) => section.section === groupHeading);
}

export function getStepNumberOfFirstUnfinishedSection(
	assessmentQuestionsForPatient: RouterOutputs['assessment']['getAllAssessmentQuestionsForPatient'] | undefined,
	configuration: Configuration,
	patientData: PatientWithJoins,
): number {
	const unfinishedSection = configuration.qaConfig.find((group) => {
		return !pageHeadingHasAllRelevantQuestionsConfirmed(group.heading, {
			patient: patientData,
			answers: assessmentQuestionsForPatient ?? [],
			configuration,
		});
	});

	return unfinishedSection ? configuration.qaConfig.indexOf(unfinishedSection) + 1 : 1;
}

export function getAllAssessmentGroupsOrderedForPatient(
	patientData: PatientWithJoins,
	configuration?: Configuration | null,
) {
	if (!configuration) return [];
	const shouldIncludeWoundsGroup = patientData.NurseInterview?.selectedThemesToReportOn.includes(
		NurseInterviewPhysicalAssessmentThemes.Wounds,
	);

	if (shouldIncludeWoundsGroup) {
		return configuration.qaConfig;
	}

	return configuration.qaConfig.filter((group) => group.heading !== WOUND_HEADING);
}

export function shouldDisableAssessmentSubHeadingsOrSubGroups(isFieldAppView: boolean, patientData: PatientWithJoins) {
	if (isFieldAppView) return false;

	return patientData.status === PatientStatus.SignoffNeeded;
}
