import { AssessmentAnswer, Prisma } from '@prisma/client';
import { merge } from 'lodash';
import { statusAllowsAssessmentUpdates } from '~/common/utils/patientStatusUtils';
import { dataAccessLevelToStatuses, DataAccessPermissions } from '../../../../common/utils/permissions';
import { prisma } from '../../../prisma';
import { PermissionedTRPCContext } from '../../trpc';
import * as patientService from '../patient/patient.service';

export const assessmentRepo = {
	async findFirst<T extends Prisma.AssessmentAnswerFindFirstArgs>(
		ctx: PermissionedTRPCContext,
		findArgs: Prisma.Exact<T, Prisma.AssessmentAnswerFindFirstArgs>,
	) {
		const where = await dataAccessLevelToWhere(ctx);
		findArgs.where = merge(findArgs.where, where);
		return prisma.assessmentAnswer.findFirst(findArgs);
	},
	async findMany<T extends Prisma.AssessmentAnswerFindManyArgs>(
		ctx: PermissionedTRPCContext,
		findManyArgs: Prisma.Exact<T, Prisma.AssessmentAnswerFindManyArgs>,
	) {
		const where = await dataAccessLevelToWhere(ctx);
		findManyArgs.where = merge(findManyArgs.where, where);
		return prisma.assessmentAnswer.findMany(findManyArgs);
	},
	async upsert<T extends Prisma.AssessmentAnswerUpsertArgs>(
		ctx: PermissionedTRPCContext,
		upsertArgs: Prisma.Exact<T, Prisma.AssessmentAnswerUpsertArgs>,
	): Promise<AssessmentAnswer> {
		const {
			where: { patientId_assessmentNumber },
		} = upsertArgs;
		if (!patientId_assessmentNumber) {
			throw new Error('patientId_assessmentNumber is required');
		}
		await throwIfCannotEdit(patientId_assessmentNumber.patientId, ctx);
		const where = await dataAccessLevelToWhere(ctx);
		upsertArgs.where = merge(upsertArgs.where, where);
		try {
			const result = await prisma.assessmentAnswer.upsert(upsertArgs);
			return result;
		} catch (e) {
			if (e instanceof Prisma.PrismaClientKnownRequestError) {
				// P2022: Unique constraint failed
				// Prisma error codes: https://www.prisma.io/docs/reference/api-reference/error-reference#error-codes
				if (e.code === 'P2002') {
					return this.upsert(ctx, upsertArgs);
				}
			}
			throw e;
		}
	},
	async update<T extends Prisma.AssessmentAnswerUpdateArgs>(
		ctx: PermissionedTRPCContext,
		updateArgs: Prisma.Exact<T, Prisma.AssessmentAnswerUpdateArgs>,
	) {
		const { where } = updateArgs;
		if (!where?.patientId_assessmentNumber?.patientId) {
			throw new Error('patientId is required');
		}
		await throwIfCannotEdit(where.patientId_assessmentNumber.patientId, ctx);
		const whereCheck = await dataAccessLevelToWhere(ctx);
		updateArgs.where = merge(updateArgs.where, whereCheck);
		return prisma.assessmentAnswer.update(updateArgs);
	},
	async updateMany<T extends Prisma.AssessmentAnswerUpdateManyArgs>(
		ctx: PermissionedTRPCContext,
		updateArgs: Prisma.Exact<T, Prisma.AssessmentAnswerUpdateManyArgs>,
	) {
		const { where } = updateArgs;
		if (!where?.patientId) {
			throw new Error('patientId is required');
		}
		await throwIfCannotEdit(where.patientId as number, ctx);
		const whereCheck = await dataAccessLevelToWhere(ctx);
		updateArgs.where = merge(updateArgs.where, whereCheck);
		return prisma.assessmentAnswer.updateMany(updateArgs);
	},
};

async function dataAccessLevelToWhere(ctx: PermissionedTRPCContext): Promise<Prisma.AssessmentAnswerWhereInput> {
	const {
		activeOrganizationId: organizationId,
		dataAccessLevel,
		session: {
			user: { id },
		},
	} = ctx;
	switch (dataAccessLevel) {
		case DataAccessPermissions.MINE_WITH_QA:
			return {
				Patient: {
					status: {
						in: dataAccessLevelToStatuses(dataAccessLevel),
					},
					qaAssignedUserId: id,
				},
			};
		case DataAccessPermissions.MINE_WITH_DATAENTRY:
			return {
				Patient: {
					status: { in: dataAccessLevelToStatuses(dataAccessLevel) },
					dataEntryAssignedUserId: id,
				},
			};
		case DataAccessPermissions.MINE:
			return {
				Patient: {
					organizationId,
					SOCVisitCaseManagerId: id,
				},
			};
		case DataAccessPermissions.BRANCH:
			const user = await ctx.db.user.findUniqueOrThrow({ where: { id }, include: { Locations: true } });
			const locationIds = user.Locations.map((location) => location.id);
			return { Patient: { locationId: { in: locationIds }, organizationId } };
		case DataAccessPermissions.ORG_WITH_QA:
		case DataAccessPermissions.ORG_WITH_DATAENTRY:
			return {
				Patient: {
					organizationId,
					status: {
						in: dataAccessLevelToStatuses(dataAccessLevel),
					},
				},
			};
		case DataAccessPermissions.ORG:
			return { Patient: { organizationId } };
		case DataAccessPermissions.FULL_SYSTEM_WITH_QA:
			return {
				Patient: {
					status: {
						in: dataAccessLevelToStatuses(dataAccessLevel),
					},
				},
			};
		case DataAccessPermissions.FULL_SYSTEM_WITH_DATAENTRY:
			return { Patient: { status: { in: dataAccessLevelToStatuses(dataAccessLevel) } } };
		case DataAccessPermissions.FULL_SYSTEM:
			if (organizationId) {
				return { Patient: { organizationId } };
			}
			return {};
	}
}

async function throwIfCannotEdit(patientId: number, ctx: PermissionedTRPCContext) {
	const canEdit = await currentPatientStatusAllowsAssessmentUpdates(patientId, ctx);
	if (!canEdit) {
		throw new Error('Patient status does not allow for assessment updates');
	}
}

async function currentPatientStatusAllowsAssessmentUpdates(patientId: number, ctx: PermissionedTRPCContext) {
	const patient = await patientService.getPatientById(patientId, ctx, {});
	return statusAllowsAssessmentUpdates(patient.status);
}
