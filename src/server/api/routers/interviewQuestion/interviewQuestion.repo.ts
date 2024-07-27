import { InterviewQuestion, Prisma } from '@prisma/client';
import { merge } from 'lodash';
import { dataAccessLevelToStatuses, DataAccessPermissions } from '../../../../common/utils/permissions';
import { prisma } from '../../../prisma';
import { PermissionedTRPCContext } from '../../trpc';
import { throwIfCannotEdit } from './interviewQuestion.util';

export const interviewQuestionRepo = {
	async findFirst<T extends Prisma.InterviewQuestionFindFirstArgs>(
		ctx: PermissionedTRPCContext,
		findArgs: Prisma.Exact<T, Prisma.InterviewQuestionFindFirstArgs>,
	) {
		const where = await dataAccessLevelToWhere(ctx);
		findArgs.where = merge(findArgs.where, where);
		return prisma.interviewQuestion.findFirst(findArgs);
	},
	async findUnique<T extends Prisma.InterviewQuestionFindUniqueArgs>(
		ctx: PermissionedTRPCContext,
		findArgs: Prisma.Exact<T, Prisma.InterviewQuestionFindUniqueArgs>,
	) {
		const where = await dataAccessLevelToWhere(ctx);
		findArgs.where = merge(findArgs.where, where);
		return prisma.interviewQuestion.findUnique(findArgs);
	},
	async upsert<T extends Prisma.InterviewQuestionUpsertArgs>(
		ctx: PermissionedTRPCContext,
		upsertArgs: Prisma.Exact<T, Prisma.InterviewQuestionUpsertArgs>,
	): Promise<InterviewQuestion> {
		const patientId = upsertArgs.where.patientId_interviewQuestionShortLabel?.patientId;
		if (!patientId) {
			throw new Error('Patient ID is required');
		}
		await throwIfCannotEdit(patientId, ctx);
		const where = await dataAccessLevelToWhere(ctx);
		upsertArgs.where = merge(upsertArgs.where, where);
		try {
			const result = await prisma.interviewQuestion.upsert(upsertArgs);
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
	async update<T extends Prisma.InterviewQuestionUpdateArgs>(
		ctx: PermissionedTRPCContext,
		updateArgs: Prisma.Exact<T, Prisma.InterviewQuestionUpdateArgs>,
	) {
		const patientId = updateArgs.where.patientId_interviewQuestionShortLabel?.patientId;
		if (!patientId) {
			throw new Error('Patient ID is required');
		}
		await throwIfCannotEdit(patientId, ctx);
		const where = await dataAccessLevelToWhere(ctx);
		updateArgs.where = merge(updateArgs.where, where);
		return prisma.interviewQuestion.update(updateArgs);
	},
};

async function dataAccessLevelToWhere(ctx: PermissionedTRPCContext): Promise<Prisma.InterviewQuestionWhereInput> {
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
					status: { in: dataAccessLevelToStatuses(dataAccessLevel) },
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
					status: { in: dataAccessLevelToStatuses(dataAccessLevel) },
				},
			};
		case DataAccessPermissions.ORG:
			return { Patient: { organizationId } };
		case DataAccessPermissions.FULL_SYSTEM_WITH_QA:
			return {
				Patient: {
					status: { in: dataAccessLevelToStatuses(dataAccessLevel) },
				},
			};
		case DataAccessPermissions.FULL_SYSTEM_WITH_DATAENTRY:
			return { Patient: { status: { in: dataAccessLevelToStatuses(dataAccessLevel) } } };
		case DataAccessPermissions.FULL_SYSTEM:
			return {};
	}
}
