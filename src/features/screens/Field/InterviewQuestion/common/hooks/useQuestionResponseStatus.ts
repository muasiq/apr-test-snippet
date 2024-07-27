import { isEmpty } from 'lodash';
import { useEffect, useState } from 'react';
import { PatientWithJoins } from '../../../../../../server/api/routers/patient/patient.types';
import { getQuestionByShortLabel } from '../../components/SyncInterviewQuestions';
import { getInterviewQuestionByShortLabelForPatient } from '../utils/mainInterviewUtil';

type Params = {
	patientData: PatientWithJoins;
	questionShortLabel: string | undefined;
	dictate: string | undefined;
};
export const useQuestionResponseStatus = ({ patientData, questionShortLabel, dictate }: Params) => {
	const [textResponse, setTextResponse] = useState('');
	const [hasSavedAudioResponse, setHasSavedAudioResponse] = useState(false);

	async function checkResponse() {
		if (!patientData) {
			setTextResponse('');
			setHasSavedAudioResponse(false);
			return;
		}

		const indexedDbAnswer = await getQuestionByShortLabel(Number(patientData.id), questionShortLabel);
		const answeredQuestionInDb = getInterviewQuestionByShortLabelForPatient(patientData, questionShortLabel);
		if (!isEmpty(indexedDbAnswer)) {
			setTextResponse(indexedDbAnswer.textResponse ?? '');
			setHasSavedAudioResponse(!!indexedDbAnswer.audioRecording);
			return;
		} else if (!isEmpty(answeredQuestionInDb)) {
			setTextResponse(answeredQuestionInDb.textResponse ?? '');
			setHasSavedAudioResponse(!!answeredQuestionInDb.cloudStorageAudioFileLocation);
			return;
		}
		setTextResponse('');
		setHasSavedAudioResponse(false);
	}

	useEffect(() => {
		void checkResponse();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dictate, questionShortLabel, patientData?.id]);

	return { textResponse, setTextResponse, hasSavedAudioResponse };
};
