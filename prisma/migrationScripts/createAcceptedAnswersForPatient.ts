import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const patientIdToCopy = 193;

async function main() {
	const results = await prisma.assessmentAnswer.findMany({
		where: {
			patientId: patientIdToCopy,
			checkedResponse: {
				equals: Prisma.AnyNull,
			},
		},
	});
	for (const result of results) {
		if (result.generatedResponse) {
			console.log('updating', result.assessmentNumber);
			await prisma.assessmentAnswer.update({
				where: {
					id: result.id,
				},
				data: {
					checkedResponse: result.generatedResponse,
				},
			});
		} else {
			console.log('need to manually fix', result.assessmentNumber);
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
