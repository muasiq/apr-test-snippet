import { AllAssessmentQuestions, OasisFollowups } from '../../../types';

export function mergeOasisFollowups(allOasisQuestions: AllAssessmentQuestions, oasisFollowups: OasisFollowups[]) {
	return allOasisQuestions.map((q) => {
		const followupsOverride = oasisFollowups.find((f) => f.oasisId === q.id);
		if (followupsOverride) {
			if (!q.responses) throw new Error(`Question ${q.id} has followups but no responses`);
			return {
				...q,
				responses: q.responses.map((or) => {
					const matchesFollowup = followupsOverride.responses.find((r) => r.text === or.text);
					if (!matchesFollowup) {
						return or;
					}
					if (!matchesFollowup?.followup)
						throw new Error(`Question ${q.id} has followups but no match for response ${or.text}`);
					return {
						...or,
						followup: [...(or.followup ?? []), ...matchesFollowup.followup],
					};
				}),
			};
		}
		return q;
	});
}
