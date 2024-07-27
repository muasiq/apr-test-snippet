import { PatientArtifactTag } from '@prisma/client';
import { compact, groupBy } from 'lodash';
import { z } from 'zod';
import logger from '~/common/utils/logger';
import { CustomSuggesters } from '../../../../../assessments/apricot/custom';
import { Configuration } from '../../../../../assessments/configurations';
import { PatientWithAssessmentContext } from '../../../routers/patient/patient.types';
import { shouldMockAnthropic } from '../constants';
import { GenerateSuggestionParams } from '../generateSuggestion';
import { limitedNotesAndArtifactPrompt, validXML, validatedString } from '../util';
import { backupCarePlanSuggestion } from './backup';
import { goalsForProblemPrompt } from './goalsForProblemSuggestion';

export async function carePlanSuggestion(params: GenerateSuggestionParams) {
	if (shouldMockAnthropic) {
		return backupCarePlanSuggestion;
	}
	const { configuration, patient } = params;

	const problemsResult = await careProblemsPrompt(configuration, patient);
	const problems = problemsResult.response.areas;

	const problemItems = compact(
		await Promise.all(
			problems.map(async (problem) => {
				try {
					const result = await goalsForProblemPrompt(configuration, patient, problem);
					return result;
				} catch (e) {
					logger.error('Skipping care plan problem:', e);
					return undefined;
				}
			}),
		),
	);

	const grouped = groupBy(problemItems, 'category');

	return {
		choice: {
			areas: Object.keys(grouped).map((category) => ({
				category,
				problems: grouped[category]?.map((item) => ({
					name: item.name,
					goalDetails: item.goalDetails,
					interventionDetails: item.interventionDetails,
				})),
			})),
		},
	};
}

async function careProblemsPrompt(configuration: Configuration, patient: PatientWithAssessmentContext) {
	const humanPrompt = `For which of the provided areas does the patient need skilled care?`;
	const backupResponse = {
		response: { areas: [] },
	} as GeneratedProblemsResponseFormat;

	return limitedNotesAndArtifactPrompt({
		patient,
		humanPrompt,
		artifactTags: [PatientArtifactTag.ReferralDocument],
		getSystemPrompt: getIdentifyProblemsSystemPrompt(configuration),
		schema: generatedProblemsSchema(configuration),
		backupResult: backupResponse,
		promptName: `${CustomSuggesters.CARE_PLAN}-problems`,
		trimToTag: '<response>',
		parseOptions: { normalize: false },
	});
}

const generatedProblemsSchema = (configuration: Configuration) => {
	const categories = configuration.pathways.map((item) => item.problemCategory);
	const areas = configuration.pathways.flatMap((item) => item.problemItems.map((p) => p.problemItem));

	return z.object({
		response: z.object({
			areas: z.array(
				z.object({
					name: z.string().transform((val) => validatedString(areas, val)),
					category: z.string().transform((val) => validatedString(categories, val)),
				}),
			),
		}),
	});
};

type GeneratedProblemsResponseFormat = z.infer<ReturnType<typeof generatedProblemsSchema>>;

export const getIdentifyProblemsSystemPrompt = (configuration: Configuration) => (notes: string, artifacts: string) => {
	const areas = configuration.pathways.flatMap((item) =>
		item.problemItems.map((p) => ({ name: p.problemItem, category: item.problemCategory })),
	);
	const areasXml = areas
		.map(
			({ name, category }) => `
				<area>
					<name>${name}</name>
					<category>${category}</category>
				</area>
			`,
		)
		.join('\n');

	return `
		Below is some data from artifacts on a patient:

		<artifacts>
		${artifacts}
		</artifacts>

		Below are some notes from a patient visit provided by a skilled nurse:

		<notes>
		${notes}
		</notes>

		Please review the notes and artifacts to determine which of the following problem areas the patient needs skilled care in.

		<areas>
		${areasXml}
		</areas>


		You ALWAYS follow these guidelines when writing your response:
		<guidelines>
			- You don't have access to functions. Therefore, don't refer to them.
			<output-format>
				ONLY RESPOND with valid xml following this format:
				<response>
					<areas>
						<name>[area name]</name>
						<category>[category name]</category>
					</areas>
				</response>
				${validXML}
				DO NOT PUT ANY OTHER TEXT BEFORE OR AFTER THE RESPONSE TAG
			</output-format>
		</guidelines>
	`;
};
