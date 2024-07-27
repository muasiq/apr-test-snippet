import { Prisma, UserRole } from '@prisma/client';
import { merge } from 'lodash';
import logger from '~/common/utils/logger';
import { DataAccessPermissions, allowedRolesToEdit } from '../../../../common/utils/permissions';
import { PermissionedTRPCContext } from '../../trpc';

export const userRepo = {
	async create<T extends Prisma.UserCreateArgs>(
		ctx: PermissionedTRPCContext,
		createArgs: Prisma.Exact<T, Prisma.UserCreateArgs>,
	) {
		if (createArgs.data.roles) {
			throw new Error('Roles cannot be set on user creation');
		}
		return ctx.db.user.create(createArgs);
	},
	async findMany<T extends Prisma.UserFindManyArgs>(
		ctx: PermissionedTRPCContext,
		findManyArgs: Prisma.Exact<T, Prisma.UserFindManyArgs>,
	) {
		const where = await dataAccessLevelToWhere(ctx);
		findManyArgs.where = merge(findManyArgs.where, where);
		return ctx.db.user.findMany(findManyArgs);
	},
	async findUniqueOrThrow<T extends Prisma.UserFindFirstOrThrowArgs>(
		ctx: PermissionedTRPCContext,
		findArgs: Prisma.Exact<T, Prisma.UserFindFirstOrThrowArgs>,
	) {
		const where = await dataAccessLevelToWhere(ctx);
		findArgs.where = merge(findArgs.where, where);
		return ctx.db.user.findFirstOrThrow(findArgs);
	},
	async update<T extends Prisma.UserUpdateArgs>(
		ctx: PermissionedTRPCContext,
		updateArgs: Prisma.Exact<T, Prisma.UserUpdateArgs>,
	) {
		const where = await dataAccessLevelToWhere(ctx);
		const roles = updateArgs.data?.roles as UserRole[] | undefined;
		if (roles?.length) {
			if (roles.some((r) => !allowedRolesToEdit(ctx.session.user.roles).includes(r))) {
				logger.error(
					`User ${ctx.session.user.id} does not have permission to set the roles ${roles.join(
						', ',
					)} they are trying to set`,
				);
				throw new Error('You do not have permission to set the roles you are trying to set');
			}
		}
		updateArgs.where = merge(updateArgs.where, where);
		return ctx.db.user.update(updateArgs);
	},
};

async function dataAccessLevelToWhere(ctx: PermissionedTRPCContext): Promise<Prisma.UserWhereInput> {
	const {
		activeOrganizationId: organizationId,
		dataAccessLevel,
		session: {
			user: { id },
		},
	} = ctx;
	switch (dataAccessLevel) {
		case DataAccessPermissions.MINE:
		case DataAccessPermissions.MINE_WITH_QA:
		case DataAccessPermissions.MINE_WITH_DATAENTRY:
			return { id, organizationId };
		case DataAccessPermissions.BRANCH:
			const user = await ctx.db.user.findUniqueOrThrow({ where: { id }, include: { Locations: true } });
			const locationIds = user.Locations.map((location) => location.id);
			return { Locations: { some: { id: { in: locationIds } } }, organizationId };
		case DataAccessPermissions.ORG:
		case DataAccessPermissions.ORG_WITH_QA:
		case DataAccessPermissions.ORG_WITH_DATAENTRY:
		case DataAccessPermissions.FULL_SYSTEM_WITH_DATAENTRY:
		case DataAccessPermissions.FULL_SYSTEM_WITH_QA:
			return { organizationId };
		case DataAccessPermissions.FULL_SYSTEM:
			return { organizationId };
	}
}
