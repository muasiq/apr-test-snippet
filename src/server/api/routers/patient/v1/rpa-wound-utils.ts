import { AssessmentAnswer, Gender } from '@prisma/client';
import { Configuration } from '~/assessments/configurations';
import hchbWoundLocationMap from '~/assessments/home-care-home-base/data-files/hchb-wound-location-pickers.json';
import woundLocationCoordinates from '~/assessments/home-care-home-base/data-files/wound-location-coordinates.json';
import woundRegionCoordinates from '~/assessments/home-care-home-base/data-files/wound-region-coordinates.json';
import { AssessmentQuestionType } from '~/assessments/types';
import { lookupQuestion, recursivelyGetAllQuestionsAndFollowUps } from '~/assessments/util/lookupQuestionUtil';
import { resolveIdAndMultipleIndex } from '~/common/utils/resolveIdAndMultipleIndex';
import { CheckedResponseUnion } from '../../assessment/assessment.inputs';
import { RpaAssessmentAnswerWithQuestionText, generateAnswer } from './patient-rpa.utils';

export const ROOT_WOUND_QUESTION_ID = 'MQ6BB554AY';
const LOCATION_QUESTION_TEXT = 'Indicate the wound location.';

export function generateWoundMappedResponse(
	assessmentAnswers: AssessmentAnswer[],
	configuration: Configuration,
	gender?: Gender | null,
): { relevantWoundAssessmentNumbers: string[]; woundMappedResponses: RpaAssessmentAnswerWithQuestionText[] } {
	const rootQuestion = configuration.allQuestions.find((q) => q.id === ROOT_WOUND_QUESTION_ID);

	if (!gender || !rootQuestion) return { relevantWoundAssessmentNumbers: [], woundMappedResponses: [] };

	const locationResponseIds = recursivelyGetAllQuestionsAndFollowUps([rootQuestion], configuration).map((q) => q.id);
	const relevantWoundAssessments = assessmentAnswers.filter((a) => {
		const { resolvedQuestionId } = resolveIdAndMultipleIndex(a.assessmentNumber);
		return locationResponseIds.includes(resolvedQuestionId) || resolvedQuestionId === rootQuestion.id;
	});

	const woundMappedResponses = relevantWoundAssessments
		.filter(
			(qs) =>
				qs.assessmentNumber.startsWith(rootQuestion.id) &&
				typeof (qs.checkedResponse as CheckedResponseUnion)?.choice === 'string',
		)
		.flatMap((assessment) => {
			const { index } = resolveIdAndMultipleIndex(assessment.assessmentNumber);
			if (!index) return [];
			const locationResponse = relevantWoundAssessments.find((item) => {
				const { resolvedQuestionId, index: findIndex } = resolveIdAndMultipleIndex(item.assessmentNumber);
				const lookedUpQuestion = lookupQuestion(resolvedQuestionId, configuration);
				return lookedUpQuestion && lookedUpQuestion.text === LOCATION_QUESTION_TEXT && findIndex === index;
			});

			if (!locationResponse?.checkedResponse) return [];

			const region = (assessment.checkedResponse as CheckedResponseUnion).choice;
			const location = (locationResponse.checkedResponse as CheckedResponseUnion).choice;

			const hchbItem = hchbWoundLocationMap.find(
				(item) =>
					item.ApricotRegion === region && item.ApricotAnswerChoice === location && item.Gender === gender,
			);

			if (!hchbItem) return [];

			const { HCHBRegion, HCHBLocation, HCHBView } = hchbItem;

			const regionCoordinates = woundRegionCoordinates.find(
				(item) => item.Region === HCHBRegion && item.View === HCHBView,
			);
			const locationCoordinates = woundLocationCoordinates.find(
				(item) => item.Location === HCHBLocation && item.View === HCHBView,
			);

			return [
				generateAnswer(
					`hchb_wound_view-#${index}`,
					`Wound View ${index}`,
					HCHBView,
					AssessmentQuestionType.SelectOne,
				),
				generateAnswer(
					`hchb_wound_region-#${index}`,
					`Wound Region ${index}`,
					HCHBRegion,
					AssessmentQuestionType.SelectOne,
				),
				generateAnswer(
					`hchb_wound_location-#${index}`,
					`Wound Location ${index}`,
					HCHBLocation,
					AssessmentQuestionType.SelectOne,
				),
				generateAnswer(
					`hchb_wound_region_coordinates-#${index}`,
					'Wound Region Coordinates',
					{ x: regionCoordinates?.x ?? null, y: regionCoordinates?.y ?? null },
					AssessmentQuestionType.EmbeddedObject,
				),
				generateAnswer(
					`hchb_wound_location_coordinates-#${index}`,
					'Wound Location Coordinates',
					{ x: locationCoordinates?.x ?? null, y: locationCoordinates?.y ?? null },
					AssessmentQuestionType.EmbeddedObject,
				),
			];
		});
	return {
		relevantWoundAssessmentNumbers: relevantWoundAssessments.map((item) => item.assessmentNumber),
		woundMappedResponses,
	};
}
