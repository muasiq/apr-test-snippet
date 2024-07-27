import { expect, it } from '@jest/globals';
import { UserRole } from '@prisma/client';
import {
	DataAccessPermissions,
	UserActionPermissions,
	getDataAccessLevelForPermission,
	hasActionPermission,
	hasPermission,
} from './permissions';

describe('permissions', () => {
	describe('hasPermission', () => {
		it('should return true if the user has the permission', () => {
			const data = DataAccessPermissions.MINE;
			const action = UserActionPermissions.VIEW_PATIENTS;
			const roles = [UserRole.Nurse];

			const result = hasPermission(data, action, roles);

			expect(result).toBe(true);
		});

		it('should return false if the user does not have the permission', () => {
			const data = DataAccessPermissions.MINE;
			const action = UserActionPermissions.START_RESUME_SOC_ASSESSMENT_BUTTON_VISIBLE;
			const roles = [UserRole.QA, UserRole.SuperAdmin];

			const result = hasPermission(data, action, roles);

			expect(result).toBe(false);
		});

		it('should return false if the user does not have the permission across roles', () => {
			const data = DataAccessPermissions.MINE;
			const action = UserActionPermissions.QA_TAB_VISIBLE;
			const roles = [UserRole.Nurse];

			const result = hasPermission(data, action, roles);

			expect(result).toBe(false);
		});

		it('should return false if the user role does not exist in the map', () => {
			const data = DataAccessPermissions.MINE;
			const action = UserActionPermissions.VIEW_PATIENTS;
			const roles = ['NonExistentRole' as UserRole];

			const result = hasPermission(data, action, roles);

			expect(result).toBe(false);
		});

		it('should return true if the user has required permissions across roles', () => {
			const data = DataAccessPermissions.FULL_SYSTEM;
			const action = UserActionPermissions.QA_TAB_VISIBLE;
			const roles = [UserRole.Nurse, UserRole.SuperAdmin];

			const result = hasPermission(data, action, roles);

			expect(result).toBe(true);
		});
	});

	describe('getDataAccessLevelForPermission', () => {
		it('should return null if no roles are provided', () => {
			const result = getDataAccessLevelForPermission(UserActionPermissions.VIEW_PATIENTS);
			expect(result).toBeNull();
		});

		it('should return the highest data access level that a user with a single role has for a given permission', () => {
			const result = getDataAccessLevelForPermission(UserActionPermissions.VIEW_PATIENTS, [UserRole.SuperAdmin]);
			expect(result).toEqual(DataAccessPermissions.FULL_SYSTEM);
		});

		it('should return the highest data access level that a user with multiple roles has for a given permission', () => {
			const result = getDataAccessLevelForPermission(UserActionPermissions.VIEW_PATIENTS, [
				UserRole.Nurse,
				UserRole.QA,
			]);
			expect(result).toEqual(DataAccessPermissions.MINE);
		});
		it('should return null if you dont have the permission', () => {
			const result = getDataAccessLevelForPermission(UserActionPermissions.QA_TAB_VISIBLE, [UserRole.Nurse]);
			expect(result).toBeNull();

			const result2 = getDataAccessLevelForPermission(UserActionPermissions.QA_TAB_VISIBLE, [
				UserRole.Nurse,
				UserRole.QA,
			]);
			expect(result2).toEqual(DataAccessPermissions.MINE_WITH_QA);
		});
	});
	describe('hasActionPermission', () => {
		it('should return false if no roles are provided', () => {
			const result = hasActionPermission(UserActionPermissions.VIEW_PATIENTS, []);
			expect(result).toBe(false);
		});

		it('should return true if a user with a single role has the given action permission', () => {
			const result = hasActionPermission(UserActionPermissions.VIEW_PATIENTS, [UserRole.Nurse]);
			expect(result).toBe(true);
		});

		it('should return true if a user with multiple roles has the given action permission', () => {
			const result = hasActionPermission(UserActionPermissions.ARCHIVE_PATIENT_RECORD, [
				UserRole.Nurse,
				UserRole.SuperAdmin,
			]);
			expect(result).toBe(true);
		});

		it('should return false if a user with multiple roles does not have the given action permission', () => {
			const result = hasActionPermission(UserActionPermissions.ARCHIVE_PATIENT_RECORD, [
				UserRole.Nurse,
				UserRole.OrgQA,
			]);
			expect(result).toBe(false);
		});
	});
});
