import { ConfigurationType } from '@prisma/client';
import { PathwaysNestingItem } from '../../../../server/api/routers/patient/v1/custom-form-responses/careplan';
import { Configuration } from '../../../configurations';
import { Pathway } from '../../data-files/scripts/clinicalPathways';
import { elaraPathwaysNesting } from './assets/sn-nesting';
import { backOfficeCompletedConfig } from './backOfficeCompletedConfig';
import { allQuestions } from './data-files';
import pathways from './data-files/clinicalPathways.json';
import { qaConfig } from './qaConfig';

export const ElaraConfig: Configuration = {
	orgName: 'Elara',
	configurationType: ConfigurationType.HomeCareHomeBase,
	qaConfig,
	backOfficeCompletedConfig,
	allQuestions,
	pathways: pathways as Pathway[],
	pathwaysNesting: elaraPathwaysNesting as PathwaysNestingItem[],
};
