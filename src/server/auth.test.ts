import { expect, it } from '@jest/globals';
import { TRPCError } from '@trpc/server';
import { seedPassword } from '../../prisma/util';
import { DeviceInfo } from '../common/utils/deviceInfo';
import { VerificationMethod } from './api/routers/user/user.inputs';
import { sendEmailVerification, verifyNewDevice } from './api/routers/user/user.service';
import { TRPCContext } from './api/trpc';
import { authorizeFn } from './auth';
import { AuthErrorCode } from './authErrorCodes';
import { prisma } from './prisma';

const trpcContext = {
	session: null,
	db: prisma,
	rawActiveOrganizationId: '1',
} satisfies TRPCContext;
const email = 'test@apricothealth.ai';

const deviceInfo: DeviceInfo = {
	isTouchDevice: false,
	browser: 'chrome',
	lang: 'en',
	screenResolution: '1920x1080',
	userAgent: 'userAgent',
	timezone: 'timezone',
	os: 'os',
};

describe('Authentication', () => {
	it('should prevent signin without verified device', async () => {
		const authFnCaller = () => authorizeFn({ email, password: seedPassword, deviceId: 'invalid' });
		try {
			await authFnCaller();
			expect(true).toBe(false);
		} catch (error) {
			expect(error).toBeInstanceOf(TRPCError);
			expect((error as TRPCError).message).toBe(AuthErrorCode.DEVICE_NOT_VERIFIED);
		}
	});
	it('should sign in with new device', async () => {
		await sendEmailVerification(trpcContext, { email, verificationMethod: VerificationMethod.VERIFY_DEVICE });

		const { token, expires } = await prisma.verificationToken.findFirstOrThrow({ where: { identifier: email } });

		if (expires.getTime() < Date.now()) {
			throw new Error('Token expired');
		}

		const { id: deviceId } = await verifyNewDevice(trpcContext, { device: deviceInfo, email, token });

		const credentials = { email, password: seedPassword, deviceId };

		const result = await authorizeFn(credentials);

		expect(result?.id).toBeDefined();
	});
});
