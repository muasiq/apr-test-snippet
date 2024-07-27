import { VersionedConfiguration } from '@prisma/client';
import { Configuration } from '~/assessments/configurations';
import { Pathway } from '../../../../assessments/home-care-home-base/data-files/scripts/clinicalPathways';
import { AssessmentQuestion, Group } from '../../../../assessments/types';
import { PermissionedTRPCContext } from '../../trpc';
import * as organizationService from '../organization/organization.service';
import * as patientService from '../patient/patient.service';
import { PathwaysNestingItem } from '../patient/v1/custom-form-responses/careplan';
import { GetConfigurationForPatient } from './configuration.inputs';

export const configurationService = {
	async getConfigurationForPatient(ctx: PermissionedTRPCContext, input: GetConfigurationForPatient) {
		const { patientId } = input;
		const patient = await patientService.getPatientById(patientId, ctx, {});
		return getConfigurationById(ctx, patient.versionedConfigurationId);
	},
	getCurrentConfigurationForOrg: (ctx: PermissionedTRPCContext) =>
		getOrgCurrentConfiguration(ctx, ctx.activeOrganizationId),
};

async function getOrgCurrentConfiguration(ctx: PermissionedTRPCContext, orgId: number) {
	const org = await organizationService.getById(ctx, orgId);
	const latestConfig = await ctx.db.versionedConfiguration.findFirstOrThrow({
		where: { organizationId: org.id },
		orderBy: { createdAt: 'desc' },
	});
	return resolveConfigurationTypes(latestConfig);
}

async function getConfigurationById(ctx: PermissionedTRPCContext, configurationId: number) {
	const configuration = await ctx.db.versionedConfiguration.findUniqueOrThrow({ where: { id: configurationId } });
	return resolveConfigurationTypes(configuration);
}

export function resolveConfigurationTypes(configuration: VersionedConfiguration) {
	return {
		id: configuration.id,
		allQuestions: configuration.allQuestions as unknown as AssessmentQuestion[],
		qaConfig: configuration.qaConfig as unknown as Group[],
		backOfficeCompletedConfig: configuration.completedConfig as unknown as Group[],
		configurationType: configuration.configurationType,
		pathways: configuration.pathways as unknown as Pathway[],
		pathwaysNesting: configuration.pathwaysNesting as unknown as PathwaysNestingItem[],
	} as Configuration & { id: number };
}
