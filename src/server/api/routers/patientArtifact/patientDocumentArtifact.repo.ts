import { Prisma } from '@prisma/client';
import { merge } from 'lodash';
import { dataAccessLevelToStatuses, DataAccessPermissions } from '../../../../common/utils/permissions';
import { PermissionedTRPCContext } from '../../trpc';

export const patientDocumentArtifactRepo = {
	async update<T extends Prisma.PatientDocumentArtifactUpdateArgs>(
		ctx: PermissionedTRPCContext,
		updateArgs: Prisma.Exact<T, Prisma.PatientDocumentArtifactUpdateArgs>,
	) {
		const where = await dataAccessLevelToWhere(ctx);
		updateArgs.where = merge(updateArgs.where, where);
		return ctx.db.patientDocumentArtifact.update(updateArgs);
	},
};

async function dataAccessLevelToWhere(ctx: PermissionedTRPCContext): Promise<Prisma.PatientDocumentArtifactWhereInput> {
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
				PatientArtifact: {
					patient: {
						qaAssignedUserId: id,
						status: { in: dataAccessLevelToStatuses(dataAccessLevel) },
					},
				},
			};
		case DataAccessPermissions.MINE_WITH_DATAENTRY:
			return {
				PatientArtifact: {
					patient: {
						dataEntryAssignedUserId: id,
						status: { in: dataAccessLevelToStatuses(dataAccessLevel) },
					},
				},
			};
		case DataAccessPermissions.MINE:
			return { PatientArtifact: { patient: { SOCVisitCaseManagerId: id, organizationId } } };
		case DataAccessPermissions.BRANCH:
			const user = await ctx.db.user.findUniqueOrThrow({ where: { id }, include: { Locations: true } });
			const locationIds = user.Locations.map((location) => location.id);
			return { PatientArtifact: { patient: { locationId: { in: locationIds }, organizationId } } };
		case DataAccessPermissions.ORG_WITH_QA:
		case DataAccessPermissions.ORG_WITH_DATAENTRY:
			return {
				PatientArtifact: {
					patient: {
						organizationId,
						status: { in: dataAccessLevelToStatuses(dataAccessLevel) },
					},
				},
			};
		case DataAccessPermissions.ORG:
			return { PatientArtifact: { patient: { organizationId } } };
		case DataAccessPermissions.FULL_SYSTEM_WITH_QA:
			return {
				PatientArtifact: {
					patient: {
						status: { in: dataAccessLevelToStatuses(dataAccessLevel) },
					},
				},
			};
		case DataAccessPermissions.FULL_SYSTEM_WITH_DATAENTRY:
			return { PatientArtifact: { patient: { status: { in: dataAccessLevelToStatuses(dataAccessLevel) } } } };
		case DataAccessPermissions.FULL_SYSTEM:
			return {};
	}
}
