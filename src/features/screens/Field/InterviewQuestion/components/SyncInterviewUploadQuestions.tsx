import { PatientArtifactTag } from '@prisma/client';
import { useState } from 'react';
import { trpc } from '~/common/utils/trpc';
import { useSyncInterviewItems } from '~/features/screens/Field/InterviewQuestion/common/hooks/useSyncInterviewItems';
import { SaveNurseInterviewSOCQuestionInput } from '~/server/api/routers/interviewQuestion/interviewQuestion.inputs';
import { useFileUpload } from '../../../../../common/hooks/useFileUpload';
import { api } from '../../../../../common/utils/api';
import { AnsweredUploadQuestion, db, InterviewPatientArtifactTags } from '../common/utils/db';

const MAX_ATTEMPTS = 10;

export const saveInterviewUploadQuestion = async (data: AnsweredUploadQuestion) => {
	await db.answeredUploadQuestions.add({ ...data });
};

export const checkInterviewUploadDataExistence = async (patientId: number) => {
	const data = await db.answeredUploadQuestions.where({ patientId }).toArray();
	return {
		hasCompletedWoundPhotoUpload: data.some((item) => item.tagName === PatientArtifactTag.Wounds),
		hasCompletedMedicationPhotoUpload: data.some((item) => item.tagName === PatientArtifactTag.Medication),
		hasCompletedDocumentsUpload: data.some((item) => item.tagName === PatientArtifactTag.ReferralDocument),
	};
};

export const numberOfUploadItemsInDbForPatient = async (patientId: number) => {
	const count = await db.answeredUploadQuestions.where({ patientId }).count();
	return count;
};

const getFirstUploadQuestion = async () => {
	const [firstQuestion] = await db.answeredUploadQuestions.limit(1).toArray();
	return firstQuestion;
};

const removeInterviewQuestion = async (id: number) => {
	return await db.answeredUploadQuestions.delete(id);
};

const incrementFailedAttemptsForInterviewQuestion = async (id: number) => {
	const item = await db.answeredUploadQuestions.get(id);
	if (!item) {
		console.error('no item found');
		return;
	}
	return await db.answeredUploadQuestions.update(id, { attemptsToSend: item.attemptsToSend + 1 });
};

const tagToSaveQuestionPayload: {
	[key in InterviewPatientArtifactTags]: (patientId: number) => SaveNurseInterviewSOCQuestionInput;
} = {
	Wounds: (patientId: number) => ({ patientId, hasCompletedWoundPhotoUpload: true }),
	Medication: (patientId: number) => ({ patientId, hasCompletedMedicationPhotoUpload: true }),
	ReferralDocument: (patientId: number) => ({ patientId, hasCompletedDocumentsUpload: true }),
	Other: (patientId: number) => ({ patientId, hasCompletedOtherPhotoUpload: true }),
	Photos: (patientId: number) => ({ patientId, hasCompletedOtherPhotoUpload: true }),
};

export const SyncInterviewUploadQuestions = (): JSX.Element => {
	const [currentlySyncingQuestions, setCurrentlySyncingQuestions] = useState<number[]>([]);
	const utils = trpc.useUtils();
	const { handleFileUpload } = useFileUpload();

	const { mutateAsync: saveInterviewQuestion } = api.interviewQuestion.saveNurseInterviewSOCQuestion.useMutation({});

	const handleInterviewQuestionUpdate = async (
		questionFromIndexDB: AnsweredUploadQuestion,
		tagName: InterviewPatientArtifactTags,
	) => {
		const payloadCreator = tagToSaveQuestionPayload[tagName];
		if (payloadCreator) {
			await saveInterviewQuestion(payloadCreator(questionFromIndexDB.patientId));
			await utils.patient.getById.invalidate();
			await removeInterviewQuestion(questionFromIndexDB.id!);
			setCurrentlySyncingQuestions((current) => current.filter((id) => id !== questionFromIndexDB.id!));
		}
	};

	const uploadFile = async (questionFromIndexDB: AnsweredUploadQuestion) => {
		if (!questionFromIndexDB.file) return;

		await handleFileUpload(questionFromIndexDB.file, questionFromIndexDB.patientId, questionFromIndexDB.tagName);
	};

	useSyncInterviewItems(async () => {
		const questionFromIndexDB = await getFirstUploadQuestion();

		if (!questionFromIndexDB || currentlySyncingQuestions.includes(questionFromIndexDB.id!)) {
			return;
		}

		setCurrentlySyncingQuestions((current) => [...current, questionFromIndexDB.id!]);

		console.info('syncing', questionFromIndexDB);

		if (questionFromIndexDB.attemptsToSend > MAX_ATTEMPTS) {
			console.info('max attempts reached');
			await removeInterviewQuestion(questionFromIndexDB.id!);
			return;
		}

		try {
			if (!questionFromIndexDB.file) {
				await handleInterviewQuestionUpdate(questionFromIndexDB, questionFromIndexDB.tagName);
			} else {
				await uploadFile(questionFromIndexDB);
				await handleInterviewQuestionUpdate(questionFromIndexDB, questionFromIndexDB.tagName);
			}
		} catch (e) {
			console.error('error saving image', e);
			setCurrentlySyncingQuestions((current) => current.filter((id) => id !== questionFromIndexDB.id!));
			await incrementFailedAttemptsForInterviewQuestion(questionFromIndexDB.id!);
		}
	});

	return <></>;
};
