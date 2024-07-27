import { z } from 'zod';
import { CustomSuggesters } from '../../../../../assessments/apricot/custom';
import { generateCompletion, schemaBasedCompletionParserWithRetry } from '../claude';
import { GenerateSuggestionParams } from '../generateSuggestion';
import { validXML } from '../util';
import { getOcrTextFromPatient, getRelevantInterviewNotes } from './utils';

const generatedMedicationResponseFormatSchema = z.object({
	findings: z.object({
		medication: z.array(
			z.object({
				name: z.string(),
				strength: z.string().nullish(),
				doseUnit: z.string().nullish(),
			}),
		),
	}),
});

type GeneratedMedicationsResponseFormat = z.infer<typeof generatedMedicationResponseFormatSchema>;

export async function extractMedications(params: GenerateSuggestionParams) {
	const { patient } = params;

	const ocrText = getOcrTextFromPatient(patient);
	const notes = getRelevantInterviewNotes(patient);

	const systemPrompt = getPrompt(ocrText, notes);
	const humanPrompt = `Find the medications and the attributes mentioned from the ocr and notes.`;

	const result = await generateCompletion({
		systemPrompt,
		humanPrompt,
		patientId: patient.id,
		promptName: CustomSuggesters.MEDICATION,
		model: params.model,
	});

	const parsed = await schemaBasedCompletionParserWithRetry<GeneratedMedicationsResponseFormat>({
		result,
		patientId: patient.id,
		schema: generatedMedicationResponseFormatSchema,
		promptName: CustomSuggesters.MEDICATION,
		backup: { findings: { medication: [] } },
	});

	return parsed.findings.medication;
}

function getPrompt(ocr: string, notes: string) {
	return `
You will be extracting all unique medications mentioned in a patient's records, which include an ocr output of a medication list and a nurse's notes from a recent visit.


Here is the ocr output of an image of a medication list:

<ocr>
${ocr}
</ocr>

And here are some notes from a patient visit provided by a skilled nurse:

<notes>
${notes}
</notes>

The ocr output and nurse notes may be handwritten or transcribed, so your best to resolve any typos or errors based on your knowledge, but do not infer anything that is not explicitly stated. If any of the details are not specified for a given medication, leave that field blank.

Your task is to carefully read through the medication list and visit notes and extract all medications that are mentioned. Be sure to include any medications in the nurse's notes including oxygen, wound care supplies, antiseptics, solutions, or creams. Attempt to match the format in the examples.

For each medication, try to determine the following information if provided:

<output-format>
	Here is the xml output-format you should respond in:
	<findings>
		<medication>
            <name>[drug name (e.g. "Advil", "Protonix", "Betadine")]</name>
			<strength>[drug strength (e.g. "300 mg", "10 mcg", "0.14 %", "1 gram")]</strength>
            <doseUnit>[unit of measurement for dosage (e.g. "capsule", "tablet", "drops", "solution")]</doseUnit>
		</medication>
	</findings>
	${validXML}
	DO NOT PUT ANY TEXT BEFORE OR AFTER THE FINDINGS TAG.
</output-format>
`;
}
