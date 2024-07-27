import { PrismaClient } from '@prisma/client';
import { defaultConfig } from '../../prisma/defaultOrgProfileSettings';

const prisma = new PrismaClient();

async function main() {
	await prisma.organization.updateMany({
		data: {
			additionalDropdownConfiguration: defaultConfig,
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
