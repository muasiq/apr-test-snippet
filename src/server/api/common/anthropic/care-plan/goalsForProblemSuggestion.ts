import { PatientArtifactTag } from '@prisma/client';
import { z } from 'zod';
import { ProblemItem } from '~/assessments/home-care-home-base/data-files/scripts/clinicalPathways';
import { getProblemDetails } from '~/common/utils/carePlan';
import { CustomSuggesters } from '../../../../../assessments/apricot/custom';
import { Configuration } from '../../../../../assessments/configurations';
import { PatientWithAssessmentContext } from '../../../routers/patient/patient.types';
import { limitedNotesAndArtifactPrompt, validXML } from '../util';

export async function goalsForProblemPrompt(
	configuration: Configuration,
	patient: PatientWithAssessmentContext,
	problem: { name?: string; category?: string },
) {
	const problemDetails = getProblemDetails(problem?.name ?? '', configuration);
	const details = await Promise.all([
		getGoalDetails({ patient, problem: problemDetails }),
		getInterventionDetails({ patient, problem: problemDetails }),
	]);

	return {
		...problem,
		goalDetails: details[0],
		interventionDetails: details[1],
	};
}

const templateSchema = z.object({
	response: z.string().min(1),
});

async function getGoalDetails({ patient, problem }: { patient: PatientWithAssessmentContext; problem: ProblemItem }) {
	const humanPrompt = `Provide the goal for problem ${problem.problemItemClean} following the template`;
	const getSystemPrompt = getTemplatePrompt(
		`Provide goal details that address the problem "${problem.problemItemClean}".`,
		problem.goalTemplate,
	);

	const interventionResult = await limitedNotesAndArtifactPrompt({
		humanPrompt,
		getSystemPrompt,
		patient,
		artifactTags: [PatientArtifactTag.ReferralDocument],
		schema: templateSchema,
		promptName: `${CustomSuggesters.CARE_PLAN}-goal-detail`,
		backupResult: { response: '' },
		trimToTag: '<response>',
	});

	return interventionResult.response;
}

async function getInterventionDetails({
	patient,
	problem,
}: {
	patient: PatientWithAssessmentContext;
	problem: ProblemItem;
}) {
	const humanPrompt = `Provide intervention details for problem ${problem.problemItemClean} following the template`;
	const getSystemPrompt = getTemplatePrompt(
		`Provide intervention that address the problem "${problem.problemItemClean}".`,
		problem.interventionTemplate,
	);

	const interventionResult = await limitedNotesAndArtifactPrompt({
		humanPrompt,
		getSystemPrompt,
		patient,
		artifactTags: [PatientArtifactTag.ReferralDocument],
		schema: templateSchema,
		promptName: `${CustomSuggesters.CARE_PLAN}-intervention-detail`,
		backupResult: { response: '' },
		trimToTag: '<response>',
	});

	return interventionResult.response;
}

const getTemplatePrompt = (instructions: string, template: string) => (notes: string, artifacts: string) => {
	const artifactsString = artifacts.length
		? `Below is some data from artifacts on a patient:
		<artifacts> ${artifacts} </artifacts>
	`
		: ``;

	return `
	${artifactsString}

	Below are some notes from a patient visit provided by a skilled nurse:

	<notes>
	${notes}
	</notes>

	Please review the information and provide a response based on your understanding.

	You ALWAYS follow these guidelines when writing your response:
	<guidelines>
		- You don't have access to functions. Therefore, don't refer to them.
		<output-format>
			ONLY RESPOND with valid xml following this format:
			<response>
				[${instructions} Follow this template as closely as possible: "${template}". Replace asterisks and sections with brackets (i.e <>}) with relevant details based on the notes.]
			</response>
			${validXML}
			DO NOT PUT ANY OTHER TEXT BEFORE OR AFTER THE RESPONSE TAG
		</output-format>
	</guidelines>
`;
};
