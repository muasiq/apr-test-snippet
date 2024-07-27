import { PrismaClient } from '@prisma/client';
import { isEqual, keyBy } from 'lodash';
import { Pathway } from '~/assessments/home-care-home-base/data-files/scripts/clinicalPathways';
import { AssessmentPlanBuilder } from '~/server/api/routers/assessment/assessment.inputs';

const prisma = new PrismaClient();

async function main() {
	const answers = await prisma.assessmentAnswer.findMany({
		where: { assessmentNumber: 'plan_builder_custom' },
		include: {
			Patient: {
				include: {
					VersionedConfiguration: true,
				},
			},
		},
	});

	for (const answer of answers) {
		const configuration = answer.Patient.VersionedConfiguration;
		if (!configuration) continue;

		const pathways = configuration.pathways as unknown as Pathway[];
		const allProblems = pathways.flatMap((path) =>
			path.problemItems.map((item) => ({ name: item.problemItem, category: path.problemCategory })),
		);
		const lookup = keyBy(allProblems, 'name');

		function migrateCategories(value: AssessmentPlanBuilder['choice']) {
			const categories: Record<string, { name: string; goalDetails: string; interventionDetails: string }[]> = {};
			const problems = value.areas.flatMap((area) => area.problems);

			problems.forEach((problem) => {
				const resolved = lookup[problem.name];
				if (resolved) {
					if (!categories[resolved.category]) {
						categories[resolved.category] = [];
					}

					categories[resolved.category]?.push(problem);
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

		const updated: { checkedResponse?: AssessmentPlanBuilder; generatedResponse?: AssessmentPlanBuilder } = {};

		const checkedResponse = answer.checkedResponse as AssessmentPlanBuilder;
		if (checkedResponse?.choice?.areas) {
			updated.checkedResponse = migrateCategories(checkedResponse.choice);
		}

		const generatedResponse = answer.generatedResponse as AssessmentPlanBuilder;
		if (generatedResponse?.choice?.areas) {
			updated.generatedResponse = migrateCategories(generatedResponse.choice);
		}

		if (Object.keys(updated).length) {
			const same =
				(!updated.checkedResponse || isEqual(updated.checkedResponse, answer.checkedResponse)) &&
				(!updated.generatedResponse || isEqual(updated.generatedResponse, answer.generatedResponse));

			if (!same) {
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
