import { PrismaClient } from '@prisma/client';
import { getLocalConfiguration } from '~/assessments/configurations';
import { AssessmentQuestionType } from '~/assessments/types';
import { generateAnswerForQuestion } from '~/common/testUtils/generateFakeAnswers';

const prisma = new PrismaClient();

const patientIdToCopy = 193;

async function main() {
	const patient = await prisma.patient.findUniqueOrThrow({
		where: {
			id: patientIdToCopy,
		},
		include: {
			Organization: true,
		},
	});

	const configuration = getLocalConfiguration(patient.Organization.name);
	for (const question of configuration.allQuestions) {
		if (question.mappedType === AssessmentQuestionType.Panel) continue;

		const existingAnswer = await prisma.assessmentAnswer.findFirst({
			where: {
				assessmentNumber: question.id,
				patientId: patientIdToCopy,
			},
		});

		if (existingAnswer) {
			continue;
		}

		console.log('trying ', question.id);
		try {
			const [answer] = generateAnswerForQuestion(question.id, configuration, patientIdToCopy) ?? [];
			await prisma.assessmentAnswer.upsert({
				where: {
					patientId_assessmentNumber: {
						patientId: patientIdToCopy,
						assessmentNumber: question.id,
					},
				},
				create: {
					patientId: patientIdToCopy,
					assessmentNumber: question.id,
					status: 'Completed',
					checkedResponse: answer?.checkedResponse,
				},
				update: {
					patientId: patientIdToCopy,
					assessmentNumber: question.id,
					status: 'Completed',
					checkedResponse: answer?.checkedResponse,
				},
			});
		} catch (e) {
			console.error('error', e);
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
