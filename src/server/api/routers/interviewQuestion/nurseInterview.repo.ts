import { Prisma } from '@prisma/client';
import { merge } from 'lodash';
import { dataAccessLevelToStatuses, DataAccessPermissions } from '../../../../common/utils/permissions';
import { PermissionedTRPCContext } from '../../trpc';
import { throwIfCannotEdit } from './interviewQuestion.util';

export const nurseInterviewRepo = {
	async findUnique<T extends Prisma.NurseInterviewFindUniqueArgs>(
		ctx: PermissionedTRPCContext,
		findArgs: Prisma.Exact<T, Prisma.NurseInterviewFindUniqueArgs>,
	) {
		const where = await dataAccessLevelToWhere(ctx);
		findArgs.where = merge(findArgs.where, where);
		return ctx.db.nurseInterview.findUnique(findArgs);
	},
	async upsert<T extends Prisma.NurseInterviewUpsertArgs>(
		ctx: PermissionedTRPCContext,
		upsertArgs: Prisma.Exact<T, Prisma.NurseInterviewUpsertArgs>,
		options?: { allowNonAssignedUserToUpdate: boolean },
	) {
		const patientId = upsertArgs.where.patientId;
		if (!patientId) {
			throw new Error('Patient ID is required');
		}
		await throwIfCannotEdit(patientId, ctx, options?.allowNonAssignedUserToUpdate);
		const where = await dataAccessLevelToWhere(ctx);
		upsertArgs.where = merge(upsertArgs.where, where);
		return ctx.db.nurseInterview.upsert(upsertArgs);
	},
};

async function dataAccessLevelToWhere(ctx: PermissionedTRPCContext): Promise<Prisma.NurseInterviewWhereInput> {
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
					qaAssignedUserId: id,
					status: { in: dataAccessLevelToStatuses(dataAccessLevel) },
				},
			};
		case DataAccessPermissions.MINE_WITH_DATAENTRY:
			return {
				Patient: {
					dataEntryAssignedUserId: id,
					status: { in: dataAccessLevelToStatuses(dataAccessLevel) },
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
		case DataAccessPermissions.FULL_SYSTEM_WITH_DATAENTRY:
			return { Patient: { status: { in: dataAccessLevelToStatuses(dataAccessLevel) } } };
		case DataAccessPermissions.FULL_SYSTEM_WITH_QA:
			return {
				Patient: {
					status: { in: dataAccessLevelToStatuses(dataAccessLevel) },
				},
			};
		case DataAccessPermissions.FULL_SYSTEM:
			return {};
	}
}
