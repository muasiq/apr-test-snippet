import { UserRole } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import logger from '~/common/utils/logger';
import { env } from '~/env.mjs';
import { exclude } from '../../../../common/utils/exclude';
import { UserActionPermissions, hasActionPermission } from '../../../../common/utils/permissions';
import * as sendgridService from '../../common/email/sendgrid.service';
import { PermissionedTRPCContext, TRPCContext, type ProtectedTRPCContext } from '../../trpc';
import * as userInputs from './user.inputs';
import { userRepo } from './user.repo';

export const getAllUsers = async (ctx: PermissionedTRPCContext) => {
	const users = await userRepo.findMany(ctx, {
		include: {
			Locations: {
				select: {
					id: true,
					name: true,
					organizationId: true,
				},
			},
			Organization: {
				select: {
					name: true,
				},
			},
		},
	});

	return users.map((user) => exclude(user, ['password']));
};

export const getCaseManagerUsers = async (ctx: PermissionedTRPCContext) => {
	const users = await userRepo.findMany(ctx, { include: { Locations: true } });
	const filtered = users.filter((user) =>
		hasActionPermission(UserActionPermissions.APPEARS_IN_CASE_MANAGER_LIST, user.roles),
	);

	return filtered.map((user) => exclude(user, ['password']));
};

export const getQaUsers = async (ctx: PermissionedTRPCContext) => {
	const users = await userRepo.findMany(ctx, {
		where: {
			roles: { hasSome: [UserRole.OrgQA, UserRole.QA, UserRole.QaManager] },
		},
		select: {
			name: true,
			id: true,
			organizationId: true,
			roles: true,
		},
	});

	return users;
};
export const getDataEntryUsers = async (ctx: PermissionedTRPCContext) => {
	const users = await userRepo.findMany(ctx, {
		where: {
			roles: { has: UserRole.DataEntry },
		},
		select: {
			name: true,
			id: true,
			organizationId: true,
			roles: true,
		},
	});

	return users;
};

export const getCurrentUser = async (ctx: PermissionedTRPCContext) => {
	const user = await ctx.db.user.findUniqueOrThrow({
		where: {
			id: ctx.session.user.id,
		},
		include: {
			Organization: { select: { name: true, configurationType: true } },
			Locations: { select: { name: true } },
		},
	});
	return exclude(user, ['password']);
};

export const doesUserEmailExist = async (ctx: TRPCContext, { email }: userInputs.DoesUserEmailExistInput) => {
	const user = await ctx.db.user.findUnique({
		where: {
			email,
		},
	});
	return !!user;
};

export const sendEmailVerification = async (
	ctx: TRPCContext,
	{ email, verificationMethod }: userInputs.SendEmailVerificationInput,
) => {
	const organization = await getUserOrganizationByEmail(ctx, email);

	if (!organization) {
		logger.info(
			`Not sending verification email to ${email} because no valid organization was found for the email domain`,
		);
		throw new TRPCError({
			code: 'NOT_FOUND',
			message: `Not sending verification email to ${email} because no valid organization was found for the email domain`,
		});
	}

	if (verificationMethod === userInputs.VerificationMethod.VERIFY_DEVICE) {
		const { expires, token } = generateOTPCode();
		await upsertVerificationToken(ctx, email, token, expires);
		await sendgridService.sendDeviceVerificationEmail(email, token);
		return;
	}
	if (verificationMethod === userInputs.VerificationMethod.VERIFY_EMAIL) {
		const { expires, token } = generateRandomVerificationToken();
		await upsertVerificationToken(ctx, email, token, expires);
		await sendgridService.sendAccountVerificationEmail(email, token);
		return;
	}

	throw new TRPCError({
		code: 'INTERNAL_SERVER_ERROR',
		message: `Invalid verification method`,
	});
};

export const getUserByEmail = async (ctx: TRPCContext, email: string) => {
	return await ctx.db.user.findUnique({
		where: {
			email,
		},
	});
};

export const createUser = async (
	ctx: TRPCContext,
	{ email, password, token, firstName, lastName, device }: userInputs.CreateUserInput,
) => {
	const user = await getUserByEmail(ctx, email);

	if (user) {
		throw new TRPCError({
			code: 'CONFLICT',
			message: `Account already exists for ${email}, please sign in instead`,
		});
	}

	const organization = await getUserOrganizationByEmail(ctx, email);

	if (!organization) {
		throw new TRPCError({
			code: 'NOT_FOUND',
			message: `App not creating user for ${email} because no valid organization was found for the email domain`,
		});
	}

	await validateEmailTokenAndResendEmailIfExpired({
		ctx,
		email,
		token,
		resendEmailFunction: sendgridService.sendAccountVerificationEmail,
	});

	const passwordHash = await bcrypt.hash(password, 10);

	const { devices } = await ctx.db.user.create({
		data: {
			email,
			password: passwordHash,
			organizationId: organization.id,
			emailVerified: new Date(),
			name: `${firstName} ${lastName}`,
			devices: device ? { create: { metadata: device } } : undefined,
		},
		select: {
			devices: {
				select: { id: true },
				orderBy: { createdAt: 'desc' },
			},
		},
	});

	return { deviceId: devices[0]?.id };
};

export const verifyNewDevice = async (ctx: TRPCContext, input: userInputs.VerifyNewDeviceInput) => {
	await validateEmailToken({ ctx, email: input.email, token: input.token });

	const newDevice = await ctx.db.device.create({
		data: {
			User: {
				connect: {
					email: input.email,
				},
			},
			metadata: input.device,
		},
		select: {
			id: true,
			metadata: true,
		},
	});

	return newDevice;
};

const getUserOrganizationByEmail = async (ctx: TRPCContext, email: string) => {
	const emailDomain = email.split('@')[1];

	return await ctx.db.organization.findFirst({
		where: { emailDomains: { has: emailDomain } },
	});
};

export const sendResetPasswordEmail = async (ctx: TRPCContext, { email }: userInputs.SendResetPasswordEmailInput) => {
	const user = await getUserByEmail(ctx, email);

	if (!user) {
		throw new TRPCError({
			code: 'NOT_FOUND',
			message: `No user found for ${email} to reset password`,
		});
	}

	const { expires, token } = generateRandomVerificationToken();

	await upsertVerificationToken(ctx, email, token, expires);

	await sendgridService.sendResetPasswordEmail(email, token);
};

const throwPasswordMismatchError = () => {
	throw new TRPCError({
		code: 'CONFLICT',
		message: 'Passwords do not match',
	});
};

export const resetPassword = async (
	ctx: TRPCContext,
	{ email, token, newPassword, confirmNewPassword }: userInputs.ResetPasswordInput,
) => {
	const user = await getUserByEmail(ctx, email);

	if (!user) {
		throw new TRPCError({
			code: 'NOT_FOUND',
			message: `No user found for ${email} to reset password`,
		});
	}

	await validateEmailTokenAndResendEmailIfExpired({
		ctx,
		email,
		token,
		resendEmailFunction: sendgridService.sendResetPasswordEmail,
	});

	if (newPassword !== confirmNewPassword) throwPasswordMismatchError();

	const passwordHash = await bcrypt.hash(newPassword, 10);

	await ctx.db.user.update({
		where: { email },
		data: { password: passwordHash },
	});

	await deleteVerificationTokenByIdentifier(ctx, email);

	return true;
};

export const changeUserRole = async (ctx: PermissionedTRPCContext, input: userInputs.ChangeUserRoleInput) => {
	const activeOrganizationId = ctx.activeOrganizationId;
	await Promise.all(
		input.changes.map(async ({ userId, roles }) => {
			const user = await userRepo.findUniqueOrThrow(ctx, {
				where: { id: userId, organizationId: activeOrganizationId },
			});

			if (!user) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: `No user found for ${userId} to change role. Make sure the user exists within your organization`,
				});
			}

			return await userRepo.update(ctx, {
				where: { id: userId },
				data: { roles },
			});
		}),
	);

	return input.changes.map(({ userId, roles }) => {
		return { userId, success: true, newRoles: roles };
	});
};

export const changeUserLocation = async (ctx: PermissionedTRPCContext, input: userInputs.ChangeUserLocationInput) => {
	const activeOrganizationId = ctx.activeOrganizationId;
	await Promise.all(
		input.changes.map(async ({ userId, branches }) => {
			const user = await userRepo.findUniqueOrThrow(ctx, {
				where: { id: userId, organizationId: activeOrganizationId },
			});
			const acceptedRoles = [UserRole.Nurse, UserRole.BranchAdmin, UserRole.BranchOffice] as UserRole[];
			const isValidRole = user.roles.map((role) => acceptedRoles.includes(role));

			if (!isValidRole) return;

			return await userRepo.update(ctx, {
				where: { id: userId },
				data: {
					Locations: {
						set: branches.map((branch) => ({ id: branch, organizationId: user.organizationId })),
					},
				},
			});
		}),
	);
};

export const updateUser = async (ctx: ProtectedTRPCContext, input: userInputs.UpdateUserInput) => {
	return ctx.db.user.update({
		where: { id: ctx.session.user.id },
		data: {
			name: input.name,
			pointcareId: input.pointcareId,
		},
	});
};

const generateRandomVerificationToken = (): { token: string; expires: Date } => {
	const verificationToken = crypto.randomUUID();

	const verificationTokenExpiry = new Date();
	verificationTokenExpiry.setMinutes(verificationTokenExpiry.getMinutes() + 30);

	return { token: verificationToken, expires: verificationTokenExpiry };
};

const generateOTPCode = (): { token: string; expires: Date } => {
	const tokenExpiry = new Date();
	tokenExpiry.setMinutes(tokenExpiry.getMinutes() + 5);

	const otp = environmentBasedOTP();

	return { token: otp, expires: tokenExpiry };
};

function environmentBasedOTP(): string {
	if (env.APRICOT_ENV === 'development' || env.APRICOT_ENV === 'test') {
		return '123456';
	}
	return crypto.randomInt(100000, 999999).toString().padStart(6, '0');
}

const findVerificationTokenByIdentifierAndToken = async (ctx: TRPCContext, identifier: string, token: string) => {
	return await ctx.db.verificationToken.findUnique({
		where: {
			identifier,
			token,
		},
	});
};

const deleteVerificationTokenByIdentifier = async (ctx: TRPCContext, identifier: string) => {
	return await ctx.db.verificationToken.delete({
		where: {
			identifier,
		},
	});
};

const upsertVerificationToken = async (ctx: TRPCContext, identifier: string, token: string, expires: Date) => {
	return await ctx.db.verificationToken.upsert({
		where: { identifier },
		update: {
			identifier,
			token,
			expires,
		},
		create: {
			identifier,
			token,
			expires,
		},
	});
};

type ValidateOrResendEmailTokenParams = {
	ctx: TRPCContext;
	email: string;
	token: string;
	resendEmailFunction: (email: string, token: string) => Promise<void>;
};
const validateEmailTokenAndResendEmailIfExpired = async ({
	ctx,
	email,
	resendEmailFunction,
	token,
}: ValidateOrResendEmailTokenParams) => {
	const emailTokenCombo = await findVerificationTokenByIdentifierAndToken(ctx, email, token);

	if (!emailTokenCombo) {
		throw new TRPCError({
			code: 'NOT_FOUND',
			message: `The verification token is invalid.`,
		});
	}

	if (emailTokenCombo.expires < new Date()) {
		const { expires, token: newToken } = generateRandomVerificationToken();

		await upsertVerificationToken(ctx, email, newToken, expires);
		await resendEmailFunction(email, newToken);

		throw new TRPCError({
			code: 'CONFLICT',
			message: `Link expired, please check your inbox for the latest email from us.`,
		});
	}

	return emailTokenCombo;
};

type ValidateEmailTokenParams = {
	ctx: TRPCContext;
	email: string;
	token: string;
};
const validateEmailToken = async ({ ctx, email, token }: ValidateEmailTokenParams) => {
	const emailTokenCombo = await findVerificationTokenByIdentifierAndToken(ctx, email, token);

	if (emailTokenCombo) {
		await deleteVerificationTokenByIdentifier(ctx, email);
	} else {
		throw new TRPCError({
			code: 'NOT_FOUND',
			message: `The verification token is invalid.`,
		});
	}

	if (emailTokenCombo.expires < new Date()) {
		const { expires, token: newToken } = generateOTPCode();
		await upsertVerificationToken(ctx, email, newToken, expires);
		await sendgridService.sendDeviceVerificationEmail(email, newToken);
		throw new TRPCError({
			code: 'CONFLICT',
			message: `Code expired, please check your inbox for the latest email from us.`,
		});
	}

	return emailTokenCombo;
};
