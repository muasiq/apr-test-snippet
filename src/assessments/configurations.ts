import { ConfigurationType } from '@prisma/client';
import { PathwaysNestingItem } from '~/server/api/routers/patient/v1/custom-form-responses/careplan';
import { Pathway } from './home-care-home-base/data-files/scripts/clinicalPathways';
import { AccentraConfig } from './home-care-home-base/orgs/accentra';
import { ChoiceConfig } from './home-care-home-base/orgs/choice';
import { ElaraConfig } from './home-care-home-base/orgs/elara';
import { AssessmentQuestion, Group } from './types';

export interface Configuration {
	orgName: string;
	configurationType: ConfigurationType;
	qaConfig: Group[];
	backOfficeCompletedConfig: Group[];
	allQuestions: AssessmentQuestion[];
	pathways: Pathway[];
	pathwaysNesting: PathwaysNestingItem[];
}

export const getLocalConfiguration = (orgName: string): Configuration => {
	if (orgName === 'Accentra') {
		return AccentraConfig;
	}
	if (orgName === 'Choice Health at Home') {
		return ChoiceConfig;
	}
	if (orgName === 'Elara Caring') {
		return ElaraConfig;
	}
	if (['PCHH', 'Apricot'].includes(orgName)) {
		return AccentraConfig;
	}
	if (process.env.NODE_ENV === 'production') {
		console.error(`No configuration found for ${orgName}`);
	}
	return AccentraConfig;
};
