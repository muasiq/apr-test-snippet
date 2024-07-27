import { AssessmentAnswer } from '@prisma/client';
import { isArray, isEqual, isObject } from 'lodash';
import { Configuration } from '~/assessments/configurations';
import { lookupQuestion } from '~/assessments/util/lookupQuestionUtil';
import { RouterOutputs } from '../../../../../common/utils/api';

export type SuggestionOutput = NonNullable<RouterOutputs['promptIteration']['runBackTestForSuggestions'][number]>;

export const newSuggestionsThatMatch = (suggestions: SuggestionOutput[]) => {
	return suggestions.filter((suggestion) => {
		const newChoice = formatChoice(suggestion.suggestion.choice);
		const existingChoice = resolveExistingChoice(suggestion.existingAnswer);
		return isEqual(newChoice, existingChoice);
	});
};

export const formatChoice = (choice: string | string[] | number | null | object) => {
	return isArray(choice) ? choice.join(', ') : isObject(choice) ? JSON.stringify(choice) : choice;
};

export const resolveExistingChoice = (answer?: AssessmentAnswer) => {
	if (!answer) return null;
	const resolved = (answer.checkedResponse ?? answer.generatedResponse) as { choice: string | string[] };
	return formatChoice(resolved?.choice);
};

export const resolveExistingExplanation = (answer?: AssessmentAnswer) => {
	if (!answer) return null;
	const resolved = answer.generatedResponse as { explanation: string };
	return resolved?.explanation;
};

export const getAllQuestionsFilteredByGroup = (configuration: Configuration, groupFilter?: string) => {
	const groups = configuration.qaConfig;
	return groups
		.flatMap((group) =>
			group.subGroups.flatMap((subGroup) =>
				subGroup.questions.flatMap((q) =>
					q.id && (!groupFilter || group.heading === groupFilter)
						? lookupQuestion(q.id, configuration).text
						: undefined,
				),
			),
		)
		.filter((q) => q !== undefined);
};
