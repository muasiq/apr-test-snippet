import { AssessmentAnswer } from '@prisma/client';
import {
	generateDateFromFrequencyAndWeeks,
	generateRn02Date,
	resolveDateFromJson,
} from '~/assessments/util/visitFrequencyUtil';
import { CheckedResponseUnion } from '../../../assessment/assessment.inputs';

export type RPASkilledNursingVisitFrequencyResponse = {
	skilledNursingVisitFrequencies: {
		dates: Array<{
			Date: string;
			Services: Array<{ Code: string; Discipline: string | null }>;
		}>;
		RN02Date: string | null;
	} | null;
};

export function generateSkilledNursingVisitFrequencyResponse(
	assessmentAnswer: AssessmentAnswer,
): RPASkilledNursingVisitFrequencyResponse {
	const response = (assessmentAnswer.checkedResponse as CheckedResponseUnion)?.choice;
	if (typeof response === 'object' && 'skilledNursingVisitFrequencies' in response) {
		const segmentsLength = response.skilledNursingVisitFrequencies.length;
		if (segmentsLength === 0) return { skilledNursingVisitFrequencies: null };

		const lastDate = response.skilledNursingVisitFrequencies[segmentsLength - 1]?.endDate;
		const rn02Date = lastDate ? generateRn02Date(resolveDateFromJson(lastDate)).toISOString() : null;

		const allDates = response.skilledNursingVisitFrequencies.flatMap((segment) => {
			const dates =
				segment.startDate && segment.endDate
					? generateDateFromFrequencyAndWeeks(
							segment.frequency,
							segment.daysOfWeek ?? null, // pass null for existing records that don't have daysOfWeek
							resolveDateFromJson(segment.startDate),
							resolveDateFromJson(segment.endDate),
						)
					: [];
			if (segment.frequency === 'Start and Discharge Only' && rn02Date) {
				dates.push(new Date(rn02Date));
			}
			return dates.map((date) => ({
				Services: segment.serviceCode.map((Code) => ({
					Code,
					Discipline: 'Skilled Nurse',
				})),
				Date: date.toISOString(),
			}));
		});

		return {
			skilledNursingVisitFrequencies: { dates: allDates, RN02Date: rn02Date },
		};
	}
	throw new Error('SkilledNursingVisitFrequencies response is not an object');
}
