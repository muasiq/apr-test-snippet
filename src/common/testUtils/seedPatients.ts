import { faker } from '@faker-js/faker';
import {
	AudioTranscriptionStatus,
	ConfigurationType,
	Organization,
	PatientArtifactTag,
	PatientStatus,
	Prisma,
} from '@prisma/client';
import { default as patient, default as patientData } from '~/../prisma/patient.json';
import { CustomAssessmentNumber } from '~/assessments/apricot/custom';
import { unicornButton } from '~/common/testUtils/generateFakeAnswers';
import { generateFakePatient } from '~/common/testUtils/generateFakePatient';
import { PatientWithJoins } from '~/server/api/routers/patient/patient.types';
import { prisma } from '~/server/prisma';

export async function createNewPatient({
	userId,
	organization,
	locationId,
	status,
}: {
	userId: string;
	organization: Organization;
	locationId: number;
	status?: PatientStatus;
}) {
	const {
		PayorSources,
		PatientEmergencyContacts,
		PatientAssociatedPhysicians,
		PatientReferralSource,
		checkedResponse,
		...rest
	} = generateFakePatient(locationId);

	const configuration = await prisma.versionedConfiguration.findFirstOrThrow({
		where: { organizationId: organization.id },
		orderBy: { createdAt: 'desc' },
		take: 1,
	});

	const patientCreateArgs = {
		data: {
			...rest,
			SOCVisitCaseManagerId: userId,
			organizationId: organization.id,
			versionedConfigurationId: configuration.id,
			configurationType: organization.configurationType,
			...(status ? { status } : {}),
			PayorSources: {
				create: PayorSources ?? [],
			},
			PatientEmergencyContacts: {
				create: PatientEmergencyContacts ?? [],
			},
			PatientAssociatedPhysicians: {
				create: PatientAssociatedPhysicians ?? [],
			},
			AssessmentAnswer: {
				create: checkedResponse
					? {
							assessmentNumber: CustomAssessmentNumber.DIAGNOSES,
							checkedResponse,
						}
					: undefined,
			},
		},
	} satisfies Prisma.PatientCreateArgs;

	const patient = await prisma.patient.create(patientCreateArgs);

	if (PatientReferralSource) {
		await prisma.patient.update({
			where: { id: patient.id },
			data: {
				PatientReferralSource: {
					create: PatientReferralSource,
				},
			},
		});
	}
	return patient;
}

export async function createWithQAPatient(
	userId: string,
	organization: Organization,
	locationId: number,
	assignedQaUser?: string,
) {
	const attachmentType = await prisma.attachmentType.upsert({
		where: {
			organizationId_type_description: {
				organizationId: organization.id,
				type: 'Medication',
				description: 'Medication List',
			},
		},
		create: {
			organizationId: organization.id,
			description: 'Medication List',
			type: 'Medication',
			location: 'Medication Artifact',
			requiredForSOC: true,
		},
		update: {},
	});
	const attachmentTypeWounds = await prisma.attachmentType.upsert({
		where: {
			organizationId_type_description: {
				organizationId: organization.id,
				type: 'Wounds',
				description: 'Wounds',
			},
		},
		create: {
			organizationId: organization.id,
			description: faker.lorem.words(5),
			type: 'Wounds',
			location: 'Wounds',
			requiredForSOC: true,
		},
		update: {},
	});

	const newPatient = await createNewPatient({
		userId,
		organization,
		locationId,
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

	const updatedPatient = await prisma.patient.update({
		where: { id: newPatient.id },
		data: {
			qaAssignedUserId: assignedQaUser,
			PatientArtifacts: {
				create: [
					{
						cloudStorageLocation: 'medication.jpg',
						uploadFinalized: true,
						fileName: 'test',
						fileType: 'image/jpeg',

						tagName: PatientArtifactTag.Medication,
						attachmentTypeId: attachmentType.id,
						patientDocumentArtifact: {
							create: {
								documentRawText:
									'KEY: N = New (Last 30 Days) C = Changed (Last 60 Days) Phone: Phone: - unans Qt4444- LS = Long Standing Drug Therapy Foresmidle DATE N,C,LS DRUG Sutralfate 14cm Hetz đng Taodaily - 35 Losartan 100mg Tabdally Protonix Hamy Taß devily by huh Jumy Tab, 2x dey by by month DOSE, FREQUENCY, ROUTE DIC DATE INITIALS 42525 Rt. un medles machew Tab dail Carvedilol Poutaxetine Ezetimibe Ifishoil gulapentin blucason hydralazine by Month THB, 2x daily by mouth 3.125 my daily by mouth upden 20mg Cap daily by mouth 10m T&B day we by mouth. Some Tuß denly by mouth as needed Gerd 1000mg Cap, 2xdary by mouth 300min cup, 2xdenle by moth 100mg Img/owm/ SubQ It hypoglycemic <70 100mg TUB, 2x daily - HTN by mott Insulin Aspart 70/30 100units/151 30units with Breakgard Insulin, rispart 70/30 /counits/ml 25units subo Lunch Isosorbide mono. CK 30 my Tab by mouth devil Oxycodone /ACA/ 75 mg/325 my W3 4kdaily PBD pain Potassum Chlonde Lome mustation colace Synthroid y by 2x daily by mouth Yomg the deri 4 by th 100my Cup, 2x Clarly by mouth Constip. 150mcg Tab daing by month 1 of 2 Doxycycline 100mg Tab 2x daily 7 day Cefdinir 300cap 2x daily by month Sodium Bicarbonate usums 2x day',
								paragraphs: {
									create: [
										{
											startIndex: 0,
											endIndex: 24,
											page: 1,
											positionOnPage: 1,
										},
									],
								},
							},
						},
					},
					{
						cloudStorageLocation: 'wound.jpg',
						uploadFinalized: true,
						fileName: 'test',
						fileType: 'image/jpeg',
						attachmentTypeId: attachmentTypeWounds.id,
						tagName: PatientArtifactTag.Wounds,
					},
					{
						cloudStorageLocation: 'Referral.pdf',
						uploadFinalized: true,
						fileName: 'test',
						fileType: 'application/pdf',
						tagName: PatientArtifactTag.ReferralDocument,
						patientDocumentArtifact: {
							create: {
								documentRawText: 'This is a test document',
								paragraphs: {
									create: [
										{
											startIndex: 0,
											endIndex: 24,
											page: 1,
											positionOnPage: 1,
										},
									],
								},
							},
						},
					},
				],
			},
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
			status: PatientStatus.WithQA,
		},
		include: {
			NurseInterview: true,
			InterviewQuestion: true,
			PatientArtifacts: true,
		},
	});

	return updatedPatient;
}

export async function createSignoffNeededPatient(userId: string, organization: Organization, locationId: number) {
	const patient = await createWithQAPatient(userId, organization, locationId);
	const newPatient = await prisma.patient.update({
		where: {
			id: patient.id,
		},
		data: {
			status: PatientStatus.SignoffNeeded,
		},
	});
	await unicornButton(userId, newPatient.id);
	return newPatient;
}

export async function createCompletePatient({
	userId,
	organization,
	locationId,
	dataEntryAssignedUserId,
}: {
	userId: string;
	organization: Organization;
	locationId: number;
	dataEntryAssignedUserId?: string;
}) {
	const patient = await createWithQAPatient(userId, organization, locationId);
	await prisma.patient.update({
		where: {
			id: patient.id,
			organizationId: organization.id,
			locationId,
		},
		data: {
			dataEntryAssignedUserId,
			nurseSignOffDate: faker.date.recent({ days: 2, refDate: new Date() }),
			nurseSignOffName: userId,
			status: PatientStatus.ReadyForEMR,
		},
	});
	return patient;
}

export const samplePatientWithJoins = {
	id: 1,
	...generateFakePatient(1),
	configurationType: ConfigurationType.HomeCareHomeBase,
	Organization: {
		id: 1,
		name: 'Test Org',
		configurationType: ConfigurationType.HomeCareHomeBase,
		emailDomains: [],
	},
	PatientReferralSource: {
		contactName: 'Test Contact',
		contactPhone: '1234567890',
		createdAt: new Date(),
		facilityName: 'Test Facility',
		id: 1,
		facilityType: 'Clinic',
		referralDate: new Date(),
		updatedAt: new Date(),
		socDate: new Date(),
	},
	Location: {
		id: 1,
		organizationId: 1,
		state: 'TX',
		name: 'Test Location',
		cmsBranchId: '123456',
		createdAt: new Date(),
		updatedAt: new Date(),
		deleted: false,
	},
	NurseInterview: patientData.NurseInterview,
	InterviewQuestion: patientData.InterviewQuestion,
	PatientEmergencyContacts: [],
	NurseConfirmedAssessmentSections: [],
	PatientArtifacts: [],
	PatientAssociatedPhysicians: [],
	SOCVisitCaseManager: null,
} as unknown as PatientWithJoins;

export async function getPatientWithInterview(patientId: number) {
	return await prisma.patient.findUniqueOrThrow({
		where: { id: patientId },
		include: {
			NurseInterview: true,
			InterviewQuestion: true,
			NurseConfirmedAssessmentSections: true,
			AssessmentAnswer: true,
		},
	});
}

async function getNurseInterview(patientId: number) {
	const datas = await prisma.nurseInterview.findUniqueOrThrow({
		where: { patientId },
		include: {
			NurseInterviewThemeSummaries: {
				include: {
					QuestionItems: true,
				},
			},
		},
	});

	const {
		selectedThemesToReportOn,
		distanceTraveled,
		minutesSpentDriving,
		minutesSpentWithPatient,
		hasCompletedDocumentsUpload,
		hasCompletedMedicationPhotoUpload,
		hasCompletedOtherPhotoUpload,
		hasCompletedWoundPhotoUpload,
		hasConfirmedThemesWithinNormalLimits,
		totalWounds,
	} = datas;

	return {
		NurseInterviewThemeSummaries: datas.NurseInterviewThemeSummaries,
		selectedThemesToReportOn,
		distanceTraveled,
		minutesSpentDriving,
		minutesSpentWithPatient,
		hasCompletedDocumentsUpload,
		hasCompletedMedicationPhotoUpload,
		hasCompletedOtherPhotoUpload,
		hasCompletedWoundPhotoUpload,
		hasConfirmedThemesWithinNormalLimits,
		totalWounds,
	};
}

export async function extractClonePatientInterviewData({ patientId }: { patientId: number }) {
	const patient = await getPatientWithInterview(patientId);
	if (!patient) {
		console.error('Patient to clone not found');
		return;
	}
	const nurseInterview = await getNurseInterview(patientId);

	const { InterviewQuestion, status, AssessmentAnswer, versionedConfigurationId } = patient;
	const { NurseInterviewThemeSummaries, ...restofInterview } = nurseInterview;

	const clonePatient = {
		InterviewQuestion: InterviewQuestion.map(
			({ id, patientId, userId, audioTranscriptionStatus, ...question }) => ({
				audioTranscriptionStatus,
				question,
			}),
		),
		NurseInterview: {
			...restofInterview,
			NurseInterviewThemeSummaries: NurseInterviewThemeSummaries.map(({ id, nurseInterviewId, ...summary }) => {
				const { QuestionItems, ...restOfSummary } = summary;
				return {
					...restOfSummary,
					QuestionItems: QuestionItems.map(
						({ id, NurseInterviewThemeSummaryId, ...restOfItem }) => restOfItem,
					),
				};
			}),
		},
		AssessmentAnswer: AssessmentAnswer.map(
			({
				assessmentNumber,
				status,
				generatedResponse,
				generatedResponseAccepted,
				checkedResponse,
				integrationMessage,
				integrationStatus,
			}) => {
				return {
					assessmentNumber,
					status,
					generatedResponse,
					generatedResponseAccepted,
					checkedResponse,
					integrationMessage,
					integrationStatus,
				};
			},
		),
		status,
		versionedConfigurationId,
	};

	return clonePatient;
}
