import Anthropic from '@anthropic-ai/sdk';
import { MessageCreateParamsNonStreaming } from '@anthropic-ai/sdk/resources';
import { compact } from 'lodash';
import { ZodRawShape, z } from 'zod';
import { logPromptAttempt, logPromptResult } from '../../routers/auditLog/auditLog.service';
import { shouldMockAnthropic } from './constants';
import { validXML } from './util';
import { schemaBasedCompletionParser } from './xmlParser';

export enum Models {
	HAIKU = 'claude-3-haiku-20240307',
	SONNET = 'claude-3-sonnet-20240229',
	OPUS = 'claude-3-opus-20240229',
	SONNET_V2 = 'claude-3-5-sonnet-20240620',
}

const MAX_RETRIES = 10;

export type GenerateCompletion = {
	temperature?: number;
	maxTokens?: number;
	systemPrompt?: string;
	humanPrompt: string;
	patientId: number;
	promptName: string;
	model?: Models;
};

export async function generateCompletion({
	systemPrompt = '',
	humanPrompt,
	temperature = 0,
	maxTokens = 4096,
	model = Models.SONNET_V2,
	patientId,
	promptName,
}: GenerateCompletion): Promise<string> {
	const logId = await logPromptAttempt(systemPrompt, humanPrompt, patientId, promptName);
	if (shouldMockAnthropic) {
		return Promise.resolve('mocked completion');
	}
	const anthropic = new Anthropic();
	const completion = await anthropic.messages.create(
		{
			model,
			max_tokens: maxTokens,
			temperature,
			system: systemPrompt,
			messages: [{ role: 'user', content: humanPrompt }],
		},
		{ maxRetries: MAX_RETRIES },
	);
	const text = getTextEntriesInCompletion(completion);
	void logPromptResult(text, completion.usage.input_tokens, completion.usage.output_tokens, logId);
	return text;
}

export type GenerateSecondPassCompletion = {
	result: string;
	error: unknown;
} & Pick<GenerateCompletion, 'temperature' | 'maxTokens' | 'model' | 'patientId' | 'promptName'>;

export const generateSecondPassCompletion = async ({
	error,
	result,
	patientId,
	promptName,
	temperature = 0,
	maxTokens = 4096,
	model = Models.SONNET_V2,
}: GenerateSecondPassCompletion) => {
	const errorText =
		error instanceof Error
			? error.message
			: error instanceof z.ZodError
				? JSON.stringify(error.flatten())
				: JSON.stringify(error);
	const secondPassPrompt = await generateCompletion({
		systemPrompt: `
		A previous-response was provided but an error occurred while parsing it, here is the previous-output:
		<previous-output>
			${result}
		</previous-output>
		Here is the error that occurred while parsing the previous-output:
		<error>
			${errorText}
		</error>
		${validXML}
		`,
		humanPrompt: `Correct the error that occurred while parsing the previous completion, using the details on what makes valid xml, and respond with the new corrected output only.`,
		patientId,
		promptName,
		maxTokens,
		temperature,
		model,
	});
	return secondPassPrompt;
};

export async function schemaBasedCompletionParserWithRetry<T>({
	result,
	patientId,
	schema,
	backup = null,
	promptName,
	trimToTag,
}: {
	result: string;
	patientId: number;
	schema: z.ZodObject<ZodRawShape>;
	backup: T | null;
	promptName: string;
	trimToTag?: string;
}) {
	try {
		return await schemaBasedCompletionParser<T>(result, schema);
	} catch (error) {
		const secondPassResult = await generateSecondPassCompletion({
			error,
			patientId,
			promptName,
			result,
		});
		return await schemaBasedCompletionParser<T>(secondPassResult, schema, backup, trimToTag);
	}
}

export type UrlAndType = { url: string; contentType: string };
export type GenerateImageBasedCompletion = { imageUrls: UrlAndType[] } & GenerateCompletion;

type AllowedContentType = Anthropic.ImageBlockParam['source']['media_type'];

export async function generateImageBasedCompletion({
	systemPrompt = '',
	humanPrompt,
	temperature = 0,
	maxTokens = 4096,
	model = Models.SONNET_V2,
	imageUrls,
}: GenerateImageBasedCompletion): Promise<string> {
	if (shouldMockAnthropic) {
		return Promise.resolve('mocked completion');
	}
	const images = await Promise.all(imageUrls.map((i) => convertImageUrlToBase64(i.url, i.contentType)));
	const imageMessages: MessageCreateParamsNonStreaming['messages']['0']['content'] = images.map((i) => ({
		type: 'image',
		source: { type: 'base64', media_type: i.contentType as AllowedContentType, data: i.data },
	}));
	const messages: Anthropic.Messages.MessageCreateParamsNonStreaming['messages'] = [
		{ role: 'user', content: [...imageMessages, { type: 'text', text: humanPrompt }] },
	];
	const anthropic = new Anthropic();
	const completion = await anthropic.messages.create(
		{
			model,
			max_tokens: maxTokens,
			temperature,
			system: systemPrompt,
			messages,
		},
		{ maxRetries: MAX_RETRIES },
	);
	return getTextEntriesInCompletion(completion);
}

async function convertImageUrlToBase64(imageUrl: string, contentType: string) {
	const response = await fetch(imageUrl);
	const blob = await response.blob();
	const buffer = await blob.arrayBuffer();
	const base64 = Buffer.from(new Uint8Array(buffer)).toString('base64');
	return { data: base64, contentType };
}

function getTextEntriesInCompletion(completion: Anthropic.Messages.Message): string {
	const completionWithTextOnly = completion.content.map((c) => {
		if (c.type === 'text') {
			return c.text;
		}
		return null;
	});
	const text = compact(completionWithTextOnly).join(' ');
	return text;
}
