import { PatientAuditLogAction, PatientStatus, Prisma, UserRole } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { intervalToDuration, startOfDay } from 'date-fns';
import { CustomAssessmentNumber } from '~/assessments/apricot/custom';
import logger from '~/common/utils/logger';
import {
	isPostSignOffStatus,
	nurseInterviewPendingStatuses,
	ScheduleViewStatuses,
	shouldQABeRunWhenMovingToThisStatus,
} from '~/common/utils/patientStatusUtils';
import { EVENT, sendEvent } from '~/server/jobs';
import { env } from '../../../../env.mjs';
import { prisma } from '../../../prisma';
import * as sendgridService from '../../common/email/sendgrid.service';
import { PermissionedTRPCContext } from '../../trpc';
import { assessmentRepo } from '../assessment/assessment.repo';
import * as assessmentService from '../assessment/assessment.service';
import { createAuditLog } from '../auditLog/auditLog.service';
import { configurationService } from '../configuration/configuration.service';
import * as organizationService from '../organization/organization.service';
import { userRepo } from '../user/user.repo';
import { generateSamplePatientData } from './generate-patient';
import * as patientInputs from './patient.inputs';
import { patientRepo } from './patient.repo';
import { getCanAnswer } from './patient.util';
import { getVisitNoteUrls, visitNotesExist, VisitNoteType } from './visitNote.util';

export const createPatient = async (input: patientInputs.CreatePatientInput, ctx: PermissionedTRPCContext) => {
	const {
		PatientReferralSource,
		PatientEmergencyContacts,
		PatientAssociatedPhysicians,
		PayorSources,
		socialSecurityNumber,
		socialSecurityUnknown,
		physicianOrderedSOCDate,
		physicianOrderedSOCDateNA,
		M0063Answer,
		M0065Answer,
		M0150Answer,
		SOCVisitCaseManagerId,
		checkedResponse,
		...rest
	} = input;

	const organization = await organizationService.getUserOrganization(ctx);
	const configuration = await configurationService.getCurrentConfigurationForOrg(ctx);

	const createArgs = {
		data: {
			...rest,
			socialSecurityNumber: socialSecurityUnknown ? null : socialSecurityNumber,
			physicianOrderedSOCDate: physicianOrderedSOCDateNA ? null : physicianOrderedSOCDate,
			socialSecurityUnknown,
			configurationType: organization.configurationType,
			physicianOrderedSOCDateNA,
			M0150Answer: M0150Answer ?? [],
			M0063Answer: getCanAnswer('M0063', M0150Answer) ? M0063Answer : null,
			M0065Answer: getCanAnswer('M0065', M0150Answer) ? M0065Answer : null,
			organizationId: organization.id,
			status: PatientStatus.NewPatient,
			versionedConfigurationId: configuration.id,
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
		include: {
			SOCVisitCaseManager: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
		},
	} satisfies Prisma.PatientCreateArgs;

	try {
		const patient = await patientRepo.create(ctx, createArgs);
		void createAuditLog(
			{
				patientId: patient.id,
				payload: input,
				action: PatientAuditLogAction.CREATE_PATIENT,
			},
			ctx,
		);

		if (PatientReferralSource) {
			await patientRepo.update(ctx, {
				where: { id: patient.id },
				data: {
					PatientReferralSource: {
						create: PatientReferralSource,
					},
				},
			});
		}
		if (SOCVisitCaseManagerId) {
			await assignUserToPatient(patient.id, SOCVisitCaseManagerId, ctx);
		}
		return patient;
	} catch (e) {
		if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: 'A SOC visit already exists for this episode ID. Please provide a unique episode ID.',
			});
		}
		throw e;
	}
};

export const updatePatient = async (input: patientInputs.UpdatePatientInput, ctx: PermissionedTRPCContext) => {
	const {
		id,
		PatientReferralSource,
		PatientEmergencyContacts,
		PatientAssociatedPhysicians,
		PayorSources,
		locationId,
		SOCVisitCaseManagerId,
		socialSecurityNumber,
		socialSecurityUnknown,
		physicianOrderedSOCDate,
		physicianOrderedSOCDateNA,
		M0063Answer,
		M0065Answer,
		M0150Answer,
		checkedResponse,
		...rest
	} = input;

	if (checkedResponse) {
		await assessmentRepo.upsert(ctx, {
			where: {
				patientId_assessmentNumber: {
					patientId: id,
					assessmentNumber: CustomAssessmentNumber.DIAGNOSES,
				},
			},
			create: {
				patientId: id,
				assessmentNumber: CustomAssessmentNumber.DIAGNOSES,
				checkedResponse,
			},
			update: {
				checkedResponse,
			},
		});
	}
	try {
		const updatedPatient = await patientRepo.update(ctx, {
			where: {
				id,
			},
			data: {
				...rest,
				socialSecurityNumber: socialSecurityUnknown ? null : socialSecurityNumber,
				physicianOrderedSOCDate: physicianOrderedSOCDateNA ? null : physicianOrderedSOCDate,
				socialSecurityUnknown,
				physicianOrderedSOCDateNA,
				M0150Answer: M0150Answer ?? [],
				M0063Answer: getCanAnswer('M0063', M0150Answer) ? M0063Answer : null,
				M0065Answer: getCanAnswer('M0065', M0150Answer) ? M0065Answer : null,
				...(locationId
					? {
							Location: {
								connect: {
									id: locationId,
								},
							},
						}
					: {}),
				PayorSources: {
					deleteMany: {},
					create: PayorSources ?? [],
				},
				PatientEmergencyContacts: {
					deleteMany: {},
					create: PatientEmergencyContacts ?? [],
				},
				PatientAssociatedPhysicians: {
					deleteMany: {},
					create: PatientAssociatedPhysicians ?? [],
				},

				PatientReferralSource: {
					upsert: {
						create: PatientReferralSource,
						update: PatientReferralSource,
					},
				},
			},
		});

		void createAuditLog(
			{
				patientId: input.id,
				payload: input,
				action: PatientAuditLogAction.UPDATE_PATIENT,
			},
			ctx,
		);

		if (SOCVisitCaseManagerId) {
			await assignUserToPatient(id, SOCVisitCaseManagerId, ctx);
		}

		return updatedPatient;
	} catch (e) {
		if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: 'A SOC visit already exists for this episode ID. Please provide a unique episode ID.',
			});
		}
		throw e;
	}
};

export const deletePatient = async (input: patientInputs.DeleteByIdInput, ctx: PermissionedTRPCContext) => {
	const { id } = input;
	const deletedPatient = await patientRepo.delete(ctx, { where: { id } });
	void createAuditLog(
		{
			patientId: input.id,
			payload: input,
			action: PatientAuditLogAction.DELETE_PATIENT,
		},
		ctx,
	);

	return deletedPatient;
};

const generateOrderBy = (orderBy: patientInputs.GetInfiniteInput['orderBy']) => {
	const defaultOrder: Prisma.PatientOrderByWithRelationInput = { id: 'asc' };

	if (!orderBy) return defaultOrder;

	const order = orderBySwitch(orderBy.field, orderBy.sortOrder);
	return [order, defaultOrder];
};

const orderBySwitch = (field: string, sortOrder: 'asc' | 'desc') => {
	switch (field) {
		case 'Location.name':
			return { Location: { name: sortOrder } };
		case 'Organization.name':
			return { Organization: { name: sortOrder } };
		case 'SOCVisitCaseManager.name':
			return { SOCVisitCaseManager: { name: sortOrder } };
		case 'name':
			return { firstName: sortOrder };
		case 'address':
			return { address1: sortOrder };
		case 'id':
			return { id: sortOrder };
		default:
			return { [field]: sortOrder };
	}
};

export const getInfinitePatients = async (
	{ limit, cursor, filters, name, orderBy }: patientInputs.GetInfiniteInput,
	ctx: PermissionedTRPCContext,
) => {
	const nameFilter = getNameFilterForInfinitePatients(name);

	const statusFilters = filters
		? Object.entries(filters)
				.filter(([_, value]) => value)
				.map(([key]) => ({ status: key as PatientStatus }))
		: [];

	const filterJoin = [nameFilter ?? {}, statusFilters.length > 0 ? { OR: statusFilters } : {}];
	const filterAnd = { AND: filterJoin };

	const count = await patientRepo.count(ctx, { where: filterAnd });

	const items = await patientRepo.findMany(ctx, {
		take: limit + 1,
		where: filterAnd,
		orderBy: generateOrderBy(orderBy),
		cursor: cursor ? { id: cursor } : undefined,
		include: {
			SOCVisitCaseManager: {
				select: {
					id: true,
					name: true,
				},
			},
			Location: true,
			Organization: true,
		},
	});

	let nextCursor: typeof cursor | undefined = undefined;

	if (items.length > limit) {
		const nextItem = items.pop();
		nextCursor = nextItem!.id;
	}

	return {
		items,
		nextCursor,
		count,
	};
};

export const updatePatientStatus = async (
	{ patientId, status, nurseSignOffName }: patientInputs.UpdatePatientStatusInput,
	ctx: PermissionedTRPCContext,
) => {
	const existingPatient = await patientRepo.findUniqueOrThrow(ctx, { where: { id: patientId } });
	const hasSignOffName = nurseSignOffName ?? existingPatient.nurseSignOffName;
	if (env.APRICOT_ENV === 'production' && status === PatientStatus.ReadyForEMR && !hasSignOffName) {
		throw new Error('A nurse sign off name is required to complete a patient');
	}

	// need to do this before patient's status is actually updated due to status sanity checks around updating assesmentAnswers
	if (shouldQABeRunWhenMovingToThisStatus(status)) {
		try {
			await assessmentService.QACheckAllAssessmentAnswers(ctx, patientId);
		} catch (e) {
			logger.error('Error QAing patient', e);
		}
	}

	const signOffInfoChanges = signOffChangesBasedOnStatus(existingPatient.status, status, nurseSignOffName);

	const patient = await patientRepo.update(ctx, {
		where: {
			id: patientId,
		},
		data: {
			status,
			...signOffInfoChanges,
		},
		include: {
			SOCVisitCaseManager: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
		},
	});

	void createAuditLog(
		{
			patientId,
			payload: { patientId, status, nurseSignOffName },
			action: PatientAuditLogAction.UPDATE_PATIENT,
		},
		ctx,
	);

	if (status === PatientStatus.WithQA) {
		const qaManagers = await ctx.db.user.findMany({
			where: {
				roles: { has: UserRole.QaManager },
			},
		});
		qaManagers.forEach((manager) => {
			sendgridService
				.sendQaManagerAssignedEmail(manager.email, patientId)
				.catch((err) => logger.error('Error sending email:', err));
		});
	}

	if (patient?.SOCVisitCaseManager && patient.status === PatientStatus.SignoffNeeded) {
		await sendgridService.sendReadyForSignoffEmail(patient.SOCVisitCaseManager?.email, patient.id);
	}

	if (status === PatientStatus.ReadyForEMR) {
		await sendEvent({ name: EVENT.patientReadyForEMR, data: { patientId } });
		const dataEntryManagers = await ctx.db.user.findMany({
			where: {
				roles: { has: UserRole.DataEntryManager },
			},
		});
		const promises = dataEntryManagers.map((manager) =>
			sendgridService.sendDataEntryAssignedEmail(manager.email, patientId, nurseSignOffName ?? ''),
		);
		Promise.all(promises).catch((err) => logger.error('Error sending email:', err));
	}

	return patient;
};

export const setPatientStatusAsComplete = (
	{ patientId }: patientInputs.SetPatientStatusAsCompleteInput,
	ctx: PermissionedTRPCContext,
) => {
	return updatePatientStatus({ patientId, status: PatientStatus.Complete }, ctx);
};

export const setPatientStatusAsNonAdmit = (
	{ patientId }: patientInputs.SetPatientStatusAsNonAdmitInput,
	ctx: PermissionedTRPCContext,
) => {
	return updatePatientStatus({ patientId, status: PatientStatus.NonAdmit }, ctx);
};
export const setPatientStatusAsNewPatient = (
	{ patientId }: patientInputs.SetPatientStatusAsNewPatientInput,
	ctx: PermissionedTRPCContext,
) => {
	return updatePatientStatus({ patientId, status: PatientStatus.NewPatient }, ctx);
};

export const getScheduleViewPatients = (ctx: PermissionedTRPCContext) => {
	return patientRepo.findMany(ctx, {
		where: {
			SOCVisitCaseManagerId: ctx.session.user.id,
			status: {
				in: [...ScheduleViewStatuses],
			},
		},
		orderBy: {
			SOCVisitDate: 'asc',
		},
		include: {
			InterviewQuestion: true,
			NurseInterview: true,
			PatientArtifacts: true,
		},
	});
};

export const getPatientsByStatus = (
	{ status }: patientInputs.GetPatientsByStatusInput,
	ctx: PermissionedTRPCContext,
) => {
	return patientRepo.findMany(ctx, {
		where: {
			status,
		},
		orderBy: {
			SOCVisitDate: 'asc',
		},
	});
};

type PatientIncludeArgs = Prisma.PatientInclude;
export const getPatientById = async <I extends PatientIncludeArgs>(
	id: number,
	ctx: PermissionedTRPCContext,
	includes: I,
): Promise<Prisma.PatientGetPayload<{ include: I }>> => {
	const patient = await patientRepo.findUniqueOrThrow(ctx, {
		where: {
			id,
		},
		include: includes,
	});

	return patient;
};

export const assignUserToPatient = async (patientId: number, userId: string, ctx: PermissionedTRPCContext) => {
	const patient = await patientRepo.findUniqueOrThrow(ctx, {
		where: { id: patientId },
	});

	if (userId) {
		const user = await ctx.db.user.findFirst({
			where: { id: userId },
		});

		if (!user) {
			throw new TRPCError({
				code: 'FORBIDDEN',
				message:
					'User cannot be assigned to patient because they do not belong to the same organization as the logged in user',
			});
		}
	}

	const data = await patientRepo.update(ctx, {
		where: { id: patientId },
		data: {
			SOCVisitCaseManager: userId ? { connect: { id: userId } } : { disconnect: true },
		},
		include: {
			SOCVisitCaseManager: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
		},
	});

	void createAuditLog(
		{
			patientId,
			payload: { patientId, userId },
			action: PatientAuditLogAction.UPDATE_PATIENT,
		},
		ctx,
	);

	if (!data.SOCVisitCaseManager) {
		return data;
	}

	try {
		if (!patient.SOCVisitCaseManagerId || patient.SOCVisitCaseManagerId !== userId) {
			await sendgridService.sendAssignedEmail(data.SOCVisitCaseManager?.email, data);
		}
	} catch (e: unknown) {
		logger.error('error sending email', e);
	}

	return data;
};

export const assignQAUserToPatient = async (
	input: patientInputs.AssignQAUserToPatientInput,
	ctx: PermissionedTRPCContext,
) => {
	const patient = await patientRepo.findUniqueOrThrow(ctx, { where: { id: input.patientId } });

	if (!input.userId) {
		return await patientRepo.update(ctx, {
			where: { id: input.patientId },
			data: { qaAssignedUserId: null },
		});
	}

	const user = await userRepo.findUniqueOrThrow(ctx, {
		where: { id: input.userId, roles: { has: UserRole.QA } },
		select: {
			id: true,
			email: true,
		},
	});

	const data = await patientRepo.update(ctx, {
		where: { id: input.patientId },
		data: { qaAssignedUserId: input.userId },
	});

	if (user && patient.qaAssignedUserId !== user.id) {
		try {
			await sendgridService.sendQaAssignedEmail(user.email, patient.id);
		} catch (error) {
			logger.error('Error sending email:', error);
		}
	}

	return data;
};
export const assignDataEntryUserToPatient = async (
	input: patientInputs.AssignQAUserToPatientInput,
	ctx: PermissionedTRPCContext,
) => {
	const patient = await patientRepo.findUniqueOrThrow(ctx, { where: { id: input.patientId } });

	if (!input.userId) {
		return await patientRepo.update(ctx, {
			where: { id: input.patientId },
			data: { dataEntryAssignedUserId: null },
		});
	}

	const user = await userRepo.findUniqueOrThrow(ctx, {
		where: { id: input.userId, roles: { has: UserRole.DataEntry } },
		select: {
			id: true,
			email: true,
		},
	});

	const data = await patientRepo.update(ctx, {
		where: { id: input.patientId },
		data: { dataEntryAssignedUserId: input.userId },
	});

	if (user && patient.dataEntryAssignedUserId !== user.id) {
		try {
			await sendgridService.sendDataEntryAssignedEmail(user.email, patient.id, patient.nurseSignOffName ?? '');
		} catch (error) {
			logger.error('Error sending email:', error);
		}
	}

	return data;
};

const getNameFilterForInfinitePatients = (name: string | null | undefined) => {
	const nameWords = name?.split(/\s+/);

	if (nameWords?.length === 1) {
		const singleWord = nameWords[0];
		return {
			OR: [
				{ firstName: { contains: singleWord, mode: 'insensitive' as const } },
				{ middleName: { contains: singleWord, mode: 'insensitive' as const } },
				{ lastName: { contains: singleWord, mode: 'insensitive' as const } },
			],
		};
	} else if (nameWords?.length === 2) {
		const [firstWord, secondWord] = nameWords;
		return {
			OR: [
				{
					firstName: { contains: firstWord, mode: 'insensitive' as const },
					lastName: { contains: secondWord, mode: 'insensitive' as const },
				},
				{
					firstName: { contains: secondWord, mode: 'insensitive' as const },
					lastName: { contains: firstWord, mode: 'insensitive' as const },
				},
			],
		};
	} else if (nameWords?.length === 3) {
		const [firstWord, secondWord, thirdWord] = nameWords;
		return {
			OR: [
				{
					firstName: { contains: firstWord, mode: 'insensitive' as const },
					middleName: { contains: secondWord, mode: 'insensitive' as const },
					lastName: { contains: thirdWord, mode: 'insensitive' as const },
				},
				{
					firstName: { contains: thirdWord, mode: 'insensitive' as const },
					middleName: { contains: secondWord, mode: 'insensitive' as const },
					lastName: { contains: firstWord, mode: 'insensitive' as const },
				},
				{
					firstName: { contains: firstWord, mode: 'insensitive' as const },
					middleName: { contains: thirdWord, mode: 'insensitive' as const },
					lastName: { contains: secondWord, mode: 'insensitive' as const },
				},
				{
					firstName: { contains: secondWord, mode: 'insensitive' as const },
					middleName: { contains: thirdWord, mode: 'insensitive' as const },
					lastName: { contains: firstWord, mode: 'insensitive' as const },
				},
				{
					firstName: { contains: secondWord, mode: 'insensitive' as const },
					middleName: { contains: firstWord, mode: 'insensitive' as const },
					lastName: { contains: thirdWord, mode: 'insensitive' as const },
				},
				{
					firstName: { contains: thirdWord, mode: 'insensitive' as const },
					middleName: { contains: firstWord, mode: 'insensitive' as const },
					lastName: { contains: secondWord, mode: 'insensitive' as const },
				},
			],
		};
	}
};

export const confirmAssessmentSectionByPatientId = async (
	{ patientId, section }: patientInputs.ConfirmAssessmentSectionByPatientIdInput,
	ctx: PermissionedTRPCContext,
) => {
	const patient = await getPatientById(patientId, ctx, {});
	const userId = ctx.session.user.id;

	if (userId !== patient.SOCVisitCaseManagerId) {
		throw new TRPCError({
			code: 'FORBIDDEN',
			message: 'Only the assigned Case Manager can confirm OASIS sections for this patient',
		});
		return;
	}
	void createAuditLog(
		{
			patientId,
			payload: { patientId, section },
			action: PatientAuditLogAction.UPDATE_PATIENT,
		},
		ctx,
	);

	const data = await ctx.db.nurseConfirmedAssessmentSections.upsert({
		where: { patientId_section: { patientId, section } },
		create: { patientId, section },
		update: { patientId, section },
	});

	logger.info(`[User ${userId}] confirmed OASIS section ${section} for patient ${patientId}`);

	return data;
};

export const resetPatient = async ({ patientId }: patientInputs.ResetPatientInput, ctx: PermissionedTRPCContext) => {
	if (env.APRICOT_ENV === 'production') {
		throw new Error('Resetting patients is not allowed in production');
		return;
	}
	await patientRepo.findUniqueOrThrow(ctx, { where: { id: patientId } });
	try {
		await ctx.db.nurseInterviewQuestionItem.deleteMany({
			where: { NurseInterviewThemeSummaries: { NurseInterview: { patientId } } },
		});
		await ctx.db.nurseInterviewThemeSummaries.deleteMany({ where: { NurseInterview: { patientId } } });
		await ctx.db.nurseInterview.deleteMany({ where: { patientId } });
		await ctx.db.nurseConfirmedAssessmentSections.deleteMany({ where: { patientId } });
		await ctx.db.interviewQuestion.deleteMany({ where: { patientId } });

		return await ctx.db.patient.update({
			where: { id: patientId },
			data: {
				status: PatientStatus.NewPatient,
				SOCVisitDate: new Date(),
			},
		});
	} catch (error) {
		throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Error resetting patient' });
	}
};

export const getVisitNoteSignedUrls = async (
	{ patientId }: patientInputs.DownloadVisitNoteInput,
	ctx: PermissionedTRPCContext,
): Promise<
	| { status: 'processing' }
	| { status: 'ready'; signedUrls: { type: VisitNoteType; signedUrl: string; expires: Date }[] }
> => {
	const patient = await getPatientById(patientId, ctx, {});

	if (!isPostSignOffStatus(patient.status)) {
		throw new TRPCError({
			code: 'BAD_REQUEST',
			message: "Visit note can not be downloaded for patient's status",
		});
	}

	const filesExist = await visitNotesExist(patient.id);
	if (!filesExist) {
		await sendEvent({ name: EVENT.patientVisitNoteRequested, data: { patientId } });
		return { status: 'processing' };
	}

	const signedUrls = await getVisitNoteUrls(patient);
	return { status: 'ready', signedUrls };
};

export const fetchNursesToRemind = async () => {
	try {
		const now = new Date();
		const patientsNotReceivedSOCVisit = await prisma.patient.findMany({
			where: {
				status: { in: [...nurseInterviewPendingStatuses] },
				SOCVisitDate: {
					lt: startOfDay(now),
				},
			},
		});
		const nurseData = patientsNotReceivedSOCVisit.map((p) => ({
			id: p.SOCVisitCaseManagerId,
			visitDate: p.SOCVisitDate,
			patientId: p.id,
			duration: intervalToDuration({ start: p.SOCVisitDate!, end: now }).days,
		}));
		const SOCVisitCaseManagerIds = patientsNotReceivedSOCVisit
			.map((patient) => patient.SOCVisitCaseManagerId)
			.filter((id): id is string => id !== null);
		const nurseToRemind = await prisma.user.findMany({
			where: {
				id: {
					in: SOCVisitCaseManagerIds,
				},
			},
		});
		return { nurseToRemind, nurseData };
	} catch (e) {
		logger.error('Error fetching nurses to remind', e);
	}
};

function signOffChangesBasedOnStatus(oldStatus: PatientStatus, newStatus: PatientStatus, nurseSignOffName?: string) {
	if (isPostSignOffStatus(newStatus) && oldStatus === PatientStatus.SignoffNeeded) {
		if (!nurseSignOffName) {
			throw new Error('A nurse sign off name is required to complete a patient');
		}
		return { nurseSignOffName, nurseSignOffDate: new Date() };
	}
	return clearIfGoingFromSignedOffToNotSignedOff(oldStatus, newStatus);
}

function clearIfGoingFromSignedOffToNotSignedOff(oldStatus: PatientStatus, newStatus: PatientStatus) {
	if (isPostSignOffStatus(oldStatus) && !isPostSignOffStatus(newStatus)) {
		return { nurseSignOffName: null, nurseSignOffDate: null };
	}

	return {};
}
export function generateTestPatientData(
	input: patientInputs.GenerateTestPatientDataInput,
	_ctx: PermissionedTRPCContext,
) {
	return Promise.all(
		Array.from({ length: input.numberOfPatients }).map(() => {
			return generateSamplePatientData(input);
		}),
	);
}
