import { Organization } from '@prisma/client';
import { prisma } from '../../server/prisma';
import { getLocalConfiguration } from '../configurations';

export async function addAllConfigurationsToDB() {
	const allOrgs = await prisma.organization.findMany({});
	for (const org of allOrgs) {
		await addConfigurationToDBForOrg(org);
	}
}

export async function addConfigurationToDBForOrgId(orgId: number) {
	const org = await prisma.organization.findUniqueOrThrow({
		where: { id: orgId },
	});
	await addConfigurationToDBForOrg(org);
}

async function addConfigurationToDBForOrg(org: Organization) {
	const config = getLocalConfiguration(org.name);
	await prisma.versionedConfiguration.create({
		data: {
			configurationType: config.configurationType,
			allQuestions: config.allQuestions,
			qaConfig: config.qaConfig,
			completedConfig: config.backOfficeCompletedConfig,
			organizationId: org.id,
			pathways: config.pathways,
			pathwaysNesting: config.pathwaysNesting,
		},
	});
}
