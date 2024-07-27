// import { PrismaClient } from '@prisma/client';
// import { isArray } from 'lodash';
// import { Configuration } from '../../src/assessments/configurations';
// import { allQuestions } from '../../src/assessments/home-care-home-base/data-files';
// import { lookupQuestion } from '../../src/assessments/util/lookupQuestionUtil';
// import { CheckedResponseUnion } from '../../src/server/api/routers/assessment/assessment.inputs';

// const prisma = new PrismaClient();

// async function main() {
// 	const configuration = { allQuestions } as Configuration;
// 	const count = await prisma.assessmentAnswer.count({
// 		where: {
// 			Patient: {
// 				deleted: false,
// 			},
// 		},
// 	});
// 	console.log(count);
// 	for (let i = 0; i < count; i += 10) {
// 		const answers = await prisma.assessmentAnswer.findMany({
// 			orderBy: {
// 				id: 'asc',
// 			},
// 			skip: i,
// 			take: 10,
// 			where: {
// 				Patient: {
// 					deleted: false,
// 				},
// 			},
// 		});
// 		for (const answer of answers) {
// 			const { checkedResponse, assessmentNumber, patientId } = answer;
// 			if (checkedResponse === null) continue;
// 			const parsed = checkedResponse as CheckedResponseUnion;
// 			try {
// 				const question = lookupQuestion(assessmentNumber, configuration);
// 				if (isArray(parsed.choice)) {
// 					if (!question.responses?.length) continue;
// 					const validOptions = question.responses.map((r) => r.text.toLowerCase().trim());
// 					const invalidChoices = parsed.choice.filter(
// 						(c) => !validOptions.includes(c?.toLowerCase()?.trim()),
// 					);
// 					const validChoices = parsed.choice.filter((c) => validOptions.includes(c?.toLowerCase()?.trim()));
// 					if (validChoices.length !== parsed.choice.length) {
// 						console.log({ patientId, assessmentNumber, validChoices, invalidChoices });
// 						// add audit log of change
// 						if (validChoices.length) {
// 							// const result = await prisma.assessmentAnswer.update({
// 							// 	where: {
// 							// 		id: answer.id,
// 							// 	},
// 							// 	data: {
// 							// 		checkedResponse: {
// 							// 			choice: validChoices,
// 							// 		},
// 							// 	},
// 							// });
// 							// console.log('updated', JSON.stringify(result));
// 						}
// 					}
// 				}
// 			} catch (e) {
// 				if (e instanceof Error && e.message.includes('Question with id')) {
// 					console.log(`assessmentNumber: ${assessmentNumber} not found for patientId: ${patientId}`);
// 				} else {
// 					console.error(e);
// 				}
// 			}
// 		}
// 	}
// }

// main()
// 	.then(async () => {
// 		await prisma.$disconnect();
// 	})
// 	.catch(async (e) => {
// 		console.error(e);
// 		await prisma.$disconnect();
// 		process.exit(1);
// 	});
