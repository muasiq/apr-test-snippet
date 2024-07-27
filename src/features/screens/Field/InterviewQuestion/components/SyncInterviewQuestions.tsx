import { useState } from 'react';
import { NurseInterviewGroups } from '~/assessments/nurse-interview/questions';
import { trpc } from '~/common/utils/trpc';
import { useSyncInterviewItems } from '~/features/screens/Field/InterviewQuestion/common/hooks/useSyncInterviewItems';
import { api } from '../../../../../common/utils/api';
import { AnsweredInterviewQuestion, db } from '../common/utils/db';
import { convert } from '../common/videoToAudio';
import { numberOfSetupItemsInDbForPatient } from './SyncInterviewSetupQuestions';

const MAX_ATTEMPTS = 10;
const BATCH_SIZE = 5;

type SerializedAudioRecordingType = AnsweredInterviewQuestion & {
	serializedAudioRecording?: {
		buffer: ArrayBuffer;
		type: string;
	};
};

async function serialize(data: AnsweredInterviewQuestion) {
	if (!data?.audioRecording) {
		return data;
	}

	const { audioRecording, ...rest } = data;
	const buffer = await audioRecording.arrayBuffer();
	return { ...rest, serializedAudioRecording: { buffer, type: audioRecording.type } };
}

function deserialize(data?: SerializedAudioRecordingType): AnsweredInterviewQuestion {
	if (!data?.serializedAudioRecording) {
		return data as AnsweredInterviewQuestion;
	}

	const { serializedAudioRecording, ...rest } = data;
	const { buffer, type } = serializedAudioRecording;
	const audioRecording = new Blob([buffer], { type });
	return { ...rest, audioRecording };
}

export const saveInterviewQuestion = async (data: AnsweredInterviewQuestion) => {
	const serialized = await serialize(data);
	await db.answeredThemeQuestions.add(serialized);
};

export const getThemedAnswersByPatientId = async (patientId: number, group: NurseInterviewGroups) => {
	return await db.answeredThemeQuestions.where({ patientId, group }).toArray();
};

const getInterviewQuestionBatch = async () => {
	const questions = await db.answeredThemeQuestions.limit(BATCH_SIZE).toArray();
	return questions.map(deserialize);
};

export const numberOfItemsInDbForPatient = async (patientId: number) => {
	const count = await db.answeredThemeQuestions.where({ patientId }).count();
	return count;
};

export const totalNumberOfItemsInDb = async () => {
	const count = await db.answeredThemeQuestions.count();
	return count;
};

export const getQuestionByShortLabel = async (patientId: number, interviewQuestionShortLabel: string | undefined) => {
	const question = await db.answeredThemeQuestions.where({ patientId, interviewQuestionShortLabel }).first();
	return deserialize(question);
};

export const totalNumberOfItemsInDbToSyncForPatient = async (patientId: number) => {
	const themeQuestionCount = await db.answeredThemeQuestions.where({ patientId }).count();
	const setupItemsCount = await numberOfSetupItemsInDbForPatient(patientId);
	const uploadItemsCount = await db.answeredUploadQuestions.where({ patientId }).count();

	return themeQuestionCount + setupItemsCount + uploadItemsCount;
};

const removeInterviewQuestion = async (id: number) => {
	return await db.answeredThemeQuestions.delete(id);
};

const incrementFailedAttemptsForInterviewQuestion = async (id: number) => {
	const item = await db.answeredThemeQuestions.get(id);
	if (!item) {
		console.error('no item found');
		return;
	}
	return await db.answeredThemeQuestions.update(id, { attemptsToSend: item.attemptsToSend + 1 });
};

export const SyncInterviewQuestions = (): JSX.Element => {
	const [currentlySyncingQuestions, setCurrentlySyncingQuestions] = useState<number[]>([]);
	const utils = trpc.useUtils();
	const { mutateAsync: mutateSaveInterviewTranscribedAudio } =
		api.interviewQuestion.saveInterviewTranscribedAudio.useMutation({});

	const { mutateAsync } = api.interviewQuestion.saveInterviewQuestion.useMutation({});
	const { mutateAsync: failedToSync } = api.interviewQuestion.failedToSyncInterviewItem.useMutation({});

	async function syncItem(questionFromIndexDB: AnsweredInterviewQuestion) {
		if (currentlySyncingQuestions.includes(questionFromIndexDB.id!)) {
			console.info('already syncing', questionFromIndexDB);
			return;
		}
		setCurrentlySyncingQuestions((current) => [...current, questionFromIndexDB.id!]);
		console.info('syncing', questionFromIndexDB);
		const data = {
			patientId: questionFromIndexDB.patientId,
			interviewQuestionShortLabel: questionFromIndexDB.interviewQuestionShortLabel,
			interviewQuestionTheme: questionFromIndexDB.interviewQuestionTheme,
			question: questionFromIndexDB.question,
			textResponse: questionFromIndexDB.textResponse ?? null,
			hasAudioResponse: !!questionFromIndexDB.audioRecording,
		};
		if (questionFromIndexDB.attemptsToSend > MAX_ATTEMPTS) {
			console.info('too many attempts, removing', questionFromIndexDB);
			await removeInterviewQuestion(questionFromIndexDB.id!);
			await failedToSync(data);
			setCurrentlySyncingQuestions((current) => current.filter((id) => id !== questionFromIndexDB.id!));
			return;
		}
		try {
			const { question, signedUrl } = await mutateAsync(data);

			const { audioRecording } = questionFromIndexDB;

			if (signedUrl && audioRecording && question.cloudStorageAudioFileLocation) {
				const contentType = audioRecording.type;
				const resolvedBlob = await (contentType.startsWith('audio/mp4')
					? convert(audioRecording)
					: Promise.resolve(audioRecording));
				try {
					const res = await fetch(signedUrl, {
						method: 'PUT',
						body: resolvedBlob,
						headers: {
							'Content-Type': resolvedBlob.type,
						},
					});
					if (!res.ok) {
						throw new Error(res.statusText);
					}
					await mutateSaveInterviewTranscribedAudio({
						audioURL: question.cloudStorageAudioFileLocation,
						interviewQuestionShortLabel: questionFromIndexDB.interviewQuestionShortLabel,
						patientId: questionFromIndexDB.patientId,
						contentType: resolvedBlob.type,
					});
					await utils.patient.getById.invalidate();
					await removeInterviewQuestion(questionFromIndexDB.id!);
					setCurrentlySyncingQuestions((current) => current.filter((id) => id !== questionFromIndexDB.id!));
				} catch (error) {
					console.error('error uploading audio', error);
					setCurrentlySyncingQuestions((current) => current.filter((id) => id !== questionFromIndexDB.id!));
					await incrementFailedAttemptsForInterviewQuestion(questionFromIndexDB.id!);
				}
			} else {
				await utils.patient.getById.invalidate();
				await removeInterviewQuestion(questionFromIndexDB.id!);
				setCurrentlySyncingQuestions((current) => current.filter((id) => id !== questionFromIndexDB.id!));
			}
		} catch (e) {
			console.error('error saving interview question', e);
			await incrementFailedAttemptsForInterviewQuestion(questionFromIndexDB.id!);
			setCurrentlySyncingQuestions((current) => current.filter((id) => id !== questionFromIndexDB.id!));
		}
	}

	useSyncInterviewItems(async () => {
		const questionFromIndexDB = await getInterviewQuestionBatch();
		if (!questionFromIndexDB.length) {
			return;
		} else {
			const totalCount = await totalNumberOfItemsInDb();
			console.log('total items in db', totalCount);
			questionFromIndexDB.forEach(async (question) => {
				await syncItem(question);
			});
		}
	});
	return <></>;
};
