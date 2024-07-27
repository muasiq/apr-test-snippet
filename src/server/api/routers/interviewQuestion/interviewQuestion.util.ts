import { isNurseInterviewPending } from '~/common/utils/patientStatusUtils';
import { PermissionedTRPCContext } from '../../trpc';
import * as patientService from '../patient/patient.service';

export async function throwIfCannotEdit(
	patientId: number,
	ctx: PermissionedTRPCContext,
	allowNonAssignedUserToUpdate = false,
) {
	const { rightStatus, rightUser } = await currentPatientStatusAllowsUpdatesAndIsAssignedNurse(patientId, ctx);
	if (!rightStatus) {
		throw new Error('Patient status does not allow for interview updates');
	}
	if (!rightUser && !allowNonAssignedUserToUpdate) {
		throw new Error('You are not the assigned Nurse for this patient');
	}
}

async function currentPatientStatusAllowsUpdatesAndIsAssignedNurse(patientId: number, ctx: PermissionedTRPCContext) {
	const patient = await patientService.getPatientById(patientId, ctx, {});
	const rightUser = ctx.session.user.id === patient.SOCVisitCaseManagerId;
	return { rightStatus: isNurseInterviewPending(patient.status), rightUser };
}
