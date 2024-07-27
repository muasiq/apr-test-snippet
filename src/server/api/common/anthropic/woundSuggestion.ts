import { PatientArtifactTag } from '@prisma/client';
import { z } from 'zod';
import { PatientWithAssessmentContext } from '../../routers/patient/patient.types';
import { cloudStorage } from '../gcp/cloudStorage';
import { generateCompletion, generateImageBasedCompletion } from './claude';
import { GenerateSuggestionParams } from './generateSuggestion';
import { validXML } from './util';
import { schemaBasedCompletionParser } from './xmlParser';

export async function woundSuggestion(params: GenerateSuggestionParams) {
	const woundResult = await woundPrompt(params.patient);
	return woundResult;
}

async function woundPrompt(patient: PatientWithAssessmentContext) {
	const humanPrompt = `Provide requested wound details`;
	const backupResponse = { findings: null } as GeneratedWound;

	const woundImage = patient.PatientArtifacts.find((artifact) => artifact.tagName === PatientArtifactTag.Wounds);
	if (!woundImage) {
		throw new Error('No wound image found');
	}
	const { signedUrl } = await cloudStorage.createSignedURL(woundImage.cloudStorageLocation!, 'read', false);

	const completion = await generateImageBasedCompletion({
		systemPrompt: getWoundSystemPrompt(),
		humanPrompt,
		patientId: patient.id,
		promptName: 'woundSuggestion',
		imageUrls: [{ url: signedUrl, contentType: woundImage.fileType }],
	});

	try {
		return await schemaBasedCompletionParser(completion, generatedWoundSchema);
	} catch (error) {
		const errorText =
			error instanceof Error
				? error.message
				: error instanceof z.ZodError
					? JSON.stringify(error.flatten())
					: JSON.stringify(error);
		const secondPassCompletion = await generateCompletion({
			systemPrompt: `
			An error occurred while processing the wound details. Please try again.
			<system-prompt>
				${getWoundSystemPrompt()}
			</system-prompt>
			<previous-output>
				${completion}
			</previous-output>
			<error>
				${errorText}
			</error>
			`,
			humanPrompt: `Correct the error that occurred while parsing the previous completion.`,
			patientId: patient.id,
			promptName: 'woundSuggestion',
		});
		return await schemaBasedCompletionParser(secondPassCompletion, generatedWoundSchema, backupResponse);
	}
}

const generatedWoundSchema = z.object({
	findings: z
		.object({
			dimensions: z.object({
				length: z.string(),
				depth: z.string(),
				width: z.string(),
			}),
			description: z.string(),
		})
		.nullish(),
});
type GeneratedWound = z.infer<typeof generatedWoundSchema>;

export function getWoundSystemPrompt() {
	return `
		An image of a wound is attached. 

        Use the image to return the requested response below

		You ALWAYS follow these guidelines when writing your response:
		<guidelines>
			- You don't have access to functions. Therefore, don't refer to them.
			<output-format>
				ONLY RESPOND with valid xml following this format:
				<findings>
                    <dimensions>
                        <length>[length of the wound in inches]</length>
                        <width>[width of the wound in inches]</width>
                        <depth>[depth of the wound in inches]</depth>
                    </dimensions>
                    <description>[description of the wound]</description>
				</findings>
				${validXML}
				DO NOT PUT ANY OTHER TEXT BEFORE OR AFTER THE FINDINGS TAG
			</output-format>
		</guidelines>
	`;
}
