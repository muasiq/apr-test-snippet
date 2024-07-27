import { ConfigurationType } from '@prisma/client';
import { PathwaysNestingItem } from '../../../../server/api/routers/patient/v1/custom-form-responses/careplan';
import { Configuration } from '../../../configurations';
import { choicePathwaysNesting } from './assets/sn-nesting';
import { backOfficeCompletedConfig } from './backOfficeCompletedConfig';
import { allQuestions } from './data-files';
import pathways from './data-files/clinicalPathways.json';
import { qaConfig } from './qaConfig';

export const ChoiceConfig: Configuration = {
	orgName: 'Choice',
	configurationType: ConfigurationType.Choice,
	qaConfig,
	backOfficeCompletedConfig,
	allQuestions,
	pathways,
	pathwaysNesting: choicePathwaysNesting as PathwaysNestingItem[],
};
