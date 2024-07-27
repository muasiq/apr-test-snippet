import { drive_v3 } from '@googleapis/drive';
import { getSheetData } from '../../../scripts/sheets';
import { uploadToSheetSimple } from './util';

// interface ClinicalPathwaysRow {
// 	Rowid: string;
// 	Discipline: string;
// 	Pathway: string;
// 	'Problem Statement': string;
// 	'Order Desc': string;
// 	'Goal Desc': string;
// 	NDPSeq: string;
// 	TreatCode: string;
// 	ndpi_visits: string;
// 	InterventionsText: string;
// 	Details: string;
// 	DetailReq: string;
// 	Training: string;
// 	TrainingReq: string;
// 	GoalSeq: string;
// 	GoalsText: string;
// }

interface PathwayBase {
	problemCategory: string;
	problemItems?: string[];
}

interface Nesting {
	text: string;
	children?: Nesting[];
}

export interface ProblemItem {
	problemItem: string;
	problemItemClean: string;
	treatmentCode: string;
	goalTemplate: string;
	interventionTemplate: string;
}

export interface Pathway {
	problemItems: ProblemItem[];
	problemCategory: string;
}

export async function processClinicalPathways(
	file: drive_v3.Schema$File,
	configFileId: string,
	nesting: Nesting[],
	defaultItems: string[],
) {
	const { rows } = await getSheetData(file.id!, 'Problem Statements - Interv');
	const allData = rows.map((row) => row.toObject());
	const medDiscipline = findStartOfMedPathways(nesting);
	const problemCategoriesAndItems = medDiscipline?.children
		?.find((c) => c.text === 'YES')
		?.children?.map((c) => {
			const problemItems = c.children
				?.find((c) => c.text === 'YES')
				?.children?.flatMap((c) => {
					const children = c.children?.find((c) => c.text === 'YES')?.children;
					const moreChildren = children?.length;
					if (!moreChildren) {
						return c.text;
					} else {
						return children?.map((c) => c.text);
					}
				});
			return { problemCategory: c.text, problemItems };
		});

	if (!problemCategoriesAndItems) throw new Error('No problem categories and items found');

	const problemCategoriesAndItemsWithGoalAndIntervention = problemCategoriesAndItems.map((c) =>
		lookupItemsForCategory(c, allData),
	);

	const flattened = flattenForSheets(problemCategoriesAndItemsWithGoalAndIntervention);
	const defaultLookup = createDefaultCategory(defaultItems, allData);
	const withDefault = [defaultLookup, ...problemCategoriesAndItemsWithGoalAndIntervention];
	await uploadToSheetSimple(configFileId, 'pathways', flattened);

	return withDefault;
}

function findStartOfMedPathways(nesting: Nesting[]) {
	const medString = 'MED/SURG NURSING (';
	const atRoot = nesting.find((n) => n.text.startsWith(medString));
	if (atRoot) {
		return atRoot;
	}
	const nested = nesting.find((n) => n.text === 'SN - SKILLED NURSING');
	return nested?.children?.find((n) => n.text.startsWith(medString));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createDefaultCategory(defaultItems: string[], allData: Partial<Record<string, any>>[]) {
	const defaultBase = {
		problemCategory: 'Default (0000000)',
		problemItems: defaultItems,
	};
	return lookupItemsForCategory(defaultBase, allData);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function lookupItemsForCategory(c: PathwayBase, allData: Partial<Record<string, any>>[]) {
	const regex = /\s\(\d+\)$/;
	const withIntervention = c.problemItems?.map((p) => {
		const codeStart = p.match(regex)?.index;
		const withoutCode = p.substring(0, codeStart);
		const interventionData = allData.find((d) => d['Problem Statement'] === withoutCode);
		return {
			problemItem: p,
			problemItemClean: withoutCode?.trim(),
			treatmentCode: (interventionData?.TreatCode as string)?.trim(),
			goalTemplate: (interventionData?.['Goal Desc'] as string)?.trim(),
			interventionTemplate: (interventionData?.['Order Desc'] as string)?.trim(),
		};
	});
	if (!withIntervention) {
		const codeStart = c.problemCategory.match(regex)?.index;
		const withoutCode = c.problemCategory.substring(0, codeStart);
		const lookup = allData.find((d) => d['Problem Statement'] === withoutCode);
		const problemItem = {
			problemItem: c.problemCategory,
			problemItemClean: withoutCode?.trim(),
			treatmentCode: (lookup?.TreatCode as string)?.trim(),
			goalTemplate: (lookup?.['Goal Desc'] as string)?.trim(),
			interventionTemplate: (lookup?.['Order Desc'] as string)?.trim(),
		};
		return {
			...c,
			problemItems: [problemItem],
		};
	}
	return {
		...c,
		problemItems: withIntervention,
	};
}

function flattenForSheets(data: Pathway[]) {
	return data.flatMap((d) => {
		return d.problemItems.map((p) => {
			const { problemItemClean, treatmentCode, goalTemplate, interventionTemplate } = p;
			return {
				problemCategory: d.problemCategory,
				problemItem: problemItemClean,
				treatmentCode,
				goalTemplate,
				interventionTemplate,
			};
		});
	});
}
