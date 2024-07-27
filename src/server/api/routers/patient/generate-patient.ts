import { faker } from '@faker-js/faker';
import {
	Gender,
	Organization,
	PatientArtifactTag,
	PatientStatus,
	Prisma,
	ProviderType,
	ReferringPhysician,
	State,
} from '@prisma/client';
import { CustomAssessmentNumber } from '~/assessments/apricot/custom';
import { unicornButton } from '~/common/testUtils/generateFakeAnswers';
import { extractClonePatientInterviewData } from '~/common/testUtils/seedPatients';
import type {
	CreateDiagnosesInput,
	CreatePatientInput,
	GenerateTestPatientDataInput,
} from '~/server/api/routers/patient/patient.inputs';
import { prisma } from '~/server/prisma';
import { defaultConfig } from '../../../../../prisma/defaultOrgProfileSettings';

function addSocialSecurityOrUnknown() {
	const socialSecurityUnknown = faker.datatype.boolean();
	if (socialSecurityUnknown) {
		return { socialSecurityUnknown };
	}
	return { socialSecurityNumber: faker.string.numeric(9), socialSecurityUnknown: false };
}

async function addSOCVisitDetails({ caseManagerId, orgId }: GenerateTestPatientDataInput) {
	const org = await prisma.organization.findUnique({ where: { id: orgId } });

	const serviceLocations =
		org?.additionalDropdownConfiguration?.[
			'serviceLocations' as keyof typeof org.additionalDropdownConfiguration
		] ?? [];

	const socVisitDate = faker.date.recent({ days: 7, refDate: new Date() });
	const datePhysicianOrderedStartDate = faker.date.recent({ days: 7, refDate: socVisitDate });

	const physicianOrderedSOCDateNA = faker.datatype.boolean({ probability: 0.3 });

	const serviceLocationDetails = {
		serviceLocationType: faker.helpers.arrayElement(serviceLocations) as string,
		address1: faker.location.streetAddress({ useFullAddress: false }),
		city: faker.location.city(),
		state: faker.helpers.arrayElement(Object.values(State)),
		zip: faker.location.zipCode(),
		SOCVisitCaseManagerId: caseManagerId,
		SOCVisitDate: socVisitDate,
		physicianOrderedSOCDate: physicianOrderedSOCDateNA ? null : datePhysicianOrderedStartDate,
	} as const;

	return serviceLocationDetails;
}

function generateRandomDiagnoses(): CreateDiagnosesInput {
	const sampleDiagnoseses = [
		{
			diagnosisCode: 'W55.21XA',
			onsetOrExacerbation: 'Onset',
			diagnosisDescription: 'Bitten by cow, initial encounter',
			symptomControlRating:
				'2 - Symptoms controlled with difficulty, affecting daily functioning; patient needs ongoing monitoring.',
			dateOfOnsetOrExacerbation: faker.date.recent({ days: 7, refDate: new Date() }),
		},
		{
			diagnosisCode: 'W61.32XA',
			onsetOrExacerbation: '',
			diagnosisDescription: 'Struck by chicken, initial encounter',
			symptomControlRating: '',
			dateOfOnsetOrExacerbation: faker.date.recent({ days: 7, refDate: new Date() }),
		},
		{
			diagnosisCode: 'W51.XXXA',
			onsetOrExacerbation: '',
			diagnosisDescription: 'Accidental striking against or bumped into by another person, sequela',
			symptomControlRating: '',
			dateOfOnsetOrExacerbation: faker.date.recent({ days: 7, refDate: new Date() }),
		},
		{
			diagnosisCode: 'Y93.D',
			onsetOrExacerbation: '',
			diagnosisDescription: 'Activities involved arts and handcrafts',
			symptomControlRating: '',
			dateOfOnsetOrExacerbation: faker.date.recent({ days: 7, refDate: new Date() }),
		},
		{
			diagnosisCode: 'W00.0XXA',
			diagnosisDescription: 'Fall on same level due to ice and snow, initial encounter',
			symptomControlRating: '',
			onsetOrExacerbation: '',
			dateOfOnsetOrExacerbation: '2024-07-15T14:58:29.780Z',
		},
		{
			diagnosisCode: 'W61.62XD',
			diagnosisDescription: 'Struck by duck, subsequent encounter',
			symptomControlRating: '',
			onsetOrExacerbation: '',
			dateOfOnsetOrExacerbation: '2024-07-15T14:58:29.780Z',
		},
	];

	return faker.helpers.arrayElement(sampleDiagnoseses);
}

async function generatePatientsWithCloneData({
	seedIds,
	inputs,
	org,
}: {
	seedIds: number[];
	inputs: GenerateTestPatientDataInput;
	org: Organization;
}) {
	const result = await Promise.allSettled(
		seedIds.map(async (id) => {
			const patientCreateInfo = await generatePatientCreateInfo(inputs);
			const newPatient = await generateRandomPatient({
				patientCreateInfo,
				caseManagerId: inputs.caseManagerId,
				organization: org,
				locationId: inputs.locationId,
				status: PatientStatus.NewPatient,
			});

			const withCloneData = await addQaDataToPatient({
				caseManagerId: inputs.caseManagerId,
				organization: org,
				assignedQaUser: inputs.caseManagerId,
				patientId: newPatient.id,
				idToClone: id,
			});

			if (
				inputs.patientStatus === PatientStatus.ReadyForEMR ||
				withCloneData.status === PatientStatus.ReadyForEMR
			) {
				return await addAssessmentAndCompletePatient({
					patientId: newPatient.id,
					caseManagerId: inputs.caseManagerId,
					nurseSignOffName: inputs.caseManagerName ?? 'Test User',
				});
			}

			return withCloneData;
		}),
	);
	return result.map((r) => r.status === 'fulfilled' && r.value);
}

export async function generateSamplePatientData(inputs: GenerateTestPatientDataInput) {
	const org = await prisma.organization.findUniqueOrThrow({ where: { id: inputs.orgId } });
	const seedIds = inputs.seedInput?.seedIds;

	if (seedIds?.length) {
		return await generatePatientsWithCloneData({ seedIds, inputs, org });
	}

	const patientCreateInfo = await generatePatientCreateInfo(inputs);
	const newPatient = await generateRandomPatient({
		patientCreateInfo,
		caseManagerId: inputs.caseManagerId,
		organization: org,
		locationId: inputs.locationId,
		status: PatientStatus.NewPatient,
	});

	return newPatient;
}

const generateFictionalPhoneNumber = () => {
	//en.wikipedia.org/wiki/North_American_Numbering_Plan#Fictional_telephone_numbers
	const randomDigits = Math.floor(Math.random() * 1000);
	const randomAreaCode = randomDigits.toString().padStart(3, '0');
	const randomNumber = Math.floor(Math.random() * 100) + 100;
	const formattedNumber = `${randomAreaCode}-555-${randomNumber.toString().padStart(4, '0')}`;
	return formattedNumber;
};

function generateTestPatientName() {
	const randomBool = faker.datatype.boolean();
	const name = 'TestPatient';
	const firstName = randomBool ? faker.person.firstName() : name;
	const lastName = randomBool ? name : faker.person.lastName();
	const middleName = faker.datatype.boolean() ? faker.person.middleName() : null;
	const suffix = faker.datatype.boolean() ? faker.person.suffix() : null;
	return { firstName, lastName, middleName, suffix };
}

export async function generatePatientCreateInfo(inputs: GenerateTestPatientDataInput) {
	const patientBasicInfo = {
		...generateTestPatientName(),
		dateOfBirth: faker.date.birthdate({ min: 65, max: 115, mode: 'age', refDate: new Date() }),
		gender: faker.helpers.arrayElement(Object.values(Gender)),
		...addSocialSecurityOrUnknown(),
		EMRIdentifier: faker.string.alphanumeric(5),
		phoneNumber: generateFictionalPhoneNumber(),
	};

	const SocvisitDetails = await addSOCVisitDetails(inputs);

	const diagnosisDetails = {
		checkedResponse: {
			choice: {
				diagnoses: [generateRandomDiagnoses()],
			},
		},
	};

	const PayorSources = [
		{
			payorSourceIdentifier: faker.string.alphanumeric(5),
			payorSourceName: faker.company.name(),
			payorSourceType: faker.helpers.arrayElement(defaultConfig.payorType),
		},
	];

	const newPatientDetails: CreatePatientInput = {
		...patientBasicInfo,
		...SocvisitDetails,
		...diagnosisDetails,
		locationId: inputs.locationId,
		M0150Answer: faker.helpers.arrayElements(['01', '02', '03', '04', '05', '07', '10'], { max: 3, min: 1 }),
		PatientReferralSource: {
			contactName: faker.person.fullName(),
			contactPhone: faker.string.numeric(10),
			facilityName: faker.company.name(),
			facilityType: faker.helpers.arrayElement(defaultConfig.facilityType),
			referralDate: faker.date.recent(),
			socDate: faker.date.future(),
		},
		PatientAssociatedPhysicians: [
			{
				name: faker.person.fullName(),
				phone: faker.string.numeric(10),
				providerType: ProviderType.PrimaryCareProvider,
				referringPhysician: ReferringPhysician.NO,
			},
		],
		PayorSources,
	};

	return newPatientDetails;
}

export async function generateRandomPatient({
	caseManagerId,
	organization,
	status,
	patientCreateInfo,
}: {
	caseManagerId: string;
	organization: Organization;
	locationId: number;
	status?: PatientStatus;
	patientCreateInfo: CreatePatientInput;
}) {
	const {
		checkedResponse,
		PayorSources,
		PatientEmergencyContacts,
		PatientAssociatedPhysicians,
		PatientReferralSource,
		...rest
	} = patientCreateInfo;

	const configuration = await prisma.versionedConfiguration.findFirstOrThrow({
		where: { organizationId: organization.id },
		orderBy: { createdAt: 'desc' },
		take: 1,
	});

	const patientCreateArgs = {
		data: {
			...rest,
			SOCVisitCaseManagerId: caseManagerId,
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

async function addQaDataToPatient({
	caseManagerId,
	organization,
	assignedQaUser,
	patientId,
	idToClone,
}: {
	caseManagerId: string;
	organization: Organization;
	assignedQaUser?: string;
	patientId: number;
	idToClone: number;
}) {
	if (!idToClone) {
		throw new Error('Id to clone not provided');
	}
	const seedInterviewData = await extractClonePatientInterviewData({ patientId: idToClone });

	if (!seedInterviewData) {
		throw new Error('Interview data not found');
	}

	const attachmentType = await prisma.attachmentType.upsert({
		where: {
			organizationId_type_description: {
				organizationId: organization.id,
				type: 'Medication',
				description: `${patientId} - Medication List - ${faker.lorem.words(5)}`,
			},
		},
		create: {
			organizationId: organization.id,
			description: `${patientId} - Medication List - ${faker.lorem.words(5)}`,
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
				description: `Wounds ${faker.lorem.words(5)}`,
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

	const nurseInterview = seedInterviewData?.NurseInterview;
	const interviewQuestions = seedInterviewData?.InterviewQuestion;
	const assessmentAnswers = seedInterviewData?.AssessmentAnswer;

	const assessMentUpdate = assessmentAnswers.map((answer) => {
		return {
			...answer,
			checkedById: caseManagerId,
		} as Prisma.AssessmentAnswerCreateManyInput;
	});

	if (!nurseInterview || !interviewQuestions) {
		throw new Error('Interview data not found');
	}
	const { NurseInterviewThemeSummaries, ...restOfInterview } = nurseInterview;

	const updatedPatient = await prisma.patient.update({
		where: { id: patientId },
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
					data: interviewQuestions.map(({ question }) => {
						return {
							...question,
							userId: caseManagerId,
						};
					}),
				},
			},
			NurseInterview: {
				create: {
					...restOfInterview,
					userId: caseManagerId,
					NurseInterviewThemeSummaries: {
						create: NurseInterviewThemeSummaries.map(
							({ createdAt, updatedAt, QuestionItems, ...summary }) => {
								return {
									...summary,
									QuestionItems: {
										createMany: {
											data: QuestionItems,
										},
									},
								};
							},
						),
					},
				},
			},
			AssessmentAnswer: {
				connectOrCreate: assessMentUpdate.map((oa) => {
					const { generatedResponse, checkedResponse, ...rest } = oa;
					return {
						where: {
							patientId_assessmentNumber: {
								assessmentNumber: oa.assessmentNumber,
								patientId,
							},
						},
						create: {
							...(generatedResponse ? { generatedResponse } : {}),
							...(checkedResponse ? { checkedResponse } : {}),
							...rest,
						},
					};
				}),
			},
			status: seedInterviewData.status ?? PatientStatus.WithQA,
			versionedConfigurationId: seedInterviewData.versionedConfigurationId,
		},
		include: {
			NurseInterview: true,
			InterviewQuestion: true,
			PatientArtifacts: true,
		},
	});

	return updatedPatient;
}

async function addAssessmentAndCompletePatient({
	patientId,
	caseManagerId,
	nurseSignOffName,
}: {
	patientId: number;
	caseManagerId: string;
	nurseSignOffName: string;
}) {
	await unicornButton(caseManagerId, patientId);
	return await prisma.patient.update({
		where: { id: patientId },
		data: {
			status: PatientStatus.ReadyForEMR,
			nurseSignOffName,
			dataEntryAssignedUserId: caseManagerId,
			nurseSignOffDate: faker.date.recent({ days: 2, refDate: new Date() }),
		},
	});
}
