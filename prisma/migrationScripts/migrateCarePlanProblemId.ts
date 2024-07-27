import { PrismaClient } from '@prisma/client';
import { keyBy } from 'lodash';
import { getLocalConfiguration } from '../../src/assessments/configurations';

const prisma = new PrismaClient();

type AssessmentPlanBuilder = {
	choice: {
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
};

async function main() {
	const orgs = await prisma.organization.findMany();

	for (const org of orgs) {
		if (org.configurationType === 'WellSky') {
			continue;
		}
		const configuration = getLocalConfiguration(org.name);
		const pathways = configuration.pathways;
		const problems = pathways.flatMap((path) => path.problemItems);

		const byProblemItem = keyBy(problems, 'problemItem');
		const byProblemItemClean = keyBy(problems, 'problemItemClean');

		// transform all problem values to be problemItem
		function getProblemItemName(name: string) {
			return byProblemItem[name]?.problemItem ?? byProblemItemClean[name]?.problemItem ?? name;
		}

		const answers = await prisma.assessmentAnswer.findMany({
			where: {
				assessmentNumber: 'plan_builder_custom',
				Patient: { organizationId: org.id },
			},
		});

		for (const answer of answers) {
			const response = answer.checkedResponse as AssessmentPlanBuilder;
			if (response?.choice?.problems) {
				const { choice } = response;

				console.log(`migrating ${answer.id}`);
				const problems = choice.problems?.map(getProblemItemName);
				const problemItems = choice.problemItems?.map((item) => ({
					...item,
					problem: getProblemItemName(item.problem),
				}));

				const updated = {
					...choice,
					problems,
					problemItems,
				};

				await prisma.assessmentAnswer.update({
					where: { id: answer.id },
					data: { checkedResponse: { choice: updated } },
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
