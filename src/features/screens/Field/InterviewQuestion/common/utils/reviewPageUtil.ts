import { AudioTranscriptionStatus, NurseInterviewQuestionItem } from '@prisma/client';
import { PartialExceptFor } from '~/common/types/types';
import {
	NurseInterview,
	NurseInterviewBaselineThemes,
	NurseInterviewPhysicalAssessmentThemes,
	NurseInterviewQuestion,
	interview,
	woundInterviewItem,
} from '../../../../../../assessments/nurse-interview/questions';
import { PatientWithReviewContext } from '../../../../../../server/api/routers/patient/patient.types';
import { AccordionQuestionError } from '../../components/Review';

export const shouldRefetchInterviewQuestionData = (patientData: PatientWithReviewContext): boolean => {
	if (!patientData || !patientData.NurseInterview) return false;

	const baselineThemes = Object.values(NurseInterviewBaselineThemes);
	const additionalThemes = patientData.NurseInterview.selectedThemesToReportOn ?? [];
	const allAnsweredThemes = [...baselineThemes, ...additionalThemes];

	return allAnsweredThemes.some((themeName) => {
		const themeSummaryExists = patientData.NurseInterview?.NurseInterviewThemeSummaries.some(
			(summary) => summary.theme === themeName,
		);
		const themeHasFailedAudioTranscription = patientData.InterviewQuestion.some(
			(question) =>
				question.interviewQuestionTheme === themeName &&
				(question.audioTranscriptionStatus === AudioTranscriptionStatus.Failed ||
					question.audioTranscriptionStatus === AudioTranscriptionStatus.NoResults),
		);

		return !themeSummaryExists && !themeHasFailedAudioTranscription;
	});
};

const findNurseInterviewThemeSummaryByThemeName = (themeName: string, patientData: PatientWithReviewContext) => {
	return patientData?.NurseInterview?.NurseInterviewThemeSummaries.find((summary) => summary.theme === themeName);
};

const filterQuestionsByThemeName = (interview: NurseInterview, themeName: string) => {
	return interview.filter((question) => question.theme.toString() === themeName);
};

export type RequiredQuestionNurseInterviewQuestionItem = PartialExceptFor<NurseInterviewQuestionItem, 'question'>;
const formatMissingQuestion = (
	missingQuestion: NurseInterviewQuestion,
): RequiredQuestionNurseInterviewQuestionItem => ({ question: missingQuestion.question });

export const getNurseInterviewThemeWithSummariesByThemeName = (
	themeName: NurseInterviewBaselineThemes | NurseInterviewPhysicalAssessmentThemes,
	data: PatientWithReviewContext,
) => {
	const nurseInterviewThemeSummaries = findNurseInterviewThemeSummaryByThemeName(themeName, data);
	if (!nurseInterviewThemeSummaries) return undefined;

	const questionsInTheme =
		themeName === NurseInterviewPhysicalAssessmentThemes.Wounds
			? nurseInterviewThemeSummaries.QuestionItems.map((_, i) => woundInterviewItem(i + 1))
			: filterQuestionsByThemeName(interview, themeName);

	const orderedQuestions = questionsInTheme.map((question) => {
		const foundQuestion = nurseInterviewThemeSummaries.QuestionItems.find(
			(item) => item.question === question.question,
		);
		if (foundQuestion) return foundQuestion;

		return formatMissingQuestion(question);
	});

	return {
		...nurseInterviewThemeSummaries,
		QuestionItems: orderedQuestions,
	};
};

const extractFailedQuestions = (
	patientData: PatientWithReviewContext,
	currentTheme: NurseInterviewBaselineThemes | NurseInterviewPhysicalAssessmentThemes,
) => {
	const failedAudioTranscriptionQuestions = patientData?.InterviewQuestion.filter(
		(question) =>
			question.interviewQuestionTheme === currentTheme.toString() &&
			(question.audioTranscriptionStatus === AudioTranscriptionStatus.Failed ||
				question.audioTranscriptionStatus === AudioTranscriptionStatus.NoResults),
	).map((question) => ({
		question: question.question,
		errorMessage: 'There was an error transcribing the audio file. Please type your response.',
		theme: currentTheme,
	}));

	const failedAudioTranscriptionQuestionsWithHumanConfirmedSummarizedText = failedAudioTranscriptionQuestions?.filter(
		(question) => !isQuestionAnswered(patientData, currentTheme, question),
	);

	return failedAudioTranscriptionQuestionsWithHumanConfirmedSummarizedText;
};
const isQuestionAnswered = (
	patientData: PatientWithReviewContext,
	currentTheme: NurseInterviewBaselineThemes | NurseInterviewPhysicalAssessmentThemes,
	question: AccordionQuestionError,
) => {
	return patientData?.NurseInterview?.NurseInterviewThemeSummaries.flatMap((item) =>
		item.theme === currentTheme.toString() ? item.QuestionItems : [],
	).some((item) => item.question === question.question && item.humanConfirmedSummarizedText);
};

const getNumberOfQuestionsInThemeSummarized = (
	patientData: PatientWithReviewContext,
	currentTheme: NurseInterviewBaselineThemes | NurseInterviewPhysicalAssessmentThemes,
) => {
	return (
		patientData?.NurseInterview?.NurseInterviewThemeSummaries.find((item) => item.theme === currentTheme.toString())
			?.QuestionItems ?? []
	).length;
};

export const isThemeStillLoadingSummaries = (
	patientData: PatientWithReviewContext,
	currentTheme: NurseInterviewBaselineThemes | NurseInterviewPhysicalAssessmentThemes,
): { isLoading: boolean; failedAudioTranscriptionQuestions: AccordionQuestionError[] } => {
	const themesAnswered = new Set([
		...Object.values(NurseInterviewBaselineThemes),
		...((patientData?.NurseInterview?.selectedThemesToReportOn ?? []) as NurseInterviewPhysicalAssessmentThemes[]),
	]);

	const failedAudioTranscriptionQuestions = extractFailedQuestions(patientData, currentTheme);

	if (failedAudioTranscriptionQuestions?.length) {
		return { isLoading: false, failedAudioTranscriptionQuestions };
	}

	if (!themesAnswered.has(currentTheme)) {
		return { isLoading: false, failedAudioTranscriptionQuestions: [] };
	}

	const numberOfQuestionsInThemeSummarizedByLLM = getNumberOfQuestionsInThemeSummarized(patientData, currentTheme);

	if (currentTheme === NurseInterviewPhysicalAssessmentThemes.Wounds) {
		const totalWounds = patientData?.NurseInterview?.totalWounds ?? 0;
		return {
			isLoading: numberOfQuestionsInThemeSummarizedByLLM < totalWounds,
			failedAudioTranscriptionQuestions: failedAudioTranscriptionQuestions ?? [],
		};
	}

	const numberOfQuestionsInTheme = (
		patientData?.InterviewQuestion.filter((item) => item.interviewQuestionTheme === currentTheme.toString()) ?? []
	).length;

	return {
		isLoading: numberOfQuestionsInThemeSummarizedByLLM < numberOfQuestionsInTheme,
		failedAudioTranscriptionQuestions: failedAudioTranscriptionQuestions ?? [],
	};
};

export const doesThemeSummaryAccordionItemHaveError = (
	accordionQuestionError: AccordionQuestionError[],
	question: NurseInterviewQuestion,
): AccordionQuestionError | undefined => {
	return accordionQuestionError.find((item) => item.question === question.question);
};

export const isBaselineInterviewTheme = (theme: string) => {
	return Object.values(NurseInterviewBaselineThemes).includes(theme as NurseInterviewBaselineThemes);
};
