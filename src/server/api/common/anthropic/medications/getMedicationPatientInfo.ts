import { z } from 'zod';
import { additionalMedicationDescriptorOptions, hchb, medStatuses } from '~/common/constants/medication';
import { splitAndCoerceToStringArray } from '~/common/utils/zod';
import { CustomSuggesters } from '../../../../../assessments/apricot/custom';
import { PatientWithAssessmentContext } from '../../../routers/patient/patient.types';
import { Models, generateCompletion, schemaBasedCompletionParserWithRetry } from '../claude';
import { stringifyList, validXML, validatedString, validatedStringList } from '../util';
import { getOcrTextFromPatient, getRelevantInterviewNotes } from './utils';

const promptResponseSchema = z.object({
	response: z
		.object({
			endDate: z.string().nullish(),
			startDate: z.string().nullish(),
			status: z
				.string()
				.nullish()
				.transform((val) => (val ? validatedString(medStatuses as unknown as string[], val) : val)),
			route: z
				.string()
				.nullish()
				.transform((val) => (!val ? val : validatedString(hchb.routes, val))),
			frequency: z
				.string()
				.nullish()
				.transform((val) => (val ? validatedString(hchb.frequency, val) : val)),
			dose: z.string().nullish(),
			doseAmount: z.string().nullish(),
			doseUnit: z.string().nullish(),
			instructions: z.string().nullish(),
			reason: z.string().nullish(),
			understanding: splitAndCoerceToStringArray.transform((val) =>
				validatedStringList(hchb.understandings, val),
			),
			additionalDescriptors: splitAndCoerceToStringArray.transform((val) =>
				validatedStringList(additionalMedicationDescriptorOptions, val),
			),
		})
		.nullish(),
});

type PromptResponse = z.infer<typeof promptResponseSchema>;
type Medication = { name: string; availableDoseUnits?: string[] };

export async function getMedicationPatientInfo(params: {
	medication: Medication;
	model?: Models;
	patient: PatientWithAssessmentContext;
}) {
	const { medication, patient, model } = params;

	const ocr = getOcrTextFromPatient(patient);
	const notes = getRelevantInterviewNotes(patient);

	const systemPrompt = getPrompt({ ocr, notes, medication });
	const humanPrompt = `Determine information about the medication "${medication.name}" from the ocr and notes.`;
	const result = await generateCompletion({
		systemPrompt,
		humanPrompt,
		patientId: patient.id,
		promptName: CustomSuggesters.MEDICATION,
		model,
	});

	const parsed = await schemaBasedCompletionParserWithRetry<PromptResponse>({
		result,
		patientId: patient.id,
		schema: promptResponseSchema,
		promptName: `${CustomSuggesters.MEDICATION}-medicationInfo`,
		backup: { response: null },
	});

	return parsed.response;
}

function getPrompt({ ocr, notes, medication }: { ocr: string; notes: string; medication: Medication }) {
	return `
Here is the ocr output of an image of the patient's medication list. Sometimes notes/further instructions, reason for taking, status, and endDate for each medication are included.

<ocr>
${ocr}
</ocr>

And here are notes from a patient visit provided by a skilled nurse:

<notes>
${notes}
</notes>

Carefully review the ocr output and notes to determine information about the medication "${medication.name}". Please provide the following information:

You ALWAYS follow these guidelines when writing your response:
<guidelines>
	- You don't have access to functions. Therefore, don't refer to them.
	<output-format>
		ONLY RESPOND with valid xml following this format:
		<response>
			<strength>[extract the strength of the drug (e.g. 300mg, 0.14g)]</strength>
			<route>[method of administration (select the best match from this list: ${stringifyList(hchb.routes)}]</route>
			<doseAmount>[numeric amount of medication taken per dosage]</doseAmount>
			<doseUnit>[${getDoseUnitInstructions(medication.availableDoseUnits)}]</doseUnit>
			<frequency>[how often the medication should be taken (select the best match from this list: ${stringifyList(hchb.frequency)})]</frequency>
			<status>[medication status (select the best match from this list: ${stringifyList(medStatuses)})]</status>
			<reason>[reason why the patient is taking the medication. The reason should be short. (e.g. "Dry eyes", "Diabetes management", "Constipation," ,"Depression")]</reason>
			<understanding>[the patient's understanding of the medication. Indicate which of the options the patient was educated on from the notes (options are ${stringifyList(hchb.understandings)}). If the nurse indicates in a general way that she did a medication review or taught on medications, select the first three options. Only exclude one of the three options or choose "None of these" if the nurse specifically indicates that the patient needs additional teaching on one or all of the topics.]</understanding>
			<agencyAdministered>[determine whether the home health agency staff will be administering this medication to the patient. "Yes" or "No". Unless the notes explicitly say otherwise, select "No" as the response.]</agencyAdministered>
			<instructions>[list any additional instructions not captured by the other fields. Include all relevant information, but use as few words as possible in the response]</instructions>
			<additionalDescriptors>[additional medication descriptors. Indicate which of the options apply to the the patient (options are ${stringifyList(additionalMedicationDescriptorOptions)}). Select "None of these" if none of the option apply to the patient.]</additionalDescriptors>
			<startDate>[start date for medication use. Leave empty if not provided. (e.g. 02/10/2024)]</startDate>
			<endDate>[end date for medication use. Leave empty if not provided. (e.g. 02/12/2024)]</endDate>
		</response>
		${validXML}
		DO NOT PUT ANY OTHER TEXT BEFORE OR AFTER THE RESPONSE TAG
	</output-format>
</guidelines>

The medication dosage should be in the "<numeric amount> <unit>" format (eg. "1 tablet", "2 capsules"), then split into doseAmount and doseUnit.
`;
}

function getDoseUnitInstructions(units?: string[]) {
	const instructions = 'form or unit of the dosage amount';
	if (!units?.length) return `${instructions} (eg. capsule, tablet, solution, etc)`;
	return `${instructions} (select the best match from this list: ${stringifyList(units)}).`;
}
