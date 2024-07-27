import { Prisma } from '@prisma/client';
import { merge } from 'lodash';
import { dataAccessLevelToStatuses, DataAccessPermissions } from '../../../../common/utils/permissions';
import { PermissionedTRPCContext } from '../../trpc';
import { throwIfCannotEdit } from './interviewQuestion.util';
import { nurseInterviewThemeSummariesRepo } from './nurseInterviewThemeSummaries.repo';

export const nurseInterviewQuestionItemRepo = {
	async create<T extends Prisma.NurseInterviewQuestionItemCreateArgs>(
		patientId: number,
		ctx: PermissionedTRPCContext,
		createArgs: Prisma.Exact<T, Prisma.NurseInterviewQuestionItemCreateArgs>,
	) {
		await throwIfCannotEdit(patientId, ctx);
		const { NurseInterviewThemeSummaryId } = createArgs.data;
		if (!NurseInterviewThemeSummaryId) {
			throw new Error('NurseInterviewThemeSummaryId is required');
		}
		const validThemeSummary = await nurseInterviewThemeSummariesRepo.findUnique(ctx, {
			where: { id: NurseInterviewThemeSummaryId },
		});
		if (!validThemeSummary) {
			throw new Error('NurseInterviewThemeSummaryId is invalid');
		}
		return ctx.db.nurseInterviewQuestionItem.create(createArgs);
	},
	async findUnique<T extends Prisma.NurseInterviewQuestionItemFindUniqueArgs>(
		ctx: PermissionedTRPCContext,
		findArgs: Prisma.Exact<T, Prisma.NurseInterviewQuestionItemFindUniqueArgs>,
	) {
		const where = await dataAccessLevelToWhere(ctx);
		findArgs.where = merge(findArgs.where, where);
		return ctx.db.nurseInterviewQuestionItem.findUnique(findArgs);
	},
	async findMany<T extends Prisma.NurseInterviewQuestionItemFindManyArgs>(
		ctx: PermissionedTRPCContext,
		findArgs: Prisma.Exact<T, Prisma.NurseInterviewQuestionItemFindManyArgs>,
	) {
		const where = await dataAccessLevelToWhere(ctx);
		findArgs.where = merge(findArgs.where, where);
		return ctx.db.nurseInterviewQuestionItem.findMany(findArgs);
	},
	async delete<T extends Prisma.NurseInterviewQuestionItemDeleteArgs>(
		patientId: number,
		ctx: PermissionedTRPCContext,
		deleteArgs: Prisma.Exact<T, Prisma.NurseInterviewQuestionItemDeleteArgs>,
	) {
		await throwIfCannotEdit(patientId, ctx);
		const where = await dataAccessLevelToWhere(ctx);
		deleteArgs.where = merge(deleteArgs.where, where);
		return ctx.db.nurseInterviewQuestionItem.delete(deleteArgs);
	},
	async update<T extends Prisma.NurseInterviewQuestionItemUpdateArgs>(
		patientId: number,
		ctx: PermissionedTRPCContext,
		updateArgs: Prisma.Exact<T, Prisma.NurseInterviewQuestionItemUpdateArgs>,
	) {
		await throwIfCannotEdit(patientId, ctx);
		const where = await dataAccessLevelToWhere(ctx);
		updateArgs.where = merge(updateArgs.where, where);
		return ctx.db.nurseInterviewQuestionItem.update(updateArgs);
	},
};

async function dataAccessLevelToWhere(
	ctx: PermissionedTRPCContext,
): Promise<Prisma.NurseInterviewQuestionItemWhereInput> {
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
				NurseInterviewThemeSummaries: {
					NurseInterview: {
						Patient: {
							status: {
								in: dataAccessLevelToStatuses(dataAccessLevel),
							},
							qaAssignedUserId: id,
						},
					},
				},
			};
		case DataAccessPermissions.MINE_WITH_DATAENTRY:
			return {
				NurseInterviewThemeSummaries: {
					NurseInterview: {
						Patient: {
							status: {
								in: dataAccessLevelToStatuses(dataAccessLevel),
							},
							qaAssignedUserId: id,
						},
					},
				},
			};
		case DataAccessPermissions.MINE:
			return {
				NurseInterviewThemeSummaries: {
					NurseInterview: {
						Patient: {
							organizationId,
							SOCVisitCaseManagerId: id,
						},
					},
				},
			};
		case DataAccessPermissions.BRANCH:
			const user = await ctx.db.user.findUniqueOrThrow({ where: { id }, include: { Locations: true } });
			const locationIds = user.Locations.map((location) => location.id);
			return {
				NurseInterviewThemeSummaries: {
					NurseInterview: { Patient: { locationId: { in: locationIds }, organizationId } },
				},
			};
		case DataAccessPermissions.ORG_WITH_QA:
		case DataAccessPermissions.ORG_WITH_DATAENTRY:
			return {
				NurseInterviewThemeSummaries: {
					NurseInterview: {
						Patient: {
							organizationId,
							status: {
								in: dataAccessLevelToStatuses(dataAccessLevel),
							},
						},
					},
				},
			};
		case DataAccessPermissions.ORG:
			return { NurseInterviewThemeSummaries: { NurseInterview: { Patient: { organizationId } } } };
		case DataAccessPermissions.FULL_SYSTEM_WITH_QA:
			return {
				NurseInterviewThemeSummaries: {
					NurseInterview: {
						Patient: {
							status: {
								in: dataAccessLevelToStatuses(dataAccessLevel),
							},
						},
					},
				},
			};
		case DataAccessPermissions.FULL_SYSTEM_WITH_DATAENTRY:
			return {
				NurseInterviewThemeSummaries: {
					NurseInterview: {
						Patient: {
							status: {
								in: dataAccessLevelToStatuses(dataAccessLevel),
							},
						},
					},
				},
			};
		case DataAccessPermissions.FULL_SYSTEM:
			return {};
	}
}
