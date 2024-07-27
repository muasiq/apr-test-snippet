import { type AssessmentAnswer } from '@prisma/client';
import { keyBy } from 'lodash';
import { Pathway, ProblemItem } from '~/assessments/home-care-home-base/data-files/scripts/clinicalPathways';
import { AssessmentPlanBuilder, CheckedResponseUnion } from '~/server/api/routers/assessment/assessment.inputs';

export type PathwaysNestingItem = {
	text: string;
	children?: [
		{
			text: 'NO';
			children?: PathwaysNestingItem[];
		},
		{
			text: 'YES';
			children?: PathwaysNestingItem[];
		},
	];
	details?: { text: string; response: string }[];
};

export type PathwaysNestingItemResponse = {
	text: string;
	response?: string;
	children?: PathwaysNestingItemResponse[];
	details?: { text: string; response: string }[];
};

export type PathwaysNestingWithInfo = Omit<PathwaysNestingItemResponse, 'children'> & {
	id: string;
	children?: PathwaysNestingWithInfo[];
	problem?: ProblemItem;
};

const THERAPY_ONLY_CATEGORIES = [
	'THERAPY ONLY PATIENT (1105173)',
	'SKILLED NURSE EVAL PERFORMED FOR OASIS DATA COLLECTION ONLY (1229822)', // Elara
];
const DEFAULT_CATEGORY = 'Default (0000000)';

export function generateCarePlanResponse(
	{ checkedResponse }: AssessmentAnswer,
	pathways: Pathway[],
	pathwaysNesting: PathwaysNestingItem[],
) {
	const res = (checkedResponse as CheckedResponseUnion).choice;

	let selectedAreas: AssessmentPlanBuilder['choice']['areas'] = [];

	if (typeof res === 'object' && 'areas' in res) {
		const therapyOnlyPatient = res.areas.find((area) => THERAPY_ONLY_CATEGORIES.includes(area.category));
		if (therapyOnlyPatient) {
			selectedAreas = [therapyOnlyPatient];
		} else {
			selectedAreas = res.areas;
		}
	}

	if (selectedAreas.length) {
		const problemsList = pathways.flatMap((pathway) => pathway.problemItems);
		const problemLookup = keyBy(problemsList, 'problemItem');

		const resolvedPathways = addInfoToNodes([...pathwaysNesting], problemLookup);
		const { lookup, parentLookup } = createParentLookup(resolvedPathways);

		for (const area of selectedAreas) {
			for (const problem of area.problems) {
				const foundProblem = problemLookup[problem.name];
				if (!foundProblem) continue;

				const foundPathway = deepFindPathwaysItem(resolvedPathways, {
					text: foundProblem.problemItem,
					...(area.category !== DEFAULT_CATEGORY && { parent: area.category }),
				}) as PathwaysNestingWithInfo;
				if (!foundPathway) continue;

				foundPathway.response = 'YES';
				foundPathway.details = [
					{ text: 'Treatment Code', response: foundProblem.treatmentCode },
					{ text: 'Order', response: problem.interventionDetails },
					{ text: 'Goal', response: problem.goalDetails },
				];

				let node = lookup[foundPathway.id];
				while (node) {
					const parentId = parentLookup[node.id];
					const parent = parentId && lookup[parentId];
					if (!parent) break;

					if (['YES', 'NO'].includes(node.text)) {
						parent.response = node.text;
					}

					node = parent;
				}
			}
		}

		markPathwayItemsAsNo(resolvedPathways);
		return formatResponse(resolvedPathways);
	}

	throw new Error('CarePlan response is not an object');
}

function addInfoToNodes(
	items: PathwaysNestingItemResponse[],
	problemLookup: Record<string, ProblemItem>,
	parentId = 'root',
	count = 1,
): PathwaysNestingWithInfo[] {
	return items.map((item, index) => {
		const newId = `${parentId}-${index + 1}`;
		return {
			...item,
			id: newId,
			problem: problemLookup[item.text],
			children: item.children ? addInfoToNodes(item.children, problemLookup, newId, count) : undefined,
		};
	});
}

type ParentLookup = Record<string, string | null>;
type NodeLookup = Record<string, PathwaysNestingWithInfo>;
function createParentLookup(
	items: PathwaysNestingWithInfo[],
	parent: string | null = null,
	lookup: NodeLookup = {},
	parentLookup: ParentLookup = {},
) {
	for (const item of items) {
		lookup[item.id] = item;
		parentLookup[item.id] = parent;
		if (item.children) {
			createParentLookup(item.children, item.id, lookup, parentLookup);
		}
	}
	return { lookup, parentLookup };
}

function deepFindPathwaysItem(
	items: PathwaysNestingItemResponse[],
	search: { text: string; parent?: string },
	visited: string[] = [],
): PathwaysNestingItemResponse | null {
	for (const item of items) {
		const path = [...visited, item.text];
		if (item.text === search.text && (!search.parent || path.includes(search.parent))) {
			return item;
		}
		const [noItem, yesItem] = item.children ?? [];
		if (yesItem?.children) {
			const found = deepFindPathwaysItem(yesItem.children, search, path);
			if (found) return found;
		}
		if (noItem?.children) {
			const found = deepFindPathwaysItem(noItem.children, search, path);
			if (found) return found;
		}
	}

	return null;
}

function markPathwayItemsAsNo(items: PathwaysNestingItemResponse[]) {
	for (const item of items) {
		if (!item.response) item.response = 'NO';

		const [noItem, yesItem] = item.children ?? [];
		if (yesItem?.children) {
			markPathwayItemsAsNo(yesItem.children);
		}
		if (noItem?.children) {
			markPathwayItemsAsNo(noItem.children);
		}
	}
}

function formatResponse(items: PathwaysNestingWithInfo[]): PathwaysNestingItemResponse[] {
	return items.map((item) => {
		let text = item.text;
		if (item.problem) {
			text = `${item.problem.problemItemClean}`;
			if (item.problem.treatmentCode) {
				text += ` (TC=${item.problem.treatmentCode} )`;
			}
		} else {
			text = removeLastParentheses(text);
		}

		return {
			text,
			...(item.details && { details: item.details }),
			...(item.response && { response: item.response }),
			...(item.children && { children: formatResponse(item.children) }),
		};
	});
}

function removeLastParentheses(str: string): string {
	const regex = /\([^()]*\)$/;
	return str.replace(regex, '').trim();
}
