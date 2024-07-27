import { ConfigurationType, PatientArtifactTag } from '@prisma/client';
import { z } from 'zod';
import { CustomSuggesters } from '../../../../assessments/apricot/custom';
import { emptyStringBackup } from '../../../../common/utils/emptyStringBackup';
import { parseDate } from '../../../../common/utils/parseDate';
import {
	defaultForReferralAdministeredBy,
	vaccineTypeOptions,
} from '../../../../features/screens/Field/PatientDetail/components/Assessment/QuestionTypes/AssessmentVaccinationForm';
import { PatientWithAssessmentContext } from '../../routers/patient/patient.types';
import { generateCompletion, generateSecondPassCompletion, schemaBasedCompletionParserWithRetry } from './claude';
import { GenerateSuggestionParams } from './generateSuggestion';
import { validXML } from './util';
import { schemaBasedCompletionParser } from './xmlParser';

export const vaccinationsSuggestion = async ({ patient }: GenerateSuggestionParams) => {
	const result = await vaccinationsSuggestionPrompt(patient);

	const withVaccineType = await Promise.all(
		result.vaccinations.vaccination.map(async (vaccination) => {
			const configType = patient.configurationType;
			const vaccineType = await vaccineTypeFromName(vaccination.vaccineName, configType, patient.id);
			return { ...vaccination, vaccineType };
		}),
	);

	return {
		choice: {
			vaccines: formatVaccineAttributes(withVaccineType),
		},
	};
};

const vaccineTypeFromName = async (vaccineName: string, configType: ConfigurationType, patientId: number) => {
	const systemPrompt = `
		Here is a list of vaccine types:
		<list>
			${vaccineTypeOptions.map((o) => o.id).join('\n')}
		</list>


		Here is the xml output format you should respond in:
		<choice>
			[one of the options from list here]
		</choice>
		${validXML}
		DO NOT PUT ANY TEXT BEFORE OR AFTER THE CHOICE TAG:
	`;

	const humanPrompt = `
		Select the vaccine type for ${vaccineName} from the provided list that best matches. If no option in the list makes sense, then select "Other".
	`;

	const result = await generateCompletion({
		systemPrompt,
		humanPrompt,
		patientId,
		promptName: `${CustomSuggesters.VACCINATION}-type-from-name`,
	});

	const parsed = await schemaBasedCompletionParserWithRetry<GeneratedVaccinationTypeResponseFormat>({
		result,
		patientId,
		schema: generatedVaccinationTypeResponseFormatSchema,
		promptName: `${CustomSuggesters.VACCINATION}-type-from-name`,
		backup: { choice: 'Other' },
		trimToTag: '<choice>',
	});

	return parsed.choice;
};

const formatVaccineAttributes = (vaccines: GeneratedVaccinationsResponseFormat['vaccinations']['vaccination']) => {
	return vaccines.map((vaccination) => {
		const { administerDate, lot, manufacturer, route, ...rest } = vaccination;
		const parsedDate = parseDate(administerDate);
		return {
			...rest,
			administerDate: parsedDate,
			administeredBy: defaultForReferralAdministeredBy.id,
			notes: formatNote({ lot, manufacturer, route }),
		};
	});
};

const formatNote = (attributes: { lot?: string | null; manufacturer?: string | null; route?: string | null }) => {
	return `lot: ${emptyStringBackup(attributes.lot)}\nmanufacturer: ${emptyStringBackup(
		attributes.manufacturer,
	)}\nroute: ${emptyStringBackup(attributes.route)}`;
};

const getRelevantText = (patient: PatientWithAssessmentContext) => {
	const referralDocuments = patient.PatientArtifacts.filter(
		(artifact) => artifact.tagName === PatientArtifactTag.ReferralDocument,
	);
	const allReferralOCRText = referralDocuments.reduce((allText, document) => {
		const docText = document.patientDocumentArtifact?.documentRawText ?? '';
		return allText + docText;
	}, '');
	return allReferralOCRText;
};

const vaccinationsSuggestionPrompt = async (patient: PatientWithAssessmentContext) => {
	const allReferralOCRText = getRelevantText(patient);

	const systemPrompt = `
		Here is the ocr output from a medical referral for a patient. It has the patient's full health history and can be quite detailed. Within it we want to find the patient's vaccination/immunization information. This will typically have a header of Immunizations or Vaccinations. It can span multiple pages, when doing so, it often will have Immunizations/Vaccinations (continued). Following the header will be multiple items, usually having some or all of the following information:
			- vaccineName (e.g PNEUMOCOCCAL)
			- administerDate (e.g 10/21/2022)
			- administeredByName (e.g John Doe)
			- manufacturer (e.g WAL)
			- route (e.g IM/R. Deltoid)
			- lot (e.g R12276)
			- dose (e.g .5ml)
		output-format instructions are included
		<ocr>
		${allReferralOCRText}
		</ocr>
		<output-format>
			here is the xml output-format you should respond in:
			<vaccinations>
				<vaccination>
					<vaccineName>
						[name here]
					</vaccineName>
					<administerDate>
						[administerDate here]
					</administerDate>
					<administeredByName>
						[adminByName here]
					</administeredByName>
					<manufacturer>
						[manufacturer here]
					</manufacturer>
					<route>
						[route here]
					</route>
					<lot>
						[lot here]
					</lot>
					<dose>
						[dose here]
					</dose>
				</vaccination>
			</vaccinations>
			${validXML}
			DO NOT PUT ANY TEXT BEFORE OR AFTER THE VACCINATIONS TAG.
		</output-format>
    `;
	const humanPrompt = `Find the vaccinations from the ocr.`;
	const result = await generateCompletion({
		systemPrompt,
		humanPrompt,
		patientId: patient.id,
		promptName: CustomSuggesters.VACCINATION,
	});

	try {
		return await parseCompletion(result);
	} catch (error) {
		const secondPassResult = await generateSecondPassCompletion({
			result,
			error,
			patientId: patient.id,
			promptName: CustomSuggesters.VACCINATION,
		});
		return await parseCompletion(secondPassResult, true);
	}
};

const vaccinationSchema = z.object({
	vaccineName: z.string(),
	administerDate: z.string().nullish(),
	administeredByName: z.string().nullish(),
	manufacturer: z.string().nullish(),
	route: z.string().nullish(),
	lot: z.string().nullish(),
	dose: z.string().nullish(),
});

const generatedVaccinationsResponseBaseSchema = z.object({
	vaccinations: z.object({
		vaccination: z.union([z.array(vaccinationSchema), vaccinationSchema]),
	}),
});
type GeneratedVaccinationsResponseBaseFormat = z.infer<typeof generatedVaccinationsResponseBaseSchema>;

const generatedVaccinationsResponseFormatSchema = z.object({
	vaccinations: z.object({
		vaccination: z.array(vaccinationSchema),
	}),
});
type GeneratedVaccinationsResponseFormat = z.infer<typeof generatedVaccinationsResponseFormatSchema>;

const parseCompletion = async (
	completion: string,
	withBackup = false,
): Promise<GeneratedVaccinationsResponseFormat> => {
	const parsed = await schemaBasedCompletionParser<GeneratedVaccinationsResponseBaseFormat>(
		completion,
		generatedVaccinationsResponseBaseSchema,
		withBackup ? { vaccinations: { vaccination: [] } } : null,
		'<vaccinations>',
	);

	if (!Array.isArray(parsed.vaccinations.vaccination)) {
		parsed.vaccinations.vaccination = [parsed.vaccinations.vaccination];
	}

	return parsed as GeneratedVaccinationsResponseFormat;
};

const generatedVaccinationTypeResponseFormatSchema = z.object({
	choice: z.string(),
});
type GeneratedVaccinationTypeResponseFormat = z.infer<typeof generatedVaccinationTypeResponseFormatSchema>;
