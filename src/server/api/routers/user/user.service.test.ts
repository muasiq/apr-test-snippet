import { expect } from '@jest/globals';
import { UserRole } from '@prisma/client';
import { omit } from 'lodash';
import { DataAccessPermissions } from '~/common/utils/permissions';
import { Prisma } from '~/server/prisma';
import { userRepo } from './user.repo';
import { getAllUsers } from './user.service';

const mockDb = {
	user: { id: '1', name: 'John Doe', password: 'pass$123' },
} as unknown as Prisma;

const mockUserRepo = {
	findMany: jest.fn().mockResolvedValue([mockDb.user]),
};

describe('UserService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should call findMany with expected query', async () => {
		const ctx = {
			session: {
				user: {
					id: '1',
					name: 'John Doe',
					email: 'foo@mail.com',
					organizationId: 1,
					roles: [UserRole.SuperAdmin],
				},
				expires: new Date().toISOString(),
			},
			db: mockDb,
		};

		jest.spyOn(userRepo, 'findMany').mockImplementation(mockUserRepo.findMany);

		const allUsers = await getAllUsers({
			db: ctx.db,
			session: ctx.session,
			dataAccessLevel: DataAccessPermissions.FULL_SYSTEM,
			activeOrganizationId: 1,
			rawActiveOrganizationId: '1',
		});

		expect(allUsers).toEqual([omit(mockDb.user, ['password'])]);
		expect(mockUserRepo.findMany).toBeCalledTimes(1);
		expect(mockUserRepo.findMany).toBeCalledWith(
			{
				dataAccessLevel: DataAccessPermissions.FULL_SYSTEM,
				db: mockDb,
				session: ctx.session,
				activeOrganizationId: 1,
				rawActiveOrganizationId: '1',
			},
			{
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
			},
		);
	});
});
