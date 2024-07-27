import { PatientArtifactTag } from '@prisma/client';
import Dexie, { Table } from 'dexie';
import { SaveNurseInterviewSOCQuestionInput } from '~/server/api/routers/interviewQuestion/interviewQuestion.inputs';
import { NurseInterviewGroups } from '../../../../../../assessments/nurse-interview/questions';

export interface AnsweredInterviewQuestion {
	id?: number;
	patientId: number;
	group: NurseInterviewGroups;
	interviewQuestionShortLabel: string;
	interviewQuestionTheme: string;
	question: string;
	textResponse?: string;
	audioRecording?: Blob;
	attemptsToSend: number;
}

export interface AnsweredInterviewSetup extends SaveNurseInterviewSOCQuestionInput {
	attemptsToSend: number;
}

export type InterviewPatientArtifactTags = Exclude<PatientArtifactTag, 'VisitNote'>;

export interface AnsweredUploadQuestion {
	id?: number;
	patientId: number;
	tagName: InterviewPatientArtifactTags;
	file?: File;
	attemptsToSend: number;
}

export class AnsweredInterviewQuestionsDB extends Dexie {
	answeredThemeQuestions!: Table<AnsweredInterviewQuestion, number>;
	answeredSetupQuestions!: Table<AnsweredInterviewSetup, number>;
	answeredUploadQuestions!: Table<AnsweredUploadQuestion, number>;
	constructor() {
		super('AnsweredInterviewQuestionsDB');
		this.version(8).stores({
			answeredThemeQuestions: '++id,patientId,[patientId+interviewQuestionShortLabel]',
			answeredSetupQuestions: '++id,patientId',
			answeredUploadQuestions: '++id,patientId',
		});
	}
}

export const db = new AnsweredInterviewQuestionsDB();

export const ensureDbOpen = async () => {
	try {
		if (!db.isOpen()) {
			await db.open();
		}
	} catch (err) {
		console.error('Failed to open db: ', err);
	}
};
