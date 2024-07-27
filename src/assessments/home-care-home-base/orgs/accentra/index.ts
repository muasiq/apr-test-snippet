import { ConfigurationType } from '@prisma/client';
import { PathwaysNestingItem } from '../../../../server/api/routers/patient/v1/custom-form-responses/careplan';
import { Configuration } from '../../../configurations';
import { Pathway } from '../../data-files/scripts/clinicalPathways';
import { accentraPathwaysNesting } from './assets/sn-nesting';
import { backOfficeCompletedConfig } from './backOfficeCompletedConfig';
import { allQuestions } from './data-files';
import pathways from './data-files/clinicalPathways.json';
import { qaConfig } from './qaConfig';

export const AccentraConfig: Configuration = {
	orgName: 'Accentra',
	configurationType: ConfigurationType.HomeCareHomeBase,
	qaConfig,
	backOfficeCompletedConfig,
	allQuestions,
	pathways: pathways as Pathway[],
	pathwaysNesting: accentraPathwaysNesting as PathwaysNestingItem[],
};
