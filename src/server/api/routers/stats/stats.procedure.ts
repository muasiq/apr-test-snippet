import { createTRPCRouter, permissionProtectedProcedure } from '~/server/api/trpc';
import { UserActionPermissions } from '../../../../common/utils/permissions';
import * as statsInputs from './stats.inputs';
import * as statsService from './stats.service';

export const statsRouter = createTRPCRouter({
	getPatientStats: permissionProtectedProcedure(UserActionPermissions.VIEW_STATS_PAGE)
		.input(statsInputs.patientStatsSchema)
		.query(({ input, ctx }) => {
			return statsService.getPatientStats(input, ctx);
		}),
});
