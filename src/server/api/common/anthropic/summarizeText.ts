import { isArray } from 'lodash';
import { parseStringPromise } from 'xml2js';
import logger from '~/common/utils/logger';
import { generateCompletion } from './claude';
import { shouldMockAnthropic } from './constants';

type SummarizeResponseFormat = {
	cleaned: {
		value: string[];
	};
};

export const summarizeText = async (textToSummarize: string, patientId: number): Promise<string[]> => {
	if (textToSummarize.length < 100) {
		return [textToSummarize];
	}
	if (shouldMockAnthropic) {
		return ['mocked response'];
	}

	const systemPrompt = `
		<transcript>
			${textToSummarize}
		</transcript>
		<output-format>
			ONLY RESPOND with valid xml following this format: <cleaned><value> [section chunk here] </value>[...additional sections]</cleaned> 
			DO NOT PUT ANY OTHER TEXT BEFORE OR AFTER THE CLEANED TAG
		</output-format>
	`;
	const humanPrompt = `Clean up and chunk into multiple sections the transcript provided. Retain all original content, but clean up the transcript by removing filler words and using appropriate punctuation.`;

	try {
		const completion = await generateCompletion({
			systemPrompt,
			humanPrompt,
			maxTokens: 2000,
			patientId,
			promptName: 'summarize_text',
		});
		const summarizedTextArray = await parseSummarizeCompletion(completion);
		logger.info('summarized text: ', summarizedTextArray);
		return isArray(summarizedTextArray) ? summarizedTextArray : [summarizedTextArray];
	} catch (error) {
		logger.error('Error summarizing text: ', error);
		return [];
	}
};

const parseSummarizeCompletion = async (completion: string): Promise<string[]> => {
	const text = completion.trim();
	try {
		const parsed = await (parseStringPromise(text, {
			normalizeTags: true,
			explicitArray: false,
			normalize: true,
			trim: true,
		}) as Promise<SummarizeResponseFormat>);
		if (!parsed.cleaned?.value) {
			throw new Error('No summarized data found');
		}
		return parsed.cleaned.value;
	} catch (e) {
		logger.error('could not summarize text: ', text);
		throw e;
	}
};
