import { AssessmentAnswer } from '@prisma/client';
import {
	generateDateFromFrequencyAndWeeks,
	generateRn02Date,
	resolveDateFromJson,
} from '~/assessments/util/visitFrequencyUtil';
import { CheckedResponseUnion } from '../../../assessment/assessment.inputs';

export function generateHomeHealthAideVisitFrequencyResponse(assessmentAnswer: AssessmentAnswer) {
	const response = (assessmentAnswer.checkedResponse as CheckedResponseUnion)?.choice;
	if (typeof response === 'object' && 'homeHealthAideVisitFrequencies' in response) {
		const segmentsLength = response.homeHealthAideVisitFrequencies.length;
		if (segmentsLength === 0) return { homeHealthAideVisitFrequencies: null };

		const lastDateStr = response.homeHealthAideVisitFrequencies[segmentsLength - 1]!.endDate as string | null;
		const rn02Date = lastDateStr ? generateRn02Date(new Date(lastDateStr)).toISOString() : null;

		const allDates = response.homeHealthAideVisitFrequencies.flatMap((segment) => {
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
				Services: [{ Code: 'HH11', Discipline: 'Home Health Aide' }],
				Date: date.toISOString(),
			}));
		});

		return {
			homeHealthAideVisitFrequencies: { dates: allDates, RN02Date: rn02Date },
		};
	}
	throw new Error('HomeHealthAideVisitFrequencies response is not an object');
}
