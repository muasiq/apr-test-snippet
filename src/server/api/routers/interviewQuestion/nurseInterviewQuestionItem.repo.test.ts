import { expect, it } from '@jest/globals';
import { DataAccessPermissions } from '../../../../common/utils/permissions';
import { PermissionedTRPCContext } from '../../trpc';
import { nurseInterviewQuestionItemRepo } from './nurseInterviewQuestionItem.repo';

describe('NurseInterviewQuestionItemRepo', () => {
	it('should correctly merge query with permission clauses', async () => {
		const mock = jest.fn();
		const ctx = {
			dataAccessLevel: DataAccessPermissions.MINE,
			session: {
				user: {
					organizationId: 1,
					id: 1,
				},
			},
			db: {
				nurseInterviewQuestionItem: {
					findMany: mock,
				},
			},
			activeOrganizationId: 1,
		} as unknown as PermissionedTRPCContext;
		const findArgs = {
			where: {
				NurseInterviewThemeSummaries: {
					NurseInterview: {
						patientId: 1,
					},
				},
			},
		};
		await nurseInterviewQuestionItemRepo.findMany(ctx, findArgs);
		expect(mock).toHaveBeenCalledWith({
			where: {
				NurseInterviewThemeSummaries: {
					NurseInterview: {
						patientId: 1,
						Patient: {
							organizationId: 1,
							SOCVisitCaseManagerId: 1,
						},
					},
				},
			},
		});
	});
});
