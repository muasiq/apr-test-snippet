import { createTRPCRouter, permissionProtectedProcedure, publicProcedure } from '~/server/api/trpc';
import { UserActionPermissions } from '../../../../common/utils/permissions';
import * as userInputs from './user.inputs';
import * as userService from './user.service';

export const userRouter = createTRPCRouter({
	getAll: permissionProtectedProcedure(UserActionPermissions.SET_PERMISSIONS_FOR_USERS).query(({ ctx }) => {
		return userService.getAllUsers(ctx);
	}),
	getCaseManagerUsers: permissionProtectedProcedure(UserActionPermissions.LIST_CASE_MANAGERS).query(({ ctx }) => {
		return userService.getCaseManagerUsers(ctx);
	}),
	getQaUsers: permissionProtectedProcedure(UserActionPermissions.LIST_QA_USERS).query(({ ctx }) => {
		return userService.getQaUsers(ctx);
	}),
	getDataEntryUsers: permissionProtectedProcedure(UserActionPermissions.LIST_DATAENTRY_USERS).query(({ ctx }) => {
		return userService.getDataEntryUsers(ctx);
	}),
	getCurrentUser: permissionProtectedProcedure(UserActionPermissions.VIEW_OWN_PROFILE).query(({ ctx }) => {
		return userService.getCurrentUser(ctx);
	}),
	createUser: publicProcedure.input(userInputs.createUserInputSchema).mutation(({ ctx, input }) => {
		return userService.createUser(ctx, input);
	}),

	doesUserEmailExist: publicProcedure.input(userInputs.doesUserEmailExistInputSchema).mutation(({ ctx, input }) => {
		return userService.doesUserEmailExist(ctx, input);
	}),

	sendEmailVerification: publicProcedure
		.input(userInputs.sendEmailVerificationInputSchema)
		.mutation(({ ctx, input }) => {
			return userService.sendEmailVerification(ctx, input);
		}),

	sendResetPasswordEmail: publicProcedure
		.input(userInputs.sendResetPasswordEmailInputSchema)
		.mutation(({ ctx, input }) => {
			return userService.sendResetPasswordEmail(ctx, input);
		}),

	verifyNewDevice: publicProcedure.input(userInputs.verifyNewDeviceInputSchema).mutation(({ ctx, input }) => {
		return userService.verifyNewDevice(ctx, input);
	}),
	resetPassword: publicProcedure.input(userInputs.resetPasswordInputSchema).mutation(({ ctx, input }) => {
		return userService.resetPassword(ctx, input);
	}),

	changeUserRole: permissionProtectedProcedure(UserActionPermissions.SET_PERMISSIONS_FOR_USERS)
		.input(userInputs.changeUserRoleInputSchema)
		.mutation(({ ctx, input }) => {
			return userService.changeUserRole(ctx, input);
		}),
	changeUserLocation: permissionProtectedProcedure(UserActionPermissions.SET_PERMISSIONS_FOR_USERS)
		.input(userInputs.changeUserLocationInputSchema)
		.mutation(({ ctx, input }) => {
			return userService.changeUserLocation(ctx, input);
		}),
	updateUser: permissionProtectedProcedure(UserActionPermissions.VIEW_OWN_PROFILE)
		.input(userInputs.updateUserSchema)
		.mutation(({ ctx, input }) => {
			return userService.updateUser(ctx, input);
		}),
});
