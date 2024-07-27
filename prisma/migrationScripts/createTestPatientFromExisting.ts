import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

const patientIdToCopy = 202;
const newFirstName = 'Accentra New Config';
const newLastName = 'Test';

async function main() {
	const {
		createdAt,
		updatedAt,
		patientReferralSourceId,
		id,
		AssessmentAnswer,
		PatientArtifacts,
		PatientAssociatedPhysicians,
		PatientEmergencyContacts,
		PatientReferralSource,
		primaryDiagnosisId,
		...patient
	} = await prisma.patient.findUniqueOrThrow({
		where: {
			id: patientIdToCopy,
		},
		include: {
			InterviewQuestion: true,
			NurseInterview: {
				include: {
					NurseInterviewThemeSummaries: {
						include: {
							QuestionItems: true,
						},
					},
				},
			},
			AssessmentAnswer: true,
			PatientArtifacts: {
				include: {
					patientDocumentArtifact: true,
				},
			},
			PatientAssociatedPhysicians: true,
			PatientEmergencyContacts: true,
			PatientReferralSource: true,
		},
	});

	if (!patient.NurseInterview) throw new Error('No nurse interview found for patient');

	const { id: interviewId, patientId, NurseInterviewThemeSummaries, ...nurseInterview } = patient.NurseInterview;
	const { id: _patientReferralSourceId, ...restPatientReferralSource } = PatientReferralSource ?? {};

	const newPatientReferralSource = await prisma.patientReferralSource.create({
		data: {
			...restPatientReferralSource,
		},
	});

	const create = {
		data: {
			...patient,
			EMRIdentifier: patient.EMRIdentifier + crypto.randomInt(100).toString(),
			firstName: newFirstName,
			lastName: newLastName,
			locationId: patient.locationId,
			SOCVisitCaseManagerId: patient.SOCVisitCaseManagerId,
			PatientAssociatedPhysicians: {
				create: PatientAssociatedPhysicians.map(({ id, patientId, ...physician }) => ({
					...physician,
				})),
			},
			PatientEmergencyContacts: {
				create: PatientEmergencyContacts.map(({ id, patientId, ...contact }) => ({
					...contact,
				})),
			},
			InterviewQuestion: {
				createMany: {
					data: patient.InterviewQuestion.map(({ id, patientId, ...question }) => ({
						...question,
					})),
				},
			},
			patientReferralSourceId: newPatientReferralSource.id,
			NurseInterview: {
				create: {
					...nurseInterview,
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
			AssessmentAnswer: {
				create: AssessmentAnswer.map((oa) => {
					const { id, patientId, createdAt, updatedAt, generatedResponse, checkedResponse, ...rest } = oa;
					return {
						...(generatedResponse ? { generatedResponse } : {}),
						...(checkedResponse ? { checkedResponse } : {}),
						...rest,
					};
				}),
			},
			// PatientArtifacts: {
			// 	create: PatientArtifacts.map(({ id, patientId, patientDocumentArtifact, ...artifact }) => {
			// 		if (patientDocumentArtifact) {
			// 			const { id, patientArtifactId, ...rest } = patientDocumentArtifact;
			// 			return {
			// 				...artifact,
			// 				patientDocumentArtifact: {
			// 					create: {
			// 						...rest,
			// 					},
			// 				},
			// 			};
			// 		}
			// 		return {
			// 			...artifact,
			// 		};
			// 	}),
			// },
		},
	};

	const newPatient = await prisma.patient.create(create);
	console.log('created new patient', JSON.stringify(newPatient));
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
