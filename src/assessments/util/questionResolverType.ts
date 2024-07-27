import { QuestionSource } from '../types';

export enum QuestionResolverTypes {
	ASSESSMENT = 'Assessment',
	NOTE = 'Note',
	PATIENT_DATA = 'PatientData',
	AUTO_CALCULATE = 'AutoCalculate',
}

export function getQuestionResolverType(question: QuestionSource) {
	if (question.id && question.source) {
		return QuestionResolverTypes.ASSESSMENT;
	}
	if (question.note) {
		return QuestionResolverTypes.NOTE;
	}
	if (question.patientDataResolver) {
		return QuestionResolverTypes.PATIENT_DATA;
	}
	if (question.autoCalculateFieldResolver) {
		return QuestionResolverTypes.AUTO_CALCULATE;
	}

	console.error('unknown question resolver type:', question);
	throw new Error('unknown question resolver');
}
