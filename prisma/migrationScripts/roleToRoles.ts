// import { PrismaClient, UserRole } from '@prisma/client';

// const prisma = new PrismaClient();

// async function main() {
// 	const users = await prisma.user.findMany({});
// 	for (const user of users) {
// 		const newRoles = newRoleLookup(user.role);
// 		await prisma.user.update({
// 			data: {
// 				roles: newRoles,
// 			},
// 			where: {
// 				id: user.id,
// 			},
// 		});
// 	}
// }

// function newRoleLookup(role: UserRole) {
// 	switch (role) {
// 		case UserRole.Admin:
// 			return [UserRole.OrgAdmin];
// 		case UserRole.BackOffice:
// 			return [UserRole.OrgOffice];
// 		default:
// 			return [role];
// 	}
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
