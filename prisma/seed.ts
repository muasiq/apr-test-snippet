import { ConfigurationType, PatientStatus, UserRole } from '@prisma/client';
import {
	createCompletePatient,
	createNewPatient,
	createSignoffNeededPatient,
	createWithQAPatient,
} from '~/common/testUtils/seedPatients';
import { prisma } from '~/server/prisma';
import { addAllConfigurationsToDB } from '../src/assessments/scripts/addConfigurationToDB';
import { createTestUser, newLocation, newOrganization } from './util';

async function truncateDatabase() {
	if (!process.env.DATABASE_URL?.includes('localhost')) {
		throw new Error('Refusing to truncate non-local database');
	}
	const tablenames = await prisma.$queryRaw<
		Array<{ tablename: string }>
	>`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

	const tables = tablenames
		.map(({ tablename }) => tablename)
		.filter((name) => name !== '_prisma_migrations')
		.map((name) => `"public"."${name}"`)
		.join(', ');

	try {
		await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
	} catch (error) {
		console.error('error truncating', error);
	}
}

async function main() {
	await truncateDatabase();
	const org = await newOrganization('Apricot', ['apricothealth.ai']);
	const org2 = await newOrganization('Accentra', ['apricothealth.ai'], ConfigurationType.HomeCareHomeBase);
	await addAllConfigurationsToDB();

	const location1 = await newLocation('Apricot HQ', org.id);
	const location2 = await newLocation('Apricot HQ', org2.id);

	const user = await createTestUser(org.id, [UserRole.Nurse, UserRole.OrgOffice]);
	const nurse = await createTestUser(
		org.id,
		[UserRole.Nurse],
		'test+nurse@apricothealth.ai',
		'Test Nurse',
		location1.id,
	);
	const user2 = await createTestUser(
		org2.id,
		[UserRole.Nurse, UserRole.OrgAdmin, UserRole.QA, UserRole.SuperAdmin],
		'test+accentra@apricothealth.ai',
	);
	await createTestUser(org.id, [UserRole.Nurse], 'test+nurse@apricothealth.ai', 'Test Nurse');
	await createTestUser(org.id, [UserRole.BranchOffice], 'test+branch-office@apricothealth.ai', 'Test Branch Office');
	await createTestUser(org.id, [UserRole.BranchAdmin], 'test+branch-admin@apricothealth.ai', 'Test Branch Admin');
	await createTestUser(org.id, [UserRole.OrgOffice], 'test+org-office@apricothealth.ai', 'Test Org Office');
	await createTestUser(org.id, [UserRole.OrgAdmin], 'test+org-admin@apricothealth.ai', 'Test Org Admin');
	const qaUser = await createTestUser(org.id, [UserRole.QA], 'test+qa@apricothealth.ai', 'Test QA');
	await createTestUser(org.id, [UserRole.QaManager], 'test+qa-manager@apricothealth.ai', 'Test QA Manager');
	const dataEntryUser = await createTestUser(
		org.id,
		[UserRole.DataEntry],
		'test+dataentry@apricothealth.ai',
		'Test Data Entry',
	);
	await createTestUser(
		org.id,
		[UserRole.DataEntryManager],
		'test+dataentry-manager@apricothealth.ai',
		'Test Data Entry Manager',
	);
	await createTestUser(org.id, [UserRole.PromptIterator], 'test+prompt@apricothealth.ai', 'Test Prompt Iterator');
	await createTestUser(
		org.id,
		[UserRole.SuperAdmin, UserRole.Nurse],
		'test+super@apricothealth.ai',
		'Test Super Admin',
		location1.id,
	);

	const newPatient = await createNewPatient({
		userId: user.id,
		organization: org,
		locationId: location1.id,
		status: PatientStatus.NewPatient,
	});
	const newPatient2 = await createNewPatient({
		userId: user2.id,
		organization: org2,
		locationId: location2.id,
		status: PatientStatus.NewPatient,
	});
	const withQAPatient = await createWithQAPatient(user.id, org, location1.id, qaUser.id);
	const withQaPatient2 = await createWithQAPatient(user2.id, org2, location2.id);
	const signoffNeededPatient = await createSignoffNeededPatient(nurse.id, org, location1.id);
	await createSignoffNeededPatient(nurse.id, org2, location2.id);
	const completePatient = await createCompletePatient({
		userId: user.id,
		organization: org,
		locationId: location1.id,
		dataEntryAssignedUserId: dataEntryUser.id,
	});
	await createCompletePatient({
		userId: user2.id,
		organization: org2,
		locationId: location2.id,
		dataEntryAssignedUserId: dataEntryUser.id,
	});
	const newPatientsCreated = [
		newPatient,
		newPatient2,
		withQAPatient,
		withQaPatient2,
		signoffNeededPatient,
		completePatient,
	];
	const withNeededAttributes = newPatientsCreated.map((p) => {
		return {
			id: p.id,
			firstName: p.firstName,
			lastName: p.lastName,
			status: p.status,
			configurationType: p.configurationType,
		};
	});
	console.log('seeded-patients');
	console.log(JSON.stringify(withNeededAttributes));
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
