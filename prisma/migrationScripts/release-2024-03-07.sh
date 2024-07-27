npx ts-node prisma/migrationScripts/removePayerTypes
npx prisma migrate resolve --applied 0_init
npx prisma migrate deploy
npx ts-node prisma/migrationScripts/roleToRoles
npx ts-node prisma/migrationScripts/deleteUnverifiedAnswers
