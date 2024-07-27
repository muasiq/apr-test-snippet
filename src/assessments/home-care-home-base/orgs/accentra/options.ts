import { UploadConfigurationToSheetsOptions } from '../common/uploadConfigurationToSheets';
import { accentraPathwaysNesting } from './assets/sn-nesting';

export const options: UploadConfigurationToSheetsOptions = {
	orgId: 2,
	superDuperConfigSheetId: '1bCxofvKQYWhyjcdWCsl9tiA33_eqEh2BH0D3HnMORj8',
	folderWithFiles: '1-ButXR4EnSKMUCpWJRVO9zbHPzyv-T1I',
	physicalAssessmentHtml:
		'src/assessments/home-care-home-base/orgs/accentra/assets/Assessment_Form_Viewer_Report_PDF.html',
	physicalAssessmentFileNameInSheets: 'Assessment Form Viewer Report',
	xMap: {
		// FORM: headers
		xd: 1,
		x16: 2,
		x18: 3,
		x1c: 4,
		x1f: 5,
		x22: 6,
		x25: 7,
		x28: 8,

		// Question headers
		xb: 0,
		xe: 1,
		x13: 2, // may be wrong
		x14: 2,
		x19: 3,
		x1a: 3, // may be wrong
		x1d: 4,
		x20: 5,
		x23: 6,
		x26: 7,
		x29: 8,

		// Questions
		xc: 1,
		x15: 2,
		x17: 3,
		x1b: 4,
		x1e: 5,
		x21: 6,
		x24: 7,
		x27: 8,
	},
	defaultPathwayItems: [
		'SN EVALUATION PERFORMED.  ADDITIONAL VISITS TO BE PROVIDED. (1104908)',
		'THERAPY ONLY PATIENT (1105173)',
	],
	pathwaysNesting: accentraPathwaysNesting,
	pathwaysWritePath: 'src/assessments/home-care-home-base/orgs/accentra/data-files/clinicalPathways.json',
	pathwaysFileNameInSheets: 'Problem Statements - Interventions and Goals Report - SN Clinical Pathways',
	facilitiesFileNameInSheets: 'AccentraFacilities',
	physicianFileNameInSheets: 'AccentraPhysicians',
	suppliesFileNameInSheets: 'Supplies',
	serviceCodesFileNameInSheets: 'Service Codes',
};
