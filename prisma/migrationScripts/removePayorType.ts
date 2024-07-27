// import { PayorSourceType, PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// async function main() {
// 	await prisma.payorSource.deleteMany({ where: { payorSourceType: { notIn: Object.values(PayorSourceType) } } });
// }

// main()
// 	.then(async () => {
// 		await prisma.$disconnect();
// 	})
// 	.catch(async (e) => {
// 		console.error(e);
// 		await prisma.$disconnect();
// 		process.exit(1);
// 	});
