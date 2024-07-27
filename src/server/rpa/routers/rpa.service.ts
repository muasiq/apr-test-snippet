import {
	AssessmentAnswerIntegrationStatus,
	Patient,
	PatientArtifactTag,
	PatientStatus,
	Prisma,
	UserRole,
} from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { compact } from 'lodash';
import logger from '~/common/utils/logger';
import { EMRDataEntryStatuses } from '~/common/utils/patientStatusUtils';
import * as sendgridService from '~/server/api/common/email/sendgrid.service';
import { cloudStorage } from '~/server/api/common/gcp/cloudStorage';
import { PatientWithJoins, PatientWithJoinsInclude } from '~/server/api/routers/patient/patient.types';
import {
	RpaAssessmentAnswerWithQuestionText,
	resolveAllAssessmentData,
} from '~/server/api/routers/patient/v1/patient-rpa.utils';
import { RpaTRPCContext } from '~/server/rpa/trpc';
import {
	GetAssessmentScreenshotUploadUrlInput,
	GetPatientByIdInput,
	MarkPatientAsCompleteInput,
	MarkPatientAsInProgress,
	RequestLoginInput,
	RequestMainLoginInput,
	RequestMainLogoutInput,
	UpdateRpaPatientArtifactInput,
	UpdateRpaPatientAssessmentAnswerInput,
} from './rpa.inputs';

export const rpaService = {
	async getRpaPatients(ctx: RpaTRPCContext) {
		const patients = await ctx.db.patient.findMany({
			where: {
				status: { in: [...EMRDataEntryStatuses] },
			},
			select: {
				...patientRpaFields,
				PatientArtifacts: {
					include: {
						attachmentType: true,
						patientDocumentArtifact: true,
					},
				},
			},
		});
		const mappedPatients = patients.map((p) => patientToRpaPatient(p as Partial<PatientWithJoins>));
		return mappedPatients;
	},

	async getRpaPatient(ctx: RpaTRPCContext, input: GetPatientByIdInput) {
		const { patientId: id } = input;
		const patient = await ctx.db.patient.findFirst({
			where: { id, status: { in: [...EMRDataEntryStatuses] } },
			include: {
				...PatientWithJoinsInclude,
				AssessmentAnswer: true,
				Organization: {
					include: { PhysicalAssessmentCategories: true },
				},
			},
		});
		if (patient) {
			const { AssessmentAnswer, ...rest } = patient;
			const { PhysicalAssessmentCategories } = patient.Organization;

			const assessmentAnswers = await resolveAllAssessmentData(ctx, rest, AssessmentAnswer);

			const withSignedUrls = rest.PatientArtifacts.map(async (artifact) => {
				if (!artifact.cloudStorageLocation) return null;
				const { signedUrl } = await cloudStorage.createSignedURL(
					artifact.cloudStorageLocation,
					'read',
					true,
					artifact.fileName,
				);
				// only include visit note if attachmentType is defined
				if (artifact.tagName === PatientArtifactTag.VisitNote && !artifact.attachmentType) {
					return null;
				}
				return {
					id: artifact.id,
					url: signedUrl,
					description: artifact.attachmentType?.description,
					hchbType: artifact.attachmentType?.type,
					hchbLocation: artifact.attachmentType?.location,
					hchbNotes: artifact.attachmentType?.notes,
					integrationStatus: artifact.integrationStatus,
					integrationMessage: artifact.integrationMessage,
				};
			});
			const allAwaited = await Promise.all(withSignedUrls);
			const artifacts: RPAArtifact[] = compact(allAwaited);

			if (!rest.EMRIdentifier)
				throw new Error(`EMRIdentifier is required for patient in RPA context, ${rest.id}`);

			const payload: RPAPatient = {
				episodeID: rest.EMRIdentifier,
				workerName: rest.SOCVisitCaseManager?.name ?? null,
				workerPointcareID: rest.SOCVisitCaseManager?.pointcareId ?? null,
				id: rest.id,
				firstName: rest.firstName,
				middleName: rest.middleName ?? '',
				lastName: rest.lastName,
				status: rest.status,
				artifacts,
				configurationType: rest.configurationType,
				assessmentAnswers,
				physicalAssessmentCategories: PhysicalAssessmentCategories.map((category) => category.name),
			};

			return payload;
		} else {
			throw new TRPCError({ code: 'NOT_FOUND', message: 'Patient not found' });
		}
	},

	async updateRpaPatientAssessmentAnswer(ctx: RpaTRPCContext, input: UpdateRpaPatientAssessmentAnswerInput) {
		const patient = await ctx.db.patient.findUnique({
			where: { id: input.patientId, status: { in: [...EMRDataEntryStatuses] } },
			select: patientRpaFields,
		});
		if (patient) {
			const result = await ctx.db.assessmentAnswer.upsert({
				where: {
					patientId_assessmentNumber: {
						patientId: patient.id,
						assessmentNumber: input.assessmentNumber,
					},
				},
				update: {
					integrationStatus: input.status,
					integrationMessage: input.message ?? null,
				},
				create: {
					patientId: patient.id,
					assessmentNumber: input.assessmentNumber,
					integrationStatus: input.status,
					integrationMessage: input.message ?? null,
				},
				select: {
					assessmentNumber: true,
					integrationStatus: true,
					integrationMessage: true,
				},
			});
			return result;
		} else {
			throw new TRPCError({ code: 'NOT_FOUND', message: 'Patient not found' });
		}
	},

	async updateRpaPatientArtifact(ctx: RpaTRPCContext, input: UpdateRpaPatientArtifactInput) {
		const patient = await ctx.db.patient.findUnique({
			where: { id: input.patientId, status: { in: [...EMRDataEntryStatuses] } },
			select: { ...patientRpaFields },
		});
		if (patient) {
			const { integrationStatus, integrationMessage } = input;
			const result = await ctx.db.patientArtifact.update({
				where: {
					patientId: input.patientId,
					id: input.artifactId,
				},
				data: {
					integrationStatus,
					integrationMessage,
				},
				select: {
					id: true,
					integrationStatus: true,
					integrationMessage: true,
				},
			});
			return result;
		}
		throw new TRPCError({ code: 'NOT_FOUND', message: 'Patient not found' });
	},

	async markPatientAsInProgress(ctx: RpaTRPCContext, input: MarkPatientAsInProgress) {
		const { patientId: id } = input;
		const updatedPatient = await ctx.db.patient.update({
			where: { id, status: { in: [...EMRDataEntryStatuses] } },
			data: { status: PatientStatus.AddingToEMR },
			select: { ...patientRpaFields, locationId: true },
		});

		return patientToRpaPatient(updatedPatient as Partial<PatientWithJoins>);
	},

	async markPatientAsComplete(ctx: RpaTRPCContext, input: MarkPatientAsCompleteInput) {
		const { patientId: id } = input;
		const { locationId, ...updatedPatient } = await ctx.db.patient.update({
			where: { id, status: { in: [...EMRDataEntryStatuses] } },
			data: { status: PatientStatus.Complete },
			select: { ...patientRpaFields, locationId: true },
		});

		const loginForPatient = await ctx.db.loginProfile.findFirst({
			where: { patientId: id },
		});

		if (loginForPatient) {
			await ctx.db.loginProfile.update({
				where: { id: loginForPatient.id },
				data: { inUse: false, patientId: null },
			});
		}

		if (locationId) {
			try {
				const branchRoles = await ctx.db.user.findMany({
					where: {
						Locations: { some: { id: locationId } },
						roles: { hasSome: [UserRole.BranchAdmin, UserRole.BranchOffice] },
					},
					select: { email: true },
				});
				const emails = branchRoles.map((user) => user.email);
				await Promise.all(
					emails.map((email) => sendgridService.patientStatusCompletedEmail(email, updatedPatient.id)),
				);
			} catch (error) {
				logger.error('Error sending email:', JSON.stringify(error));
			}
		}

		return patientToRpaPatient(updatedPatient as Partial<PatientWithJoins>);
	},

	async getAssessmentScreenshotUploadUrl(ctx: RpaTRPCContext, input: GetAssessmentScreenshotUploadUrlInput) {
		const { patientId, assessmentNumber } = input;
		const patient = await ctx.db.patient.findFirstOrThrow({
			where: {
				id: patientId,
				status: { in: [...EMRDataEntryStatuses] },
			},
		});
		const directory = `rpa/failed-assessments/patient-${patient.id}/${assessmentNumber}`;
		const { signedUrl } = await cloudStorage.createSignedURL(directory, 'write');
		return { signedUrl };
	},

	async requestMainLogin(ctx: RpaTRPCContext, input: RequestMainLoginInput) {
		const { orgId } = input;
		const org = await ctx.db.organization.findFirst({
			where: { id: orgId },
			include: { LoginProfile: { where: { inUse: false, mainLogin: true } } },
		});
		if (!org) {
			throw new TRPCError({ code: 'NOT_FOUND', message: 'Org not found' });
		}
		const [login] = org.LoginProfile;
		if (!login) {
			throw new TRPCError({ code: 'NOT_FOUND', message: 'No available logins' });
		}
		await ctx.db.loginProfile.update({ where: { id: login.id }, data: { inUse: true } });

		const { id, ...rest } = login;

		return {
			...rest,
			loginId: id,
		};
	},

	async requestLogin(ctx: RpaTRPCContext, input: RequestLoginInput) {
		const { patientId } = input;
		const patient = await ctx.db.organization.findFirst({
			where: { Patient: { some: { id: patientId, status: { in: [...EMRDataEntryStatuses] } } } },
			include: { LoginProfile: { where: { inUse: false, mainLogin: false } } },
		});
		if (!patient) {
			throw new TRPCError({ code: 'NOT_FOUND', message: 'Patient not found' });
		}
		const [login] = patient.LoginProfile;
		if (!login) {
			throw new TRPCError({ code: 'NOT_FOUND', message: 'No available logins' });
		}
		await ctx.db.loginProfile.update({ where: { id: login.id }, data: { inUse: true, patientId } });

		const { id, ...rest } = login;

		return {
			...rest,
			loginId: id,
		};
	},

	async requestMainLogout(ctx: RpaTRPCContext, input: RequestMainLogoutInput) {
		const { loginId } = input;
		const login = await ctx.db.loginProfile.findUnique({
			where: { id: loginId },
		});
		if (!login) {
			throw new TRPCError({ code: 'NOT_FOUND', message: 'Login not found' });
		}
		await ctx.db.loginProfile.update({ where: { id: loginId }, data: { inUse: false, patientId: null } });
		return { message: 'Logout successful' };
	},
};

function patientToRpaPatient(patient: Partial<PatientWithJoins>): RPAPatient {
	const { EMRIdentifier, ...rest } = patient as Partial<Patient>;
	return {
		episodeID: EMRIdentifier!,
		workerName: patient.SOCVisitCaseManager?.name ?? null,
		...rest,
	} as RPAPatient;
}

const patientRpaFields = {
	EMRIdentifier: true,
	SOCVisitCaseManager: { select: { name: true } },
	id: true,
	firstName: true,
	middleName: true,
	lastName: true,
	status: true,
	configurationType: true,
} satisfies Prisma.PatientSelect;

export type RPAPatient = {
	episodeID: string;
	id: number;
	workerName: string | null;
	workerPointcareID: string | null;
	firstName: string;
	middleName: string;
	lastName: string;
	status: string;
	configurationType: string;
	artifacts: RPAArtifact[];
	assessmentAnswers: RpaAssessmentAnswerWithQuestionText[];
	physicalAssessmentCategories: string[];
};

export type RPAArtifact = {
	id: number;
	hchbType?: string | null;
	hchbLocation?: string | null;
	hchbNotes?: string | null;
	url: string;
	integrationStatus: AssessmentAnswerIntegrationStatus;
	integrationMessage: string | null;
};
