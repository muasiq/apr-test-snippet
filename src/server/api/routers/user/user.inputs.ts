import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { deviceInfoSchema } from '~/common/utils/deviceInfo';

export const passwordSchema = z
	.string()
	.min(8, { message: 'Password must be at least 8 characters long' })
	.regex(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/, {
		message:
			'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character',
	});

export const getByIdInputSchema = z.object({
	id: z.string().min(1),
});
export type GetByIdInput = z.infer<typeof getByIdInputSchema>;

export const verifyEmailInputSchema = z.object({
	code: z.string().min(1),
	email: z.string().email().toLowerCase().trim(),
});
export type VerifyEmailInput = z.infer<typeof verifyEmailInputSchema>;

export const doesUserEmailExistInputSchema = z.object({
	email: z.string().email().toLowerCase().trim(),
});
export type DoesUserEmailExistInput = z.infer<typeof doesUserEmailExistInputSchema>;

export const verifyNewDeviceInputSchema = z.object({
	device: deviceInfoSchema,
	email: z.string().email().toLowerCase().trim(),
	token: z.string().min(1),
});

export type VerifyNewDeviceInput = z.infer<typeof verifyNewDeviceInputSchema>;

export enum VerificationMethod {
	VERIFY_EMAIL = 'verifyEmail',
	VERIFY_DEVICE = 'verifyDevice',
}
export const sendEmailVerificationInputSchema = z.object({
	email: z.string().email().toLowerCase().trim(),
	verificationMethod: z.nativeEnum(VerificationMethod),
});
export type SendEmailVerificationInput = z.infer<typeof sendEmailVerificationInputSchema>;

export const createUserInputSchema = z.object({
	email: z.string().email().toLowerCase().trim(),
	password: passwordSchema,
	token: z.string().min(1),
	firstName: z.string().min(1, {
		message: 'First name is required',
	}),
	lastName: z.string().min(1, {
		message: 'Last name is required',
	}),
	device: deviceInfoSchema.nullish(),
});
export type CreateUserInput = z.infer<typeof createUserInputSchema>;

export const sendResetPasswordEmailInputSchema = z.object({
	email: z.string().email().toLowerCase().trim(),
});
export type SendResetPasswordEmailInput = z.infer<typeof sendResetPasswordEmailInputSchema>;

export const resetPasswordInputSchema = z.object({
	email: z.string().email().toLowerCase().trim(),
	token: z.string().min(1),
	newPassword: passwordSchema,
	confirmNewPassword: passwordSchema,
});
export type ResetPasswordInput = z.infer<typeof resetPasswordInputSchema>;

export const changeUserRoleInputSchema = z.object({
	changes: z.array(
		z.object({
			userId: z.string().min(1),
			roles: z.array(z.nativeEnum(UserRole)),
		}),
	),
});
export type ChangeUserRoleInput = z.infer<typeof changeUserRoleInputSchema>;

export const changeUserLocationInputSchema = z.object({
	changes: z.array(
		z.object({
			userId: z.string().min(1),
			branches: z.array(z.number().int()),
		}),
	),
});
export type ChangeUserLocationInput = z.infer<typeof changeUserLocationInputSchema>;

export const updateUserSchema = z.object({
	name: z.string().min(4),
	pointcareId: z.string().min(1).nullish(),
});
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
