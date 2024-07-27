import { AutoCalculateFieldResolver } from '../../../util/autoCalculateFieldsUtil';
import { allOasisQuestions } from '../../data-files/index';

export enum BimsAssessmentQuestions {
	C0200 = 'C0200',
	C0300A = 'C0300A',
	C0300B = 'C0300B',
	C0300C = 'C0300C',
	C0400A = 'C0400A',
	C0400B = 'C0400B',
	C0400C = 'C0400C',
}
export const BIMS_ASSESSMENT_PARENT_OASIS_NUMBER = 'C0100';

export const shouldDisplayBimsAssessmentQuestion = (assessmentData: AutoCalculateFieldResolver['assessmentData']) => {
	const doesBimsAssessmentParentExist = allOasisQuestions.find(
		(item) => item.id === BIMS_ASSESSMENT_PARENT_OASIS_NUMBER,
	);

	if (!doesBimsAssessmentParentExist) {
		console.error(`${BIMS_ASSESSMENT_PARENT_OASIS_NUMBER} does not exist for BimsAssessment`);
		return false;
	}

	return assessmentData.find(
		(item) =>
			item.assessmentNumber === BIMS_ASSESSMENT_PARENT_OASIS_NUMBER && item.checkedResponse?.choice === 'Yes',
	);
};
