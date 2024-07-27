import { NurseInterviewQuestionItem } from '@prisma/client';
import { PatientWithReviewContext } from '../../server/api/routers/patient/patient.types';

export const interviewResponseLookup = (
	question: Partial<NurseInterviewQuestionItem>,
	patientData: PatientWithReviewContext,
) => {
	if (question.humanConfirmedSummarizedText) {
		return question.humanConfirmedSummarizedText;
	}

	if (question.LLMSummarizedText?.length) {
		return question.LLMSummarizedText.map((text) => `- ${text}`).join('\n');
	}

	const interviewQuestion = patientData?.InterviewQuestion.find((q) => q.question === question.question);

	if (interviewQuestion) {
		return interviewQuestion.transcribedText ?? interviewQuestion.textResponse ?? null;
	} else {
		return null;
	}
};
