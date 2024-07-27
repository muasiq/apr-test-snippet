import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
	const patients = await prisma.patient.findMany({
		where: {
			versionedConfigurationId: null,
		} as unknown as Prisma.PatientWhereInput,
	});

	for (const patient of patients) {
		const configuration = await prisma.versionedConfiguration.findFirst({
			where: { organizationId: patient.organizationId },
			orderBy: { createdAt: 'desc' },
			select: { id: true },
		});
		if (!configuration) {
			console.error(`No configuration found for patient ${patient.id}`);
			continue;
		}
		await prisma.patient.update({
			where: { id: patient.id },
			data: {
				versionedConfigurationId: configuration.id,
			},
		});
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
