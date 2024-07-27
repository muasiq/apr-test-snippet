# psql -h 127.0.0.1 -U postgres  -d apricot -p 5432 -f prisma/migrationScripts/alter-org-profile-columns.sql
# npx prisma db push 
# npx ts-node prisma/migrationScripts/addDefaultConfigDropdowns.ts
# npx ts-node prisma/migrationScripts/addReferralSourcesForOrgs.ts
# npx ts-node prisma/migrationScripts/migrateAssociatedPhysician.ts
# npx ts-node prisma/migrationScripts/migrateCarePlanProblemFormat.ts
