import { parseStringPromise } from 'xml2js';
import logger from '~/common/utils/logger';
import { shouldMockAnthropic } from './constants';

type FreeFormFormat = {
	choice: string | null;
	explanation: string;
};

type SelectManyInitialFormat = {
	choice: { value: string[] };
	explanation: string;
};

type SelectManyOutputFormat = {
	choice: string[];
	explanation: string;
};

type GeneratedResponseFormat = {
	response: FreeFormFormat | SelectManyInitialFormat;
};

type ParserOptions = {
	allowArrayForChoice?: boolean;
};
export const parseCompletion = async (
	completion: string,
	{ allowArrayForChoice = false }: ParserOptions = {},
): Promise<SelectManyOutputFormat | FreeFormFormat> => {
	if (shouldMockAnthropic) {
		return {
			choice: null,
			explanation: 'mocked response',
		};
	}
	const trimToTag = '<response>';
	const text = completion.trim();
	const startOfXML = text.indexOf(trimToTag);
	const cleanedText = text.substring(startOfXML);
	try {
		const parsed = await (parseStringPromise(cleanedText, {
			normalizeTags: true,
			explicitArray: false,
			normalize: true,
			trim: true,
		}) as Promise<GeneratedResponseFormat>);
		if (parsed.response.choice === 'null' || parsed.response.choice === 'Null') {
			parsed.response.choice = null;
		}
		if (allowArrayForChoice) {
			const { choice, explanation } = parsed.response as SelectManyInitialFormat;
			return {
				choice: choice.value,
				explanation,
			};
		}
		return parsed.response as FreeFormFormat;
	} catch (e) {
		logger.error(`could not parse completion: ${text}`, e);
		return {
			choice: null,
			explanation: text,
		};
	}
};
