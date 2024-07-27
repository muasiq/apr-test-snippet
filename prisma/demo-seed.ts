import { faker } from '@faker-js/faker';
import { AudioTranscriptionStatus, ConfigurationType, PatientStatus, PrismaClient, UserRole } from '@prisma/client';
import patient from './patient.json';
import { createTestUser, newLocation, newOrganization } from './util';

const prisma = new PrismaClient();

async function cleanUpApricotOrg(name: string, configurationType: ConfigurationType) {
	const apricotOrg = await newOrganization(name, ['apricothealth.ai'], configurationType);
	await newLocation('Apricot HQ', apricotOrg.id);
	const email =
		configurationType === ConfigurationType.HomeCareHomeBase
			? 'demo+hchb@apricothealth.ai'
			: 'demo+wellsky@apricothealth.ai';
	const user = await createTestUser(
		apricotOrg.id,
		[UserRole.Nurse, UserRole.OrgAdmin, UserRole.OrgQA],
		email,
		'Demo Account',
	);
	return { apricotOrg, user };
}

async function createDemoNewPatient(organizationId: number, userId: string) {
	const organization = await prisma.organization.findUniqueOrThrow({ where: { id: organizationId } });
	const latestConfig = await prisma.versionedConfiguration.findFirstOrThrow({
		where: { organizationId: organization.id },
		orderBy: { createdAt: 'desc' },
	});
	const EMRIdentifier = faker.string.numeric(6);
	await prisma.patient.upsert({
		where: {
			organizationId_EMRIdentifier: {
				organizationId,
				EMRIdentifier,
			},
		},
		create: {
			organizationId,
			EMRIdentifier,
			firstName: 'Demo',
			lastName: 'New Patient',
			dateOfBirth: new Date('1970-01-01'),
			socialSecurityNumber: '123-45-6789',
			SOCVisitDate: new Date(),
			status: PatientStatus.NewPatient,
			SOCVisitCaseManagerId: userId,
			configurationType: organization.configurationType,
			versionedConfigurationId: latestConfig.id,
		},
		update: {
			SOCVisitDate: new Date(),
		},
	});
}

async function createDemoIncompletePatient(organizationId: number, userId: string) {
	const organization = await prisma.organization.findUniqueOrThrow({ where: { id: organizationId } });
	const latestConfig = await prisma.versionedConfiguration.findFirstOrThrow({
		where: { organizationId: organization.id },
		orderBy: { createdAt: 'desc' },
	});
	const nurseInterview = patient.NurseInterview;
	const interviewQuestions = patient.InterviewQuestion;
	const {
		NurseInterviewThemeSummaries,
		id: interviewId,
		patientId,
		userId: _nurseId,
		...restOfInterview
	} = nurseInterview;
	const EMRIdentifier = faker.string.numeric(6);
	await prisma.patient.upsert({
		where: {
			organizationId_EMRIdentifier: {
				organizationId,
				EMRIdentifier,
			},
		},
		create: {
			organizationId,
			firstName: 'Demo',
			EMRIdentifier,
			lastName: 'Incomplete Patient',
			dateOfBirth: new Date('1970-01-01'),
			socialSecurityNumber: '123-45-6789',
			SOCVisitDate: new Date(),
			status: PatientStatus.NewPatient,
			SOCVisitCaseManagerId: userId,
			configurationType: organization.configurationType,
			versionedConfigurationId: latestConfig.id,
			InterviewQuestion: {
				createMany: {
					data: interviewQuestions.map(
						({ id, patientId, userId: _, audioTranscriptionStatus, ...question }) => ({
							...question,
							userId,
							audioTranscriptionStatus: audioTranscriptionStatus as AudioTranscriptionStatus,
						}),
					),
				},
			},
			NurseInterview: {
				create: {
					...restOfInterview,
					userId,
					NurseInterviewThemeSummaries: {
						create: NurseInterviewThemeSummaries.map(({ id, nurseInterviewId, ...summary }) => {
							return {
								...summary,
								QuestionItems: {
									createMany: {
										data: summary.QuestionItems.map(
											({ id, NurseInterviewThemeSummaryId, ...item }) => ({
												...item,
											}),
										),
									},
								},
							};
						}),
					},
				},
			},
		},
		update: {
			SOCVisitDate: new Date(),
		},
	});
}

async function createDemoWithQAPatient(organizationId: number, userId: string) {
	const organization = await prisma.organization.findUniqueOrThrow({ where: { id: organizationId } });
	const latestConfig = await prisma.versionedConfiguration.findFirstOrThrow({
		where: { organizationId: organization.id },
		orderBy: { createdAt: 'desc' },
	});
	const nurseInterview = patient.NurseInterview;
	const interviewQuestions = patient.InterviewQuestion;
	const {
		NurseInterviewThemeSummaries,
		id: interviewId,
		patientId,
		userId: _nurseId,
		...restOfInterview
	} = nurseInterview;
	const EMRIdentifier = faker.string.numeric(6);

	await prisma.patient.upsert({
		where: {
			organizationId_EMRIdentifier: {
				organizationId,
				EMRIdentifier,
			},
		},
		create: {
			organizationId,
			EMRIdentifier,
			firstName: 'Demo',
			lastName: 'WithQA Patient',
			dateOfBirth: new Date('1970-01-01'),
			socialSecurityNumber: '123-45-6789',
			SOCVisitDate: new Date(),
			status: PatientStatus.WithQA,
			SOCVisitCaseManagerId: userId,
			configurationType: organization.configurationType,
			versionedConfigurationId: latestConfig.id,
			InterviewQuestion: {
				createMany: {
					data: interviewQuestions.map(
						({ id, patientId, userId: _, audioTranscriptionStatus, ...question }) => ({
							...question,
							userId,
							audioTranscriptionStatus: audioTranscriptionStatus as AudioTranscriptionStatus,
						}),
					),
				},
			},
			NurseInterview: {
				create: {
					...restOfInterview,
					userId,
					NurseInterviewThemeSummaries: {
						create: NurseInterviewThemeSummaries.map(({ id, nurseInterviewId, ...summary }) => {
							return {
								...summary,
								QuestionItems: {
									createMany: {
										data: summary.QuestionItems.map(
											({ id, NurseInterviewThemeSummaryId, ...item }) => ({
												...item,
											}),
										),
									},
								},
							};
						}),
					},
				},
			},
		},
		update: {
			SOCVisitDate: new Date(),
		},
	});
}

async function setupDemoAccount(name: string, configurationType: ConfigurationType) {
	const { apricotOrg, user } = await cleanUpApricotOrg(name, configurationType);
	await createDemoNewPatient(apricotOrg.id, user.id);
	await createDemoIncompletePatient(apricotOrg.id, user.id);
	await createDemoWithQAPatient(apricotOrg.id, user.id);
}

export async function setupDemoAccounts() {
	await setupDemoAccount('Apricot HCHB', ConfigurationType.HomeCareHomeBase);
	await setupDemoAccount('Apricot WellSky', ConfigurationType.WellSky);
}

setupDemoAccounts().catch((e) => {
	console.error(e);
});
