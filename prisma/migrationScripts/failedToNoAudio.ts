import { AudioTranscriptionStatus, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
	await prisma.interviewQuestion.updateMany({
		where: {
			audioTranscriptionStatus: AudioTranscriptionStatus.Failed,
		},
		data: {
			audioTranscriptionStatus: AudioTranscriptionStatus.NoResults,
		},
	});
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
