import { Group, SubGroup } from '~/assessments/types';

export function allIdsInConfig(group: Group[]) {
	const allQuestions = allQuestionsInConfig(group);
	return allQuestions.map((q) => q.id);
}

export function allQuestionsInConfig(group: Group[]) {
	return group.flatMap((g) => {
		if (g.subHeadings) {
			return g.subHeadings.flatMap((sh) => sh.subGroups.flatMap((sg) => allSubGroupQuestions(sg)));
		}
		return g.subGroups.flatMap((sg) => allSubGroupQuestions(sg));
	});
}

export function allSubGroupQuestions(sg: SubGroup) {
	if (sg.multiple) {
		return sg.multiple.questions.filter((q) => q.id);
	}
	return sg.questions.filter((q) => q.id);
}
