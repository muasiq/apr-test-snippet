import { UploadConfigurationToSheetsOptions } from '../common/uploadConfigurationToSheets';
import { elaraPathwaysNesting } from './assets/sn-nesting';

export const options: UploadConfigurationToSheetsOptions = {
	orgId: 6,
	superDuperConfigSheetId: '1EUCnzwc4uHU9BTDBB0SAEKln8N4Pz26AWAkTm3iV8PE',
	folderWithFiles: '1d4KfcfhLw3Hw1kMNgxEqKqG3OeEPkhY-',
	physicalAssessmentHtml:
		'src/assessments/home-care-home-base/orgs/elara/assets/Assessment_Form_Viewer_Report_2.html',
	physicalAssessmentFileNameInSheets: 'Assessment Form Viewer Report RN00 including 06.17.24 changes (1)',
	xMap: {
		// FORM: headers
		x14: 1,

		// Answers
		xd: 1,
		x16: 2,
		x18: 3,

		// Questions
		xc: 0,
		x15: 1,
		x13: 2,
		x1a: 3,
	},
	defaultPathwayItems: [
		'SN EVALUATION PERFORMED.  ADDITIONAL VISITS TO BE PROVIDED. (1104908)',
		'THERAPY ONLY PATIENT',
		'COVID-19 INFECTION (1122111)',
		'RISK OF INFECTION (1122137)',
		'USE OF TELECOMMUNICATION DURING COVID-19 PANDEMIC (1122099)',
	],

	pathwaysNesting: elaraPathwaysNesting,
	pathwaysWritePath: 'src/assessments/home-care-home-base/orgs/elara/data-files/clinicalPathways.json',
	pathwaysFileNameInSheets: 'Elara Caring - SN Problem Statements - Interventions and Goals Report 5.30.24',
	facilitiesFileNameInSheets: 'Facilities - Elara',
	physicianFileNameInSheets: 'Physicians - Elara',
	suppliesFileNameInSheets: 'Elara Caring - Supplies',
	serviceCodesFileNameInSheets: 'Elara Caring - Service Codes',
};
