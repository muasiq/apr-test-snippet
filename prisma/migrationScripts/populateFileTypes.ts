import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type MimeTypeMap = Record<string, string>;
const mimeTypeMap: MimeTypeMap = {
	pdf: 'application/pdf',
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	png: 'image/png',
};

async function main() {
	const artifacts = await prisma.patientArtifact.findMany({
		where: {
			fileType: null ?? undefined,
		},
	});

	for (const artifact of artifacts) {
		const extension = artifact.fileName.split('.').pop()?.toLowerCase();
		if (!extension) continue;

		const mimeType = mimeTypeMap[extension] ?? 'application/octet-stream'; // Default to a generic binary file type if unknown

		console.log(`Updating ${artifact.fileName} to ${mimeType}`);

		await prisma.patientArtifact.update({
			where: {
				id: artifact.id,
			},
			data: {
				fileType: mimeType,
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
