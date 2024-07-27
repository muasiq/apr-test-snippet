import { v2 } from '@google-cloud/speech';
import { google } from '@google-cloud/speech/build/protos/protos';
import { orderBy } from 'lodash';
import logger from '~/common/utils/logger';
import { env } from '~/env.mjs';
import { delay } from '../../../../common/utils/delay';
import { cloudStorage } from './cloudStorage';

const location = 'global';
const recognizerName = 'apricot-v1';
const recognizer = `projects/${env.GOOGLE_CLOUD_SPEECH_PROJECT_ID}/locations/${location}/recognizers/${recognizerName}`;
const MAX_WAIT_ATTEMPTS = 180;

const shouldMockCloudSpeech = env.GOOGLE_CLOUD_SPEECH_PROJECT_ID === 'localhost';
const speechClient = setupSpeechClient();

export const cloudSpeech = {
	async transcribeAudio(audioURL: string, _contentType: string) {
		const inputUri = cloudStorage.location(audioURL);
		const prefix = `transcriptions/${audioURL}`;
		const outputUri = cloudStorage.location(prefix);
		const request: google.cloud.speech.v2.IBatchRecognizeRequest = {
			files: [{ uri: inputUri }],
			recognizer,
			recognitionOutputConfig: {
				gcsOutputConfig: {
					uri: outputUri,
				},
			},
		};
		const [job] = await speechClient.batchRecognize(request);
		await job.promise();
		const file = await waitForResults(prefix);

		const [results] = await file.download();
		const payload = JSON.parse(results.toString('utf8')) as google.cloud.speech.v2.BatchRecognizeResults;
		const transcriptionData = payload.results;
		if (!transcriptionData) {
			throw new Error('No transcription data found');
		}
		return handleTranscribeResponse(transcriptionData);
	},
};

async function waitForResults(prefix: string, retries = 0) {
	if (shouldMockCloudSpeech) {
		return {
			download: () =>
				Promise.resolve([JSON.stringify({ results: [{ alternatives: [{ transcript: 'mocked response' }] }] })]),
		};
	}
	const [files] = await cloudStorage.bucket().getFiles({ prefix });
	if (!files.length) {
		if (retries > MAX_WAIT_ATTEMPTS) {
			throw new Error('failed to wait for transcription to exist');
		}
		await delay(2000);
		return waitForResults(prefix, retries + 1);
	}
	if (files.length > 1) {
		const ordered = orderBy(
			files,
			(f) => {
				return f.metadata.timeCreated ? new Date(f.metadata.timeCreated) : f.metadata.size;
			},
			'desc',
		);
		return ordered[0]!;
	}
	return files[0]!;
}

function handleTranscribeResponse(results: google.cloud.speech.v2.ISpeechRecognitionResult[]) {
	const transcriptionConfidence = getTranscribedAudioConfidence(results);

	const transcription = results
		.flatMap((result) => (result.alternatives ? result.alternatives.map((alt) => alt.transcript) : []))
		.join(' ');

	logger.info(`Transcription: ${transcription}`);
	logger.info(`Transcription Confidence: ${transcriptionConfidence}`);
	return { transcription, transcriptionConfidence };
}

function getTranscribedAudioConfidence(transcriptionResults: google.cloud.speech.v2.ISpeechRecognitionResult[]) {
	return transcriptionResults.reduce((maxConfidence, result) => {
		const resultMaxConfidence = result.alternatives?.reduce((currentMax, alt) => {
			return alt.confidence && alt.confidence > currentMax ? alt.confidence : currentMax;
		}, 0);
		return resultMaxConfidence && resultMaxConfidence > maxConfidence ? resultMaxConfidence : maxConfidence;
	}, 0);
}

function setupSpeechClient() {
	if (shouldMockCloudSpeech) {
		return {
			batchRecognize: () => {
				return [
					{
						promise: () => {
							return Promise.resolve([
								{
									results: [
										{
											alternatives: [
												{
													transcript: 'mocked response',
												},
											],
										},
									],
								},
							]);
						},
					},
				];
			},
		};
	}
	return new v2.SpeechClient({
		projectId: env.GOOGLE_CLOUD_SPEECH_PROJECT_ID,
		credentials: {
			client_email: env.GOOGLE_CLOUD_SPEECH_SERVICE_ACCOUNT,
			private_key: env.GOOGLE_CLOUD_SPEECH_SERVICE_ACCOUNT_KEY.replace(/\\n/g, '\n'),
		},
	});
}
