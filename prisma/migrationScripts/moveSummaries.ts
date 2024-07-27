import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
	const questionItems = await prisma.nurseInterviewQuestionItem.findMany({
		where: {
			LLMSummarizedText: {
				isEmpty: true,
			},
		},
		include: {
			NurseInterviewThemeSummaries: {
				include: {
					NurseInterview: true,
				},
			},
		},
	});

	for (const questionItem of questionItems) {
		// console.log(questionItem);
		const patient = await prisma.patient.findUniqueOrThrow({
			where: {
				id: questionItem.NurseInterviewThemeSummaries.NurseInterview.patientId,
			},
			include: {
				InterviewQuestion: true,
			},
		});
		const foundTranscript = patient.InterviewQuestion.find(
			(question) => question.question === questionItem.question,
		);
		if (foundTranscript?.transcribedText) {
			console.log('updating', questionItem.id, foundTranscript?.transcribedText);
			await prisma.nurseInterviewQuestionItem.update({
				where: {
					id: questionItem.id,
				},
				data: {
					LLMSummarizedText: [foundTranscript?.transcribedText],
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
