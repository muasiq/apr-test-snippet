import { createTRPCRouter, permissionProtectedProcedure } from '~/server/api/trpc';
import { UserActionPermissions } from '../../../../common/utils/permissions';
import * as medicationInputs from './medication.inputs';
import * as medicationService from './medication.service';

export const medicationRouter = createTRPCRouter({
	search: permissionProtectedProcedure(UserActionPermissions.SEARCH_MEDICATIONS)
		.input(medicationInputs.searchMedicationSchema)
		.query(({ input }) => {
			return medicationService.search(input);
		}),
	getDispensableDrug: permissionProtectedProcedure(UserActionPermissions.GET_DISPENSABLE_DRUG)
		.input(medicationInputs.getDispensableDrug)
		.query(({ input }) => {
			return medicationService.getDispensableDrug(input);
		}),
});
