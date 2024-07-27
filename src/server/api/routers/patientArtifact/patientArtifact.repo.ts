import { Prisma } from '@prisma/client';
import { merge } from 'lodash';
import { dataAccessLevelToStatuses, DataAccessPermissions } from '../../../../common/utils/permissions';
import { PermissionedTRPCContext } from '../../trpc';
import * as patientService from '../patient/patient.service';

export const patientArtifactRepo = {
	async findFirstOrThrow<T extends Prisma.PatientArtifactFindFirstOrThrowArgs>(
		ctx: PermissionedTRPCContext,
		findArgs: Prisma.Exact<T, Prisma.PatientArtifactFindFirstOrThrowArgs>,
	) {
		const where = await dataAccessLevelToWhere(ctx);
		findArgs.where = merge(findArgs.where, where);
		return ctx.db.patientArtifact.findFirstOrThrow(findArgs);
	},
	async findMany<T extends Prisma.PatientArtifactFindManyArgs>(
		ctx: PermissionedTRPCContext,
		findArgs: Prisma.Exact<T, Prisma.PatientArtifactFindManyArgs>,
	) {
		const where = await dataAccessLevelToWhere(ctx);
		findArgs.where = merge(findArgs.where, where);
		return ctx.db.patientArtifact.findMany(findArgs);
	},
	async create<T extends Prisma.PatientArtifactCreateArgs>(
		ctx: PermissionedTRPCContext,
		createArgs: Prisma.Exact<T, Prisma.PatientArtifactCreateArgs>,
	) {
		const patientId = createArgs.data.patientId;
		if (!patientId) throw new Error('Patient ID is required');
		await patientService.getPatientById(patientId, ctx, {});
		return ctx.db.patientArtifact.create(createArgs);
	},
	async update<T extends Prisma.PatientArtifactUpdateArgs>(
		ctx: PermissionedTRPCContext,
		updateArgs: Prisma.Exact<T, Prisma.PatientArtifactUpdateArgs>,
	) {
		const where = await dataAccessLevelToWhere(ctx);
		updateArgs.where = merge(updateArgs.where, where);
		return ctx.db.patientArtifact.update(updateArgs);
	},
	async delete<T extends Prisma.PatientArtifactDeleteArgs>(
		ctx: PermissionedTRPCContext,
		deleteArgs: Prisma.Exact<T, Prisma.PatientArtifactDeleteArgs>,
	) {
		const where = await dataAccessLevelToWhere(ctx, true);
		deleteArgs.where = merge(deleteArgs.where, where);
		return ctx.db.patientArtifact.delete(deleteArgs);
	},
};

async function dataAccessLevelToWhere(
	ctx: PermissionedTRPCContext,
	deleting = false,
): Promise<Prisma.PatientArtifactWhereInput> {
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
				...(deleting ? { userThatUploadedId: id } : {}),
				patient: {
					qaAssignedUserId: id,
					status: { in: dataAccessLevelToStatuses(dataAccessLevel) },
				},
			};
		case DataAccessPermissions.MINE_WITH_DATAENTRY:
			return {
				patient: {
					dataEntryAssignedUserId: id,
					status: { in: dataAccessLevelToStatuses(dataAccessLevel) },
				},
			};
		case DataAccessPermissions.MINE:
			return {
				...(deleting ? { userThatUploadedId: id } : {}),
				patient: { SOCVisitCaseManagerId: id, organizationId },
			};
		case DataAccessPermissions.BRANCH:
			const user = await ctx.db.user.findUniqueOrThrow({ where: { id }, include: { Locations: true } });
			const locationIds = user.Locations.map((location) => location.id);
			return { patient: { locationId: { in: locationIds }, organizationId } };
		case DataAccessPermissions.ORG_WITH_QA:
		case DataAccessPermissions.ORG_WITH_DATAENTRY:
			return {
				...(deleting ? { userThatUploadedId: id } : {}),
				patient: {
					organizationId,
					status: { in: dataAccessLevelToStatuses(dataAccessLevel) },
				},
			};
		case DataAccessPermissions.FULL_SYSTEM_WITH_QA:
			return {
				patient: {
					status: { in: dataAccessLevelToStatuses(dataAccessLevel) },
				},
			};
		case DataAccessPermissions.FULL_SYSTEM_WITH_DATAENTRY:
			return { patient: { status: { in: dataAccessLevelToStatuses(dataAccessLevel) } } };
		case DataAccessPermissions.ORG:
			return { patient: { organizationId } };
		case DataAccessPermissions.FULL_SYSTEM:
			return {};
	}
}
