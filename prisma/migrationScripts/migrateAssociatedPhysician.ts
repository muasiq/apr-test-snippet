import { PrismaClient, ProviderType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
	const physicians = await prisma.patientAssociatedPhysician.findMany({ where: { name: null } });
	for (const physician of physicians) {
		console.log('updating', physician.id);
		const referringPhysician = physician.type.includes(ProviderType.ReferringPhysician) ? 'YES' : 'NO';
		const otherTypes = physician.type.filter((type) => type !== ProviderType.ReferringPhysician);
		const providerType = otherTypes.length > 0 ? otherTypes[0] : null;
		await prisma.patientAssociatedPhysician.update({
			where: {
				id: physician.id,
			},
			data: {
				name: `${physician.firstName} ${physician.lastName}`,
				referringPhysician,
				providerType,
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
