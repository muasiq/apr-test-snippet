import { ParserOptions, parseStringPromise } from 'xml2js';
import { ZodRawShape, z } from 'zod';
import { shouldMockAnthropic } from './constants';

const DEFAULT_PARSER_OPTIONS: ParserOptions = {
	normalizeTags: false,
	explicitArray: false,
	normalize: true,
	trim: true,
};

export const schemaBasedCompletionParser = async <T>(
	completion: string,
	validator: z.ZodObject<ZodRawShape>,
	backup: T | null = null,
	trimToTag = '<findings>',
	parseOptions: ParserOptions = {},
): Promise<T> => {
	if (shouldMockAnthropic) {
		if (!backup) throw new Error('Mocked response not provided');
		return backup;
	}

	const text = completion.trim();
	const startOfXML = text.indexOf(trimToTag);
	const cleanedText = text.substring(startOfXML);

	try {
		const parsed = await (parseStringPromise(cleanedText, {
			...DEFAULT_PARSER_OPTIONS,
			...parseOptions,
		}) as Promise<object>);
		const validatedParsed = validator.parse(parsed);
		return validatedParsed as T;
	} catch (error) {
		if (backup) return backup;
		throw error;
	}
};
