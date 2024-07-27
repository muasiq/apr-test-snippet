import { Prisma } from '@prisma/client';
import { merge } from 'lodash';
import { dataAccessLevelToStatuses, DataAccessPermissions } from '../../../../common/utils/permissions';
import { prisma } from '../../../prisma';
import { PermissionedTRPCContext } from '../../trpc';
import { throwIfCannotEdit } from './interviewQuestion.util';

export const nurseInterviewThemeSummariesRepo = {
	async create<T extends Prisma.NurseInterviewThemeSummariesCreateArgs>(
		patientId: number,
		ctx: PermissionedTRPCContext,
		createArgs: Prisma.Exact<T, Prisma.NurseInterviewThemeSummariesCreateArgs>,
	) {
		if (!patientId) {
			throw new Error('Patient ID is required');
		}
		await throwIfCannotEdit(patientId, ctx);
		return prisma.nurseInterviewThemeSummaries.create(createArgs);
	},
	async findUnique<T extends Prisma.NurseInterviewThemeSummariesFindUniqueArgs>(
		ctx: PermissionedTRPCContext,
		findArgs: Prisma.Exact<T, Prisma.NurseInterviewThemeSummariesFindUniqueArgs>,
	) {
		const where = await dataAccessLevelToWhere(ctx);
		findArgs.where = merge(findArgs.where, where);
		return prisma.nurseInterviewThemeSummaries.findUnique(findArgs);
	},
	async upsert<T extends Prisma.NurseInterviewThemeSummariesUpsertArgs>(
		patientId: number,
		ctx: PermissionedTRPCContext,
		upsertArgs: Prisma.Exact<T, Prisma.NurseInterviewThemeSummariesUpsertArgs>,
	) {
		if (!patientId) {
			throw new Error('Patient ID is required');
		}
		await throwIfCannotEdit(patientId, ctx);
		const where = await dataAccessLevelToWhere(ctx);
		upsertArgs.where = merge(upsertArgs.where, where);
		try {
			const result = await prisma.nurseInterviewThemeSummaries.upsert(upsertArgs);
			return result;
		} catch (e) {
			if (e instanceof Prisma.PrismaClientKnownRequestError) {
				// P2022: Unique constraint failed
				// Prisma error codes: https://www.prisma.io/docs/reference/api-reference/error-reference#error-codes
				if (e.code === 'P2002') {
					return prisma.nurseInterviewThemeSummaries.upsert(upsertArgs);
				}
			}
			throw e;
		}
	},
	async findMany<T extends Prisma.NurseInterviewThemeSummariesFindManyArgs>(
		ctx: PermissionedTRPCContext,
		findArgs: Prisma.Exact<T, Prisma.NurseInterviewThemeSummariesFindManyArgs>,
	) {
		const where = await dataAccessLevelToWhere(ctx);
		findArgs.where = merge(findArgs.where, where);
		return prisma.nurseInterviewThemeSummaries.findMany(findArgs);
	},
};

async function dataAccessLevelToWhere(
	ctx: PermissionedTRPCContext,
): Promise<Prisma.NurseInterviewThemeSummariesWhereInput> {
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
				NurseInterview: {
					Patient: {
						status: { in: dataAccessLevelToStatuses(dataAccessLevel) },
						qaAssignedUserId: id,
					},
				},
			};
		case DataAccessPermissions.MINE_WITH_DATAENTRY:
			return {
				NurseInterview: {
					Patient: {
						status: { in: dataAccessLevelToStatuses(dataAccessLevel) },
						dataEntryAssignedUserId: id,
					},
				},
			};
		case DataAccessPermissions.MINE:
			return {
				NurseInterview: {
					Patient: {
						organizationId,
						SOCVisitCaseManagerId: id,
					},
				},
			};
		case DataAccessPermissions.BRANCH:
			const user = await ctx.db.user.findUniqueOrThrow({ where: { id }, include: { Locations: true } });
			const locationIds = user.Locations.map((location) => location.id);
			return { NurseInterview: { Patient: { locationId: { in: locationIds }, organizationId } } };
		case DataAccessPermissions.ORG_WITH_QA:
		case DataAccessPermissions.ORG_WITH_DATAENTRY:
			return {
				NurseInterview: {
					Patient: {
						organizationId,
						status: { in: dataAccessLevelToStatuses(dataAccessLevel) },
					},
				},
			};
		case DataAccessPermissions.ORG:
			return { NurseInterview: { Patient: { organizationId } } };
		case DataAccessPermissions.FULL_SYSTEM_WITH_QA:
			return {
				NurseInterview: {
					Patient: {
						status: { in: dataAccessLevelToStatuses(dataAccessLevel) },
					},
				},
			};
		case DataAccessPermissions.FULL_SYSTEM_WITH_DATAENTRY:
			return { NurseInterview: { Patient: { status: { in: dataAccessLevelToStatuses(dataAccessLevel) } } } };
		case DataAccessPermissions.FULL_SYSTEM:
			return {};
	}
}
