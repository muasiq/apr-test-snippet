import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const patientIdToCopy = 202;

async function main() {
	const { InterviewQuestion, NurseInterview } = await prisma.patient.findUniqueOrThrow({
		where: {
			id: patientIdToCopy,
		},
		include: {
			InterviewQuestion: true,
			NurseInterview: {
				include: {
					NurseInterviewThemeSummaries: {
						include: {
							QuestionItems: true,
						},
					},
				},
			},
		},
	});

	console.log(JSON.stringify({ InterviewQuestion, NurseInterview }, null, 2));
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
