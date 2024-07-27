import { uniq } from 'lodash';
import {
	NurseInterview,
	NurseInterviewBaselineThemes,
	NurseInterviewPhysicalAssessmentThemes,
	NurseInterviewQuestion,
	ShortLabels,
	interview,
	woundInterviewItem,
} from '../../../../../../assessments/nurse-interview/questions';
import { PatientWithJoins } from '../../../../../../server/api/routers/patient/patient.types';

export const getInterviewQuestionByShortLabelForPatient = (
	patientData: PatientWithJoins,
	currentShortLabel: string | undefined,
): { textResponse: string | null | undefined; cloudStorageAudioFileLocation: string | null | undefined } => {
	const question = interview.find((q) => q.shortLabel === currentShortLabel);

	const humanHasConfirmedSummarizedText = patientData.NurseInterview?.NurseInterviewThemeSummaries.flatMap(
		(themeSummary) => themeSummary.QuestionItems,
	).find((qi) => qi.question === question?.question && qi.humanConfirmedSummarizedText !== null);

	const patientInterviewQuestionData = patientData.InterviewQuestion.find(
		(q) => q.interviewQuestionShortLabel === currentShortLabel,
	);
	if (humanHasConfirmedSummarizedText) {
		return {
			textResponse: humanHasConfirmedSummarizedText.humanConfirmedSummarizedText,
			cloudStorageAudioFileLocation: patientInterviewQuestionData?.cloudStorageAudioFileLocation,
		};
	}

	return {
		textResponse: patientInterviewQuestionData?.textResponse,
		cloudStorageAudioFileLocation: patientInterviewQuestionData?.cloudStorageAudioFileLocation,
	};
};

export const previousCurrentNextThemeWindow = (
	filteredInterview: NurseInterview,
	currentTheme?: NurseInterviewBaselineThemes | NurseInterviewPhysicalAssessmentThemes,
) => {
	if (!currentTheme) return { previousTheme: undefined, currentTheme: undefined, nextThemes: undefined };
	const uniqueThemes = uniq(filteredInterview.map((q) => q.theme));
	const previousTheme = uniqueThemes[uniqueThemes.findIndex((theme) => theme === currentTheme) - 1];
	const nextThemes = uniqueThemes.slice(uniqueThemes.findIndex((theme) => theme === currentTheme) + 1).join(' ');
	return { previousTheme, currentTheme, nextThemes };
};

export const nextQuestionLookup = (
	filteredInterview: NurseInterview,
	currentQuestionShortLabel?: ShortLabels,
): NurseInterviewQuestion | undefined => {
	if (!currentQuestionShortLabel) return;
	const currentQuestionIndex = filteredInterview.findIndex(
		(question) => question.shortLabel === currentQuestionShortLabel,
	);
	const nextQuestion = filteredInterview[currentQuestionIndex + 1];
	return nextQuestion;
};

export const getResolvedQuestion = (
	questionShortLabel: string | undefined,
	currentWoundNumber: number | undefined,
	currentQuestion: NurseInterviewQuestion | undefined,
): NurseInterviewQuestion => {
	if (!currentQuestion) throw new Error('No current question');

	if (!questionShortLabel || !currentWoundNumber) return currentQuestion;

	if (
		(questionShortLabel as NurseInterviewPhysicalAssessmentThemes) === NurseInterviewPhysicalAssessmentThemes.Wounds
	) {
		return woundInterviewItem(currentWoundNumber);
	}

	return currentQuestion;
};

export const getPreviousNurseInterviewQuestion = (
	currentInterview: NurseInterviewQuestion[],
	currentQuestionShortLabel: string | undefined,
) => {
	const currentQuestionIndex = currentInterview.findIndex(
		(question) => question.shortLabel === currentQuestionShortLabel,
	);

	if (currentQuestionIndex <= 0) return;

	const previousQuestion = currentInterview[currentQuestionIndex - 1];
	return previousQuestion;
};

export const getNurseInterviewQuestionProgress = (
	currentInterview: NurseInterviewQuestion[],
	currentQuestionShortLabel: string | undefined,
) => {
	const currentQuestion = currentInterview.find((question) => question.shortLabel === currentQuestionShortLabel);
	if (currentQuestion) {
		const totalQuestionsInSection = currentInterview.filter((question) => question.theme === currentQuestion.theme);
		const currentQuestionNumber = totalQuestionsInSection.findIndex(
			(question) => question.shortLabel === currentQuestionShortLabel,
		);

		return `${currentQuestionNumber + 1} / ${totalQuestionsInSection.length}`;
	}
	console.error('Could not find current question in interview');
	return '';
};
