import { useState } from 'react';
import { api } from '~/common/utils/api';
import { trpc } from '~/common/utils/trpc';
import { useSyncInterviewItems } from '~/features/screens/Field/InterviewQuestion/common/hooks/useSyncInterviewItems';
import { SaveNurseInterviewSOCQuestionInput } from '~/server/api/routers/interviewQuestion/interviewQuestion.inputs';
import { AnsweredInterviewSetup, db } from '../common/utils/db';

const MAX_ATTEMPTS = 10;

interface InterviewSetupQuestion extends AnsweredInterviewSetup {
	id: number;
}
export const saveInterviewSetupQuestion = async (data: SaveNurseInterviewSOCQuestionInput) => {
	await db.answeredSetupQuestions.add({ ...data, attemptsToSend: 0 });
};

export const checkInterviewSetupDataExistence = async (patientId: number) => {
	const data = await db.answeredSetupQuestions.where({ patientId }).toArray();
	return {
		minutesSpentWithPatient: data.some((item) => item.minutesSpentWithPatient !== undefined),
		minutesSpentDriving: data.some((item) => item.minutesSpentDriving !== undefined),
		distanceTraveled: data.some((item) => item.distanceTraveled !== undefined),
		totalWounds: data.find((item) => item.totalWounds !== undefined)?.totalWounds,
	};
};

export const getSocDateTimeData = async (patientId: number) => {
	const data = await db.answeredSetupQuestions.where({ patientId }).toArray();
	return {
		SOCVisitTime: data.find((item) => item.SOCVisitTime !== undefined)?.SOCVisitTime,
		SOCVisitDate: data.find((item) => item.SOCVisitDate !== undefined)?.SOCVisitDate,
	};
};

export const getInterviewSetupThemesToReportOn = async (patientId: number) => {
	const [data] = await db.answeredSetupQuestions.where({ patientId }).toArray();
	return {
		selectedThemesToReportOn: data?.selectedThemesToReportOn,
	};
};

export const checkInterviewSetupDataExistenceForThemesToReportOn = async (patientId: number) => {
	const data = await db.answeredSetupQuestions.where({ patientId }).toArray();
	return {
		selectedThemesToReportOn: data.some((item) => item.selectedThemesToReportOn !== undefined),
	};
};

export const checkInterviewSetupDataExistenceForConfirmNormalLimits = async (patientId: number) => {
	const data = await db.answeredSetupQuestions.where({ patientId }).toArray();
	return {
		hasConfirmedThemesWithinNormalLimits: data.some(
			(item) => item.hasConfirmedThemesWithinNormalLimits !== undefined,
		),
	};
};

export const numberOfSetupItemsInDbForPatient = async (patientId: number) => {
	const count = await db.answeredSetupQuestions.where({ patientId }).count();
	return count;
};

const getFirstInterviewSetupQuestion = async (): Promise<InterviewSetupQuestion> => {
	const [firstQuestion] = await db.answeredSetupQuestions.limit(1).toArray();
	return firstQuestion as InterviewSetupQuestion;
};

const removeInterviewSetupQuestion = async (id: number) => {
	return await db.answeredSetupQuestions.delete(id);
};

const incrementFailedAttemptsForInterviewQuestion = async (id: number) => {
	const item = await db.answeredSetupQuestions.get(id);
	if (!item) {
		console.error('no item found');
		return;
	}
	return await db.answeredSetupQuestions.update(id, { attemptsToSend: item.attemptsToSend + 1 });
};

export const SyncInterviewSetupQuestions = (): JSX.Element => {
	const [currentlySyncingQuestions, setCurrentlySyncingQuestions] = useState<number[]>([]);
	const utils = trpc.useUtils();

	const { mutateAsync } = api.interviewQuestion.saveNurseInterviewSOCQuestion.useMutation({});

	useSyncInterviewItems(async () => {
		const questionFromIndexDB = await getFirstInterviewSetupQuestion();
		try {
			if (!questionFromIndexDB) return;

			if (currentlySyncingQuestions.includes(questionFromIndexDB.id)) {
				console.info('already syncing', questionFromIndexDB);
				return;
			}
			setCurrentlySyncingQuestions((current) => [...current, questionFromIndexDB.id]);
			console.info('syncing', questionFromIndexDB);

			if (questionFromIndexDB.attemptsToSend > MAX_ATTEMPTS) {
				console.info('too many attempts, removing', questionFromIndexDB);
				await removeInterviewSetupQuestion(questionFromIndexDB.id);
				setCurrentlySyncingQuestions((current) => current.filter((id) => id !== questionFromIndexDB.id));
				return;
			}
			await mutateAsync(questionFromIndexDB);

			await utils.patient.getById.invalidate();

			await removeInterviewSetupQuestion(questionFromIndexDB.id);

			setCurrentlySyncingQuestions((current) => current.filter((id) => id !== questionFromIndexDB.id));
		} catch (e) {
			console.error('error syncing', e);
			setCurrentlySyncingQuestions((current) => current.filter((id) => id !== questionFromIndexDB.id));
			await incrementFailedAttemptsForInterviewQuestion(questionFromIndexDB.id);
		}
	});

	return <></>;
};
