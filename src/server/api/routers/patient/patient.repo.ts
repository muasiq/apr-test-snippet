import { Prisma } from '@prisma/client';
import { merge } from 'lodash';
import { dataAccessLevelToStatuses, DataAccessPermissions } from '../../../../common/utils/permissions';
import { PermissionedTRPCContext } from '../../trpc';

export const patientRepo = {
	async create<T extends Prisma.PatientCreateArgs>(
		ctx: PermissionedTRPCContext,
		createArgs: Prisma.Exact<T, Prisma.PatientCreateArgs>,
	) {
		createArgs.data.organizationId = ctx.activeOrganizationId;
		if (ctx.dataAccessLevel === DataAccessPermissions.BRANCH) {
			if (!createArgs.data.locationId) {
				throw new Error('LocationId is required for branch level access');
			}
		}
		return ctx.db.patient.create(createArgs);
	},
	async update<T extends Prisma.PatientUpdateArgs>(
		ctx: PermissionedTRPCContext,
		updateArgs: Prisma.Exact<T, Prisma.PatientUpdateArgs>,
	) {
		const where = await dataAccessLevelToWhere(ctx);
		updateArgs.where = merge(updateArgs.where, where);
		return ctx.db.patient.update(updateArgs);
	},
	async delete(ctx: PermissionedTRPCContext, deleteArgs: Prisma.PatientDeleteArgs) {
		const where = await dataAccessLevelToWhere(ctx);
		deleteArgs.where = merge(deleteArgs.where, where);
		return ctx.db.patient.delete(deleteArgs);
	},
	async findMany<T extends Prisma.PatientFindManyArgs>(
		ctx: PermissionedTRPCContext,
		findManyArgs: Prisma.Exact<T, Prisma.PatientFindManyArgs>,
	) {
		const where = await dataAccessLevelToWhere(ctx);
		findManyArgs.where = merge(findManyArgs.where, where);
		if (findManyArgs.include?.SOCVisitCaseManager) {
			findManyArgs.include.SOCVisitCaseManager = {
				select: {
					id: true,
					name: true,
					email: true,
				},
			};
		}
		if (findManyArgs.include?.QaAssignedUser) {
			findManyArgs.include.QaAssignedUser = {
				select: {
					id: true,
					name: true,
					email: true,
				},
			};
		}
		return ctx.db.patient.findMany(findManyArgs);
	},
	async findUniqueOrThrow<T extends Prisma.PatientFindFirstOrThrowArgs>(
		ctx: PermissionedTRPCContext,
		findArgs: Prisma.Exact<T, Prisma.PatientFindFirstOrThrowArgs>,
	) {
		const where = await dataAccessLevelToWhere(ctx);
		findArgs.where = merge(findArgs.where, where);
		if (findArgs.include?.SOCVisitCaseManager) {
			findArgs.include.SOCVisitCaseManager = {
				select: {
					id: true,
					name: true,
					email: true,
				},
			};
		}
		if (findArgs.include?.QaAssignedUser) {
			findArgs.include.QaAssignedUser = {
				select: {
					id: true,
					name: true,
					email: true,
				},
			};
		}
		return ctx.db.patient.findFirstOrThrow(findArgs);
	},
	async count<T extends Prisma.PatientCountArgs>(
		ctx: PermissionedTRPCContext,
		countArgs: Prisma.Exact<T, Prisma.PatientCountArgs>,
	) {
		const where = await dataAccessLevelToWhere(ctx);
		countArgs.where = merge(countArgs.where, where);
		return ctx.db.patient.count(countArgs);
	},
};

async function dataAccessLevelToWhere(ctx: PermissionedTRPCContext): Promise<Prisma.PatientWhereInput> {
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
				status: { in: dataAccessLevelToStatuses(dataAccessLevel) },
				qaAssignedUserId: id,
			};
		case DataAccessPermissions.MINE_WITH_DATAENTRY:
			return {
				status: { in: dataAccessLevelToStatuses(dataAccessLevel) },
				dataEntryAssignedUserId: id,
			};
		case DataAccessPermissions.MINE:
			return { SOCVisitCaseManagerId: id, organizationId };
		case DataAccessPermissions.BRANCH:
			const user = await ctx.db.user.findUniqueOrThrow({ where: { id }, include: { Locations: true } });
			const locationIds = user.Locations.map((location) => location.id);
			return { locationId: { in: locationIds }, organizationId };
		case DataAccessPermissions.ORG_WITH_QA:
		case DataAccessPermissions.ORG_WITH_DATAENTRY:
			return {
				organizationId,
				status: { in: dataAccessLevelToStatuses(dataAccessLevel) },
			};
		case DataAccessPermissions.FULL_SYSTEM_WITH_QA:
			return {
				status: { in: dataAccessLevelToStatuses(dataAccessLevel) },
			};
		case DataAccessPermissions.FULL_SYSTEM_WITH_DATAENTRY:
			return { status: { in: dataAccessLevelToStatuses(dataAccessLevel) } };
		case DataAccessPermissions.ORG:
			return { organizationId };
		case DataAccessPermissions.FULL_SYSTEM:
			return { organizationId };
	}
}
