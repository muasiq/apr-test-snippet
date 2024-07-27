import { AssessmentAnswer, AssessmentAnswerSuggestionStatus } from '@prisma/client';
import { compact, difference, isEmpty } from 'lodash';
import { Configuration } from '~/assessments/configurations';
import { AssessmentQuestion } from '~/assessments/types';
import { extractRelevantQuestionsFromGroup } from '~/assessments/util/lookupQuestionUtil';
import { addMultipleIndex } from '~/common/utils/addMultipleIndex';
import { resolveIdAndMultipleIndex } from '~/common/utils/resolveIdAndMultipleIndex';
import { responseMatches } from '~/common/utils/responseMatches';
import { CheckedResponseUnion } from '~/server/api/routers/assessment/assessment.inputs';
import { PatientWithJoins } from '~/server/api/routers/patient/patient.types';

export function hasAcceptedAnswer(answer?: AssessmentAnswer) {
	return !!answer?.generatedResponseAccepted || !isEmpty(answer?.checkedResponse);
}

export function answerSuggestionStillLoading(answer?: AssessmentAnswer) {
	return (
		!answer ||
		answer.status === AssessmentAnswerSuggestionStatus.InProgress ||
		answer.status === AssessmentAnswerSuggestionStatus.Queued
	);
}

export function pageHeadingHasAllRelevantQuestionsConfirmed(
	heading: string,
	{ configuration, patient, answers }: ConfigurationPatientAndAnswers,
) {
	const allRelevantQuestions = allRelevantQuestionsForPageHeading(heading, { configuration, patient, answers });
	return allRelevantQuestions.every((q) => {
		const confirmed = questionHasConfirmedAnswer(q, answers);
		return confirmed;
	});
}

export function allRelevantQuestionsForPageHeading(
	heading: string,
	{ configuration, patient, answers }: ConfigurationPatientAndAnswers,
) {
	const matchedGroup = configuration.qaConfig.find((g) => g.heading === heading);
	if (!matchedGroup) throw new Error(`Group with heading ${heading} not found`);
	const topLevelQuestionsInThisGroup = extractRelevantQuestionsFromGroup(
		matchedGroup,
		answers,
		configuration,
		patient,
	);
	const topLevelQuestionIdsInThisGroup = compact(topLevelQuestionsInThisGroup.map((q) => q.id));
	const allQuestions = allQuestionsMap(configuration);
	const allFollowUps = recursivelyGetAllFollowUpsForTopLevelQuestionIds(
		allQuestions,
		topLevelQuestionIdsInThisGroup,
		{ configuration, patient, answers },
	);
	return compact([...topLevelQuestionIdsInThisGroup, ...allFollowUps]);
}

export function recursivelyGetAllFollowUpsForTopLevelQuestionIds(
	allQuestions: AllQuestionsMap,
	topLevelQuestionIds: string[],
	{ configuration, patient, answers }: ConfigurationPatientAndAnswers,
	finalList: string[] = [],
) {
	if (topLevelQuestionIds.length === 0) return finalList;
	const relevantAnswers = answers.filter((a) => topLevelQuestionIds.includes(a.assessmentNumber));
	const allFollowUps = relevantAnswers.flatMap((a) => lookupFollowUpsForAnswer(a, allQuestions));
	return recursivelyGetAllFollowUpsForTopLevelQuestionIds(
		allQuestions,
		allFollowUps,
		{ configuration, patient, answers },
		[...finalList, ...allFollowUps],
	);
}

export function allRelevantQuestionIdsForPatient({ configuration, patient, answers }: ConfigurationPatientAndAnswers) {
	const allRelevantTopLevelQuestions = allTopLevelQuestionsForConfigurationAndPatient({
		configuration,
		patient,
		answers,
	});
	const allRelevantTopLevelQuestionIds = compact(allRelevantTopLevelQuestions.map((q) => q.id));
	const allQuestions = allQuestionsMap(configuration);
	const allRelevantFollowUps = recursivelyGetAllFollowUpsForTopLevelQuestionIds(
		allQuestions,
		allRelevantTopLevelQuestionIds,
		{ configuration, patient, answers },
	);
	return compact([...allRelevantTopLevelQuestionIds, ...allRelevantFollowUps]);
}

export function allRelevantQuestionsForPatientHaveConfirmedAnswers({
	configuration,
	patient,
	answers,
}: ConfigurationPatientAndAnswers) {
	const allRelevantQuestionIds = allRelevantQuestionIdsForPatient({ answers, configuration, patient });
	return allRelevantQuestionIds.every((q) => questionHasConfirmedAnswer(q, answers));
}

export function questionsThatDoNotHaveConfirmedAnswers({
	configuration,
	patient,
	answers,
}: ConfigurationPatientAndAnswers) {
	const allRelevantQuestionIds = allRelevantQuestionIdsForPatient({ answers, configuration, patient });
	const allConfirmed = allConfirmedQuestionsForPatient({ configuration, patient, answers });
	return difference(allRelevantQuestionIds, allConfirmed);
}

export function allTopLevelQuestionsForConfigurationAndPatient({
	configuration,
	patient,
	answers,
}: ConfigurationPatientAndAnswers) {
	const allQuestions = configuration.qaConfig.flatMap((g) =>
		extractRelevantQuestionsFromGroup(g, answers, configuration, patient),
	);
	return allQuestions;
}

export type AllQuestionsMap = Map<string, AssessmentQuestion>;

function lookupFollowUpsForAnswer(answer: AssessmentAnswer, allQuestions: AllQuestionsMap) {
	const { index, resolvedQuestionId } = resolveIdAndMultipleIndex(answer.assessmentNumber);
	const currentChoice = answer.checkedResponse ?? answer.generatedResponse;
	const match = allQuestions.get(resolvedQuestionId);
	if (!match) return [];
	const followUps = match.responses?.flatMap((r) => r.followup) ?? [];
	if (!followUps.length) return [];
	const matchingResponses = match.responses?.filter((r) =>
		responseMatches((currentChoice as CheckedResponseUnion)?.choice as string, r.text),
	);
	if (matchingResponses?.length) {
		if (index) {
			return matchingResponses.flatMap((r) => r.followup?.map((f) => addMultipleIndex(f, index)) ?? []);
		}
		return matchingResponses.flatMap((r) => r.followup ?? []);
	}
	return [];
}

type ConfigurationPatientAndAnswers = {
	configuration: Configuration;
	patient: PatientWithJoins;
	answers: AssessmentAnswer[];
};

export function allQuestionsMap(configuration: Configuration): AllQuestionsMap {
	const map = new Map(configuration.allQuestions.map((q) => [q.id, q]));
	return map;
}

function allConfirmedQuestionsForPatient({ configuration, patient, answers }: ConfigurationPatientAndAnswers) {
	const allRelevantQuestionIds = allRelevantQuestionIdsForPatient({ answers, configuration, patient });
	return allRelevantQuestionIds.filter((q) => questionHasConfirmedAnswer(q, answers));
}

function questionHasConfirmedAnswer(questionId: string, answers: AssessmentAnswer[]) {
	const answer = answers.find((a) => a.assessmentNumber === questionId);
	if (!answer) return false;
	const confirmed = hasAcceptedAnswer(answer);
	return confirmed;
}
