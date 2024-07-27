import { PermissionedTRPCContext } from '../../trpc';
import * as userInputs from './stats.inputs';
import { PatientStats } from './stats.types';

export const getPatientStats = async ({ from, to }: userInputs.PatientStats, ctx: PermissionedTRPCContext) => {
	const organizationId = ctx.activeOrganizationId;
	const patientsByDay: PatientStats[] = await ctx.db.$queryRaw`
	SELECT date(date_trunc('day', date("SOCVisitDate")) AT TIME ZONE '-24')  as "SOCVisitDay", status, COUNT(1)::integer as _count 
	FROM "Patient" WHERE 
	"SOCVisitDate" >= ${from} AND "SOCVisitDate"  <= ${to} 
	AND "organizationId" = ${organizationId}
	AND "deleted" = false
	GROUP BY "SOCVisitDay", status;`;
	return patientsByDay;
};
