import { faker } from '@faker-js/faker';
import { expect, it } from '@jest/globals';
import { UserRole } from '@prisma/client';
import { UserActionPermissions } from '~/common/utils/permissions';
import { newLocation } from '../../../../../prisma/util';
import { TestUser, createTestContext, createTestData, createToken } from '../../../../../test/util';
import { prisma } from '../../../prisma';
import { createCaller } from '../../root';
import { VerificationMethod, passwordSchema } from './user.inputs';
import { sendEmailVerification } from './user.service';

describe('UserRouter', () => {
	let user: TestUser;

	beforeAll(async () => {
		user = await createTestData([UserRole.Nurse]);
	});

	afterAll(async () => {
		await prisma.$disconnect();
	});

	describe('getAll', () => {
		it('returns all users for active org', async () => {
			const ctx = createTestContext({ user, roles: [UserRole.SuperAdmin] });
			const api = createCaller(ctx);

			const myOrgUsers = await api.user.getAll();
			expect(myOrgUsers).toBeInstanceOf(Array);
			expect(myOrgUsers.length).toBeGreaterThan(0);
			expect(myOrgUsers.every((testUser) => user.organizationId === testUser.organizationId)).toBe(true);
		});

		it('throws if user does not have permission', async () => {
			const ctx = createTestContext({ user, roles: [UserRole.DataEntry] });

			const api = createCaller(ctx);

			await expect(api.user.getAll()).rejects.toThrowError({
				message: `Requires ${UserActionPermissions.SET_PERMISSIONS_FOR_USERS} permission to access this endpoint`,
			});
		});
	});

	describe('getCaseManagerUsers', () => {
		it('returns all case manager users', async () => {
			const ctx = createTestContext({ user, roles: [UserRole.SuperAdmin] });
			const api = createCaller(ctx);

			const caseManagerUsers = await api.user.getCaseManagerUsers();

			expect(caseManagerUsers).toBeInstanceOf(Array);
			expect(caseManagerUsers.length).toBeGreaterThan(0);
			expect(caseManagerUsers.every((user) => user.roles.includes(UserRole.Nurse))).toBe(true);
			expect(caseManagerUsers.every((user) => Boolean(user.email))).toBe(true);
		});
	});

	describe('getQaUsers', () => {
		it('returns all QA users', async () => {
			const userWithQAUserRole = await prisma.user.findFirst({
				where: {
					roles: {
						has: UserRole.QaManager,
					},
				},
			});
			if (!userWithQAUserRole) throw new Error('No user with QA role found');
			const ctx = createTestContext({
				user,
				roles: [UserRole.SuperAdmin],
				activeOrgIdOverride: userWithQAUserRole.organizationId.toString(),
			});
			const api = createCaller(ctx);

			const qaUsers = await api.user.getQaUsers();
			expect(qaUsers).toBeInstanceOf(Array);
			expect(qaUsers.length).toBeGreaterThan(0);
			expect(qaUsers.every((user) => Boolean(user.organizationId))).toBe(true);

			const testQAUser = faker.helpers.arrayElement(qaUsers);
			expect(testQAUser.roles.some((role) => role === UserRole.QA || role === UserRole.QaManager)).toBe(true);
		});
	});

	describe('getDataEntryUsers', () => {
		let testDataEntryUser: TestUser;
		beforeAll(async () => {
			testDataEntryUser = await createTestData([UserRole.DataEntry]);
		});

		it('returns all data entry users', async () => {
			const ctx = createTestContext({
				user: {
					...user,
					organizationId: testDataEntryUser.organizationId,
				},
				roles: [UserRole.DataEntryManager],
			});

			const api = createCaller(ctx);

			const dataEntryUsers = await api.user.getDataEntryUsers();

			expect(dataEntryUsers).toBeInstanceOf(Array);
			expect(dataEntryUsers.length).toBeGreaterThan(0);
			expect(dataEntryUsers.every((user) => user.roles.includes(UserRole.DataEntry))).toBe(true);
		});
	});

	describe('getCurrentUser', () => {
		it('returns current user', async () => {
			const ctx = createTestContext({ user });

			const userRouter = createCaller(ctx).user;

			const currentUser = await userRouter.getCurrentUser();

			expect(currentUser).toMatchObject({
				id: user.id,
				organizationId: user.organizationId,
				email: user.email,
				name: user.name,
				roles: [UserRole.Nurse],
			});
		});
	});

	describe('createUser', () => {
		it('creates a new user', async () => {
			const ctx = createTestContext({ user, roles: [UserRole.SuperAdmin] });

			const userInfo = {
				email: faker.internet.userName().toLowerCase() + '@apricothealth.ai',
				firstName: faker.person.fullName(),
				lastName: faker.person.lastName(),
				device: null,
				password: '6@f501Et&:zO',
				token: faker.string.alphanumeric(10),
			};

			await sendEmailVerification(ctx, {
				email: userInfo.email,
				verificationMethod: VerificationMethod.VERIFY_DEVICE,
			});

			const { token, expires } = await createToken(userInfo.email);

			const api = createCaller({
				...ctx,
				session: {
					user,
					expires,
				},
			});

			const createUserData = {
				...userInfo,
				token,
				device: {
					isTouchDevice: false,
					browser: 'chrome',
					lang: 'en',
					screenResolution: '1920x1080',
					userAgent: 'userAgent',
					timezone: 'timezone',
					os: 'os',
				},
			};

			await expect(api.user.createUser(createUserData)).resolves.toMatchObject({
				deviceId: expect.any(String),
			});
		});
	});

	describe('doesUserEmailExist', () => {
		it('returns true if email exists', async () => {
			const ctx = createTestContext({ user });
			const api = createCaller(ctx);

			const doesEmailExist = await api.user.doesUserEmailExist({ email: user.email });
			expect(doesEmailExist).toBe(true);
		});

		it('returns false if email does not exist', async () => {
			const ctx = createTestContext({ user });
			const api = createCaller(ctx);

			const doesEmailExist = await api.user.doesUserEmailExist({ email: 'nonexisting@google.com' });
			expect(doesEmailExist).toBe(false);
		});
	});

	describe('sendEmailVerification', () => {
		it('sends email verification', async () => {
			const ctx = createTestContext({ user });
			const api = createCaller(ctx);

			await expect(
				api.user.sendEmailVerification({
					email: user.email,
					verificationMethod: VerificationMethod.VERIFY_DEVICE,
				}),
			).resolves.toBe(undefined);
		});

		it('throws if email does not exist in an org', async () => {
			const ctx = createTestContext({ user });
			const api = createCaller(ctx);

			const nonExistentEmail = 'nonexisting@google.com';

			await expect(
				api.user.sendEmailVerification({
					email: nonExistentEmail,
					verificationMethod: VerificationMethod.VERIFY_DEVICE,
				}),
			).rejects.toThrowError({
				message: `Not sending verification email to ${nonExistentEmail} because no valid organization was found for the email domain`,
			});
		});
	});

	describe('sendResetPasswordEmail', () => {
		it('sends reset password email', async () => {
			const ctx = createTestContext({ user });
			const api = createCaller(ctx);

			await expect(
				api.user.sendResetPasswordEmail({
					email: user.email,
				}),
			).resolves.toBe(undefined);
		});

		it('throws if email does not exist', async () => {
			const ctx = createTestContext({ user });
			const api = createCaller(ctx);

			const nonExistentEmail = 'nonexisting@google.com';
			await expect(api.user.sendResetPasswordEmail({ email: nonExistentEmail })).rejects.toThrowError({
				message: `No user found for ${nonExistentEmail} to reset password`,
			});
		});
	});

	describe('verifyNewDevice', () => {
		it('verifies new device', async () => {
			const ctx = createTestContext({ user });
			const api = createCaller(ctx);

			const deviceInfo = {
				isTouchDevice: false,
				browser: 'chrome',
				lang: 'en',
				screenResolution: '1920x1080',
				userAgent: 'userAgent',
				timezone: 'timezone',
				os: 'os',
			};

			const { token } = await createToken(user.email);

			await expect(api.user.verifyNewDevice({ email: user.email, device: deviceInfo, token })).resolves.toEqual({
				id: expect.any(String),
				metadata: deviceInfo,
			});
		});
	});

	describe('resetPassword', () => {
		it('resets password', async () => {
			const ctx = createTestContext({ user });
			const api = createCaller(ctx);

			const { token } = await createToken(user.email);

			await expect(
				api.user.resetPassword({
					email: user.email,
					confirmNewPassword: '6@f501Et&:zO',
					newPassword: '6@f501Et&:zO',
					token,
				}),
			).resolves.toBe(true);
		});

		it('throws if token is invalid', async () => {
			const ctx = createTestContext({ user });
			const api = createCaller(ctx);

			await expect(
				api.user.resetPassword({
					email: user.email,
					newPassword: '6@f501Et&:zO',
					token: 'invalid-token',
					confirmNewPassword: '6@f501Et',
				}),
			).rejects.toThrowError({
				message: 'The verification token is invalid.',
			});
		});

		it('throws if passwords do not match', async () => {
			const ctx = createTestContext({ user });
			const api = createCaller(ctx);

			const { token } = await createToken(user.email);

			await expect(
				api.user.resetPassword({
					email: user.email,
					newPassword: '6@f501Et&:zO',
					token,
					confirmNewPassword: '6@f501Et',
				}),
			).rejects.toThrowError({
				message: 'Passwords do not match',
			});
		});

		it('throws if email is not in system', async () => {
			const ctx = createTestContext({ user });
			const api = createCaller(ctx);

			const { token } = await createToken(user.email);

			const userEmail = 'non-existingemail@yahoo.com';

			await expect(
				api.user.resetPassword({
					email: userEmail,
					newPassword: '6@f501Et&:zO',
					token,
					confirmNewPassword: '6@f501Et&:zO',
				}),
			).rejects.toThrowError({
				message: `No user found for ${userEmail} to reset password`,
			});
		});

		it('throws if password is invalid', async () => {
			const ctx = createTestContext({ user });
			const api = createCaller(ctx);

			const { token } = await createToken(user.email);

			const inputData = {
				email: user.email,
				newPassword: 'invalid-password',
				token,
				confirmNewPassword: 'invalid-password',
			};

			await expect(api.user.resetPassword(inputData)).rejects.toThrowError();
		});

		it('validates with regex as expected', () => {
			const valid = 'aP@ssw0rd';
			expect(passwordSchema.safeParse(valid).success).toBe(true);

			let invalid = 'shorT1!';
			expect(passwordSchema.safeParse(invalid).success).toBe(false);

			invalid = 'lowercase1#';
			expect(passwordSchema.safeParse(invalid).success).toBe(false);

			invalid = 'UPPERCASE1#';
			expect(passwordSchema.safeParse(invalid).success).toBe(false);

			invalid = 'noNumber#';
			expect(passwordSchema.safeParse(invalid).success).toBe(false);

			invalid = 'noSpecial1';
			expect(passwordSchema.safeParse(invalid).success).toBe(false);
		});
	});

	describe('changeUserRole', () => {
		it('changes user role', async () => {
			const testUser = await createTestData([UserRole.Nurse]);
			const ctx = createTestContext({
				user,
				roles: [UserRole.SuperAdmin],
				activeOrgIdOverride: testUser.organizationId.toString(),
			});
			const api = createCaller(ctx);

			const newRoles = [UserRole.QA, UserRole.QaManager];

			const updatedUser = await api.user.changeUserRole({
				changes: [
					{
						userId: testUser.id,
						roles: [UserRole.QA, UserRole.QaManager],
					},
				],
			});

			expect(updatedUser).toMatchObject([{ newRoles, success: true, userId: testUser.id }]);
		});

		it('throws if user does not have permission', async () => {
			const ctx = createTestContext({ user, roles: [UserRole.DataEntry] });
			const api = createCaller(ctx);

			const testUser = await createTestData([UserRole.Nurse]);

			await expect(
				api.user.changeUserRole({
					changes: [
						{
							userId: testUser.id,
							roles: [UserRole.QA],
						},
					],
				}),
			).rejects.toThrowError({
				message: `Requires ${UserActionPermissions.SET_PERMISSIONS_FOR_USERS} permission to access this endpoint`,
			});
		});
	});

	describe('changeUserLocation', () => {
		it('changes user location', async () => {
			const testUser = await createTestData([UserRole.Nurse]);
			const ctx = createTestContext({
				user,
				roles: [UserRole.SuperAdmin],
				activeOrgIdOverride: testUser.organizationId.toString(),
			});
			const api = createCaller(ctx);

			const newDbLocation = await newLocation('Awesome Location', testUser.organizationId);

			await expect(
				api.user.changeUserLocation({
					changes: [
						{
							userId: testUser.id,
							branches: [newDbLocation.id],
						},
					],
				}),
			).resolves.toBe(undefined);
		});
	});

	describe('updateUser', () => {
		it("updates current user's name", async () => {
			const ctx = createTestContext({ user });
			const api = createCaller(ctx);

			const newName = 'Avatar Ang';

			const updatedUser = await api.user.updateUser({
				name: newName,
			});

			expect(updatedUser).toMatchObject({
				id: user.id,
				organizationId: user.organizationId,
				email: user.email,
				name: newName,
				roles: [UserRole.Nurse],
			});
		});
	});
});
