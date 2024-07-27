import { createTRPCRouter, permissionProtectedProcedure } from '~/server/api/trpc';
import { UserActionPermissions } from '../../../../common/utils/permissions';
import * as configurationInputs from './configuration.inputs';
import { configurationService } from './configuration.service';

export const configurationRouter = createTRPCRouter({
	getConfigurationForPatient: permissionProtectedProcedure(UserActionPermissions.VIEW_PATIENTS)
		.input(configurationInputs.getConfigurationForPatient)
		.query(({ ctx, input }) => {
			return configurationService.getConfigurationForPatient(ctx, input);
		}),
	getCurrentConfigurationForOrg: permissionProtectedProcedure(UserActionPermissions.VIEW_PATIENTS).query(({ ctx }) =>
		configurationService.getCurrentConfigurationForOrg(ctx),
	),
});
