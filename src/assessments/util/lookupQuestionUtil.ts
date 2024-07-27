/* eslint-disable @typescript-eslint/naming-convention */
import { AssessmentAnswer } from '@prisma/client';
import { get } from 'lodash';
import { addMultipleIndex } from '../../common/utils/addMultipleIndex';
import { resolveIdAndMultipleIndex } from '../../common/utils/resolveIdAndMultipleIndex';
import { PatientWithJoins } from '../../server/api/routers/patient/patient.types';
import { Configuration } from '../configurations';
import { PreReqMap } from '../oasis/prerequisites/PreReqMap';
import {
	AssessmentQuestionSources,
	AssessmentQuestionType,
	SubGroup,
	type AssessmentQuestion,
	type Group,
	type QuestionSource,
} from '../types';

export function lookupQuestion(questionId: string, configuration: Configuration) {
	const { resolvedQuestionId, index } = resolveIdAndMultipleIndex(questionId);
	const found = configuration.allQuestions.find((q) => q.id === resolvedQuestionId);
	if (!found) throw new Error(`Question with id ${questionId} not found`);
	return { ...found, id: addMultipleIndex(resolvedQuestionId, index) };
}

export function lookupQuestionOrNull(questionId: string, configuration: Configuration) {
	try {
		return lookupQuestion(questionId, configuration);
	} catch (e) {
		return null;
	}
}

export const findParentQuestionFromFollowup = (questionId: string, configuration: Configuration) => {
	const { resolvedQuestionId, index } = resolveIdAndMultipleIndex(questionId);
	const found = configuration.allQuestions.find((q) => {
		return q.responses?.flatMap((r) => r.followup).includes(resolvedQuestionId) ?? false;
	});
	if (!found) {
		return;
	}
	return { ...found, id: addMultipleIndex(found.id, index) };
};

export const findTopLevelParentQuestionFromFollowup = (questionId: string, configuration: Configuration) => {
	const { resolvedQuestionId, index } = resolveIdAndMultipleIndex(questionId);

	const parentLookup: Record<string, AssessmentQuestion> = {};
	configuration.allQuestions.forEach((q) => {
		q.responses?.forEach((response) => {
			response.followup?.forEach((f) => {
				parentLookup[f] = q;
			});
		});
	});

	let current = configuration.allQuestions.find((q) => q.id === resolvedQuestionId);
	if (!current) throw new Error(`Question with id ${questionId} not found`);

	const visited = new Set<string>();
	while (parentLookup[current.id] && !visited.has(current.id)) {
		visited.add(current.id);
		current = parentLookup[current.id]!;
	}

	return { ...current, id: addMultipleIndex(current.id, index) };
};

export const getAllConfigQuestionsFlat = (configuration: Configuration, patientData: PatientWithJoins) => {
	const allQuestions = configuration.qaConfig.flatMap((g) => extractQuestionsFromGroup(g, patientData));
	return allQuestions;
};

export const getFirstLevelFollowUps = (questions: QuestionSource[], configuration: Configuration) => {
	const allTopQuestions = questions
		.map((question) => {
			if (!question.id) {
				console.log({ question });
				console.log({ questions });
			}
			return lookupQuestion(question.id!, configuration);
		})
		.filter((a) => a);
	const allFollowUps = allTopQuestions
		.flatMap((question) => {
			return question.responses?.flatMap((response) => (response.followup ?? []).flatMap((f) => ({ id: f })));
		})
		.filter((a) => a) as { id: string }[];
	return allFollowUps;
};

export const recursivelyGetAllFollowUps = (
	questions: QuestionSource[],
	configuration: Configuration,
	finalList: QuestionSource[] = [],
): QuestionSource[] => {
	if (questions.length === 0) {
		return finalList;
	} else {
		const allFollowUps = getFirstLevelFollowUps(questions, configuration);
		return recursivelyGetAllQuestionsAndFollowUps(allFollowUps, configuration, [...finalList, ...allFollowUps]);
	}
};

export const recursivelyGetAllQuestionsAndFollowUps = (
	questions: QuestionSource[],
	configuration: Configuration,
	finalList: QuestionSource[] = [],
): QuestionSource[] => {
	if (questions.length === 0) {
		return finalList;
	} else {
		const allFollowUps = getFirstLevelFollowUps(questions, configuration);
		return recursivelyGetAllQuestionsAndFollowUps(allFollowUps, configuration, [...finalList, ...questions]);
	}
};

export const extractTopLevelQuestionsThatShouldHaveSuggestionsGenerated = (
	configuration: Configuration,
	patientData: PatientWithJoins,
) => {
	const match = (question?: QuestionSource) => {
		if (!question) return false;
		if (!question.id) return false;
		const lookup = lookupQuestion(question.id, configuration);
		if (lookup.mappedType === AssessmentQuestionType.Panel) return false;
		if (question.source === AssessmentQuestionSources.Custom && lookup.suggestionGenerator) return true;
		return question.source !== AssessmentQuestionSources.Custom && !question.preRequisiteSatisfied;
	};
	return configuration.qaConfig.flatMap((g) => extractQuestionsFromGroup(g, patientData).filter(match));
};

export const extractRelevantQuestionsFromGroup = (
	group: Group | undefined,
	answers: AssessmentAnswer[],
	configuration: Configuration,
	patientData: PatientWithJoins,
): QuestionSource[] => {
	if (!group) return [];
	const relevant = (question: QuestionSource) => {
		if (!question.id) return false;
		const lookup = lookupQuestion(question.id, configuration);
		if (lookup.mappedType === AssessmentQuestionType.Panel) return false;
		if (question.preRequisiteSatisfied) {
			const lookup = PreReqMap[question.preRequisiteSatisfied];
			return lookup(answers, configuration);
		}
		return true;
	};

	const list = extractQuestionsFromGroup(group, patientData).filter(relevant);
	return list;
};

export const extractQuestionsFromGroup = (group: Group, patientData: PatientWithJoins) => {
	return group.subGroups.flatMap((sg) => {
		if (sg.multiple) {
			const repeatTimes = get(patientData, sg.multiple.repeatTimesFieldResolver, 0) as number;
			if (repeatTimes) {
				return Array.from({ length: repeatTimes }, (_, i) => i + 1).flatMap((i) => {
					return sg.multiple!.questions.map((q) => ({ ...q, id: addMultipleIndex(q.id!, i) }));
				});
			}
			return [] as QuestionSource[];
		}
		return sg.questions;
	});
};

export const extractAllQuestionsFromGroup = (group: Group, patientData: PatientWithJoins) => {
	const subgroupQuestions = extractQuestionsFromGroup(group, patientData);
	const subHeadingQuestions = group.subHeadings?.flatMap((sh) => extractQuestionsFromGroup(sh, patientData)) ?? [];
	return [...subgroupQuestions, ...subHeadingQuestions];
};

export function findAllRollupGroups(groups: Group[]): SubGroup[] {
	return groups.flatMap((g) => {
		if (g.subGroups.length) {
			const found = g.subGroups.filter((sg) => !!sg.rollupForRpaApi);
			return found;
		}
		if (g.subHeadings?.length) {
			return findAllRollupGroups(g.subHeadings);
		}
		return [];
	});
}

export const getQuestionMetadata = (
	question: AssessmentQuestion,
	configuration: Configuration,
	patientData: PatientWithJoins,
	attempts = 0,
): QuestionSource => {
	const MAX_RECURSIVE_ATTEMPTS = 5;
	const allQuestions = getAllConfigQuestionsFlat(configuration, patientData);
	const lookup = allQuestions.find((aq) => aq.id === question.id);
	if (!lookup) {
		if (attempts > MAX_RECURSIVE_ATTEMPTS) {
			console.error(
				`Could not find question metadata for ${question.id} after ${attempts} attempts, using default`,
			);
			return {} as QuestionSource;
		} else {
			const parent = findParentQuestionFromFollowup(question.id, configuration);
			if (!parent) {
				return {} as QuestionSource;
			}
			return getQuestionMetadata(parent, configuration, patientData, attempts + 1);
		}
	}
	return lookup;
};

export const getQuestionSubGroupForMultipleTypeQuestion = (
	question: AssessmentQuestion,
	configuration: Configuration,
): SubGroup | undefined => {
	return configuration.qaConfig
		.flatMap((g) => g.subGroups)
		.find((sg) => {
			return sg.multiple?.questions.find((q) => q.id === question.id);
		});
};
