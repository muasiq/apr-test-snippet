import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
	const results = await prisma.assessmentAnswer.groupBy({
		by: ['patientId', 'assessmentNumber'],
		having: {
			assessmentNumber: {
				_count: {
					gt: 1,
				},
			},
		},
		_count: {
			assessmentNumber: true,
		},
	});
	console.log(results);
	for (const result of results) {
		const { patientId, assessmentNumber } = result;
		const assessmentAnswers = await prisma.assessmentAnswer.findMany({
			where: {
				patientId,
				assessmentNumber,
			},
		});
		const [first, ...rest] = assessmentAnswers;
		for (const answer of rest) {
			console.log('Deleting duplicate answer', answer.assessmentNumber);
			await prisma.assessmentAnswer.delete({
				where: {
					id: answer.id,
				},
			});
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
