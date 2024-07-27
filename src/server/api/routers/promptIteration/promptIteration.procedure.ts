import { createTRPCRouter, permissionProtectedProcedure } from '~/server/api/trpc';
import { UserActionPermissions } from '../../../../common/utils/permissions';
import * as promptIterationInputs from './promptIteration.inputs';
import * as promptIterationService from './promptIteration.service';

export const promptIterationRouter = createTRPCRouter({
	runBackTestForSuggestions: permissionProtectedProcedure(UserActionPermissions.VIEW_PROMPT_ITERATION_SCREEN)
		.input(promptIterationInputs.runBackTestForSuggestionsSchema)
		.mutation(({ input, ctx }) => {
			return promptIterationService.runBackTestForSuggestions(input, ctx);
		}),
});
