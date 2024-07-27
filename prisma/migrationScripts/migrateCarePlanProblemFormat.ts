import { PrismaClient } from '@prisma/client';
import { keyBy } from 'lodash';
import { AssessmentPlanBuilder } from '~/server/api/routers/assessment/assessment.inputs';
import { getLocalConfiguration } from '../../src/assessments/configurations';

const prisma = new PrismaClient();

type PreviousType = {
	categories?: string[];
	problems: string[];
	problemItems: {
		problem: string;
		goals: string[];
		goalDetails: {
			goal: string;
			details: string;
			interventionDetails: { details: string; name: string }[];
		}[];
	}[];
};

async function main() {
	const orgs = await prisma.organization.findMany();

	for (const org of orgs) {
		const configuration = getLocalConfiguration(org.name);

		const allProblems = configuration?.pathways.flatMap((path) =>
			path.problemItems.map((item) => ({ name: item.problemItem, category: path.problemCategory })),
		);
		const lookup = keyBy(allProblems, 'name');

		function migrateOldAnswer(value: PreviousType) {
			const categories: Record<string, { name: string; goalDetails: string; interventionDetails: string }[]> = {};
			value.problemItems?.forEach((item) => {
				const resolved = lookup[item.problem];

				if (resolved) {
					if (!categories[resolved.category]) {
						categories[resolved.category] = [];
					}

					const goalDetails = item.goalDetails[0];
					categories[resolved.category]?.push({
						name: resolved.name,
						goalDetails: goalDetails?.details ?? '',
						interventionDetails: goalDetails?.interventionDetails?.[0]?.details ?? '',
					});
				}
			});

			return {
				choice: {
					areas: Object.keys(categories).map((category) => ({
						category,
						problems: categories[category] ?? [],
					})),
				},
			};
		}

		const answers = await prisma.assessmentAnswer.findMany({
			where: {
				assessmentNumber: 'plan_builder_custom',
				Patient: { organizationId: org.id },
			},
		});

		for (const answer of answers) {
			const updated: { checkedResponse?: AssessmentPlanBuilder; generatedResponse?: AssessmentPlanBuilder } = {};

			const checkedResponse = answer.checkedResponse as AssessmentPlanBuilder | { choice: PreviousType };
			if (checkedResponse?.choice && !(checkedResponse as AssessmentPlanBuilder)?.choice?.areas) {
				updated.checkedResponse = migrateOldAnswer(checkedResponse.choice as PreviousType);
			}

			const generatedResponse = answer.generatedResponse as AssessmentPlanBuilder | { choice: PreviousType };
			if (generatedResponse?.choice && !(generatedResponse as AssessmentPlanBuilder)?.choice?.areas) {
				updated.generatedResponse = migrateOldAnswer(generatedResponse.choice as PreviousType);
			}

			if (Object.keys(updated).length) {
				console.log(`migrating ${answer.id}`);

				await prisma.assessmentAnswer.update({
					where: { id: answer.id },
					data: updated,
				});
			}
		}
	}
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
