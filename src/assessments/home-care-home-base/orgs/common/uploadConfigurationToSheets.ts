import { drive_v3 } from '@googleapis/drive';
import * as fs from 'fs';
import { listDocs } from '../../../scripts/docs';
import { XMapConfig, createPhysicalAssessment } from '../../data-files/scripts/assessmentFormViewer';
import { processClinicalPathways } from '../../data-files/scripts/clinicalPathways';
import { convertExcelFilesInDriveToSheet } from '../../data-files/scripts/convertExcelFilesInDriveToSheet';
import { copyMasterQuestionMapFromApricotCore } from '../../data-files/scripts/createMasterQuestionMap';
import { processFacilitiesSheet } from '../../data-files/scripts/processFacilitiesSheet';
import { processPhysicianSheet } from '../../data-files/scripts/processPhysicianSheet';
import { processServiceCodesSheet } from '../../data-files/scripts/processServiceCodesSheet';
import { processSuppliesSheet } from '../../data-files/scripts/processSuppliesSheet';

export enum FileCreateOptions {
	PHYSICAL_ASSESSMENT = 'PHYSICAL_ASSESSMENT',
	SOC_STANDARD_ASSESSMENT = 'SOC_STANDARD_ASSESSMENT',
	PATHWAYS = 'PATHWAYS',
	FACILITIES = 'FACILITIES',
	PHYSICIANS = 'PHYSICIANS',
	SUPPLIES = 'SUPPLIES',
	SERVICE_CODES = 'SERVICE_CODES',
}

export type PathwaysNesting = {
	text: string;
	children?: PathwaysNesting[];
};

export type UploadConfigurationToSheetsOptions = {
	orgId: number;
	superDuperConfigSheetId: string;
	folderWithFiles: string;
	physicalAssessmentHtml: string;
	physicalAssessmentFileNameInSheets: string;
	xMap: XMapConfig;
	defaultPathwayItems: string[];
	pathwaysNesting: PathwaysNesting[];
	pathwaysWritePath: string;
	pathwaysFileNameInSheets: string;
	facilitiesFileNameInSheets: string;
	physicianFileNameInSheets: string;
	suppliesFileNameInSheets: string;
	serviceCodesFileNameInSheets: string;
};

export async function uploadConfigurationToSheets(
	fileCreateOptions: FileCreateOptions[],
	options: UploadConfigurationToSheetsOptions,
) {
	const { folderWithFiles } = options;
	await convertExcelFilesInDriveToSheet(folderWithFiles);
	const allFiles = await listDocs(folderWithFiles);
	if (!allFiles) throw new Error('No files found in folder');

	if (fileCreateOptions.includes(FileCreateOptions.PHYSICAL_ASSESSMENT)) {
		console.log('runCreatePhysicalAssessment');
		await runCreatePhysicalAssessment(allFiles, options);
	}

	if (fileCreateOptions.includes(FileCreateOptions.PATHWAYS)) {
		console.log('runCreatePathways');
		await runCreatePathways(allFiles, options);
	}

	if (fileCreateOptions.includes(FileCreateOptions.SOC_STANDARD_ASSESSMENT)) {
		console.log('runCreateSocStandardAssessment');
		throw new Error('Are you sure? This is typically done one time');
		await runCreateSocStandardAssessment(options);
	}

	if (fileCreateOptions.includes(FileCreateOptions.FACILITIES)) {
		console.log('runCreateFacilities');
		await runCreateFacilities(allFiles, options);
	}

	if (fileCreateOptions.includes(FileCreateOptions.PHYSICIANS)) {
		console.log('runCreatePhysicians');
		await runCreatePhysician(allFiles, options);
	}

	if (fileCreateOptions.includes(FileCreateOptions.SUPPLIES)) {
		console.log('runCreateSupplies');
		await runCreateSupplies(allFiles, options);
	}

	if (fileCreateOptions.includes(FileCreateOptions.SERVICE_CODES)) {
		console.log('runCreateServiceCodes');
		await runCreateServiceCodes(allFiles, options);
	}
}

async function runCreateFacilities(allFiles: drive_v3.Schema$File[], options: UploadConfigurationToSheetsOptions) {
	const { facilitiesFileNameInSheets } = options;
	const facilities = allFiles.find((f) => f.name === facilitiesFileNameInSheets);
	if (!facilities) throw new Error('missing files');
	await processFacilitiesSheet(options.orgId, facilities);
}

async function runCreatePhysician(allFiles: drive_v3.Schema$File[], options: UploadConfigurationToSheetsOptions) {
	const { physicianFileNameInSheets } = options;
	const physicians = allFiles.find((f) => f.name === physicianFileNameInSheets);
	if (!physicians) throw new Error('missing files');
	await processPhysicianSheet(options.orgId, physicians);
}

async function runCreateSupplies(allFiles: drive_v3.Schema$File[], options: UploadConfigurationToSheetsOptions) {
	const { suppliesFileNameInSheets } = options;
	const supplies = allFiles.find((f) => f.name === suppliesFileNameInSheets);
	if (!supplies) throw new Error('missing files');
	await processSuppliesSheet(options.orgId, supplies);
}

async function runCreateServiceCodes(allFiles: drive_v3.Schema$File[], options: UploadConfigurationToSheetsOptions) {
	const { serviceCodesFileNameInSheets } = options;
	const serviceCodes = allFiles.find((f) => f.name === serviceCodesFileNameInSheets);
	if (!serviceCodes) throw new Error('missing files');
	await processServiceCodesSheet(options.orgId, serviceCodes);
}

async function runCreateSocStandardAssessment(options: UploadConfigurationToSheetsOptions) {
	const { superDuperConfigSheetId, folderWithFiles } = options;
	await copyMasterQuestionMapFromApricotCore(superDuperConfigSheetId, folderWithFiles);
}

async function runCreatePathways(allFiles: drive_v3.Schema$File[], options: UploadConfigurationToSheetsOptions) {
	const {
		pathwaysFileNameInSheets,
		superDuperConfigSheetId,
		pathwaysNesting,
		defaultPathwayItems,
		pathwaysWritePath,
	} = options;
	const pathwaysFile = allFiles.find((f) => f.name === pathwaysFileNameInSheets);
	if (!pathwaysFile) throw new Error('missing files');

	const pathways = await processClinicalPathways(
		pathwaysFile,
		superDuperConfigSheetId,
		pathwaysNesting,
		defaultPathwayItems,
	);

	fs.writeFileSync(pathwaysWritePath, JSON.stringify(pathways, null, 2));
}

async function runCreatePhysicalAssessment(
	allFiles: drive_v3.Schema$File[],
	options: UploadConfigurationToSheetsOptions,
) {
	const { physicalAssessmentFileNameInSheets, superDuperConfigSheetId, physicalAssessmentHtml, xMap } = options;
	const physicalAssessmentFile = allFiles.find((f) => f.name === physicalAssessmentFileNameInSheets);

	if (!physicalAssessmentFile) throw new Error('missing files');

	await createPhysicalAssessment(physicalAssessmentFile, superDuperConfigSheetId, physicalAssessmentHtml, xMap);
}
