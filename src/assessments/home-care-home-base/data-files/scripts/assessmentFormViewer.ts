import { drive_v3 } from '@googleapis/drive';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import { floor, last, uniqBy } from 'lodash';
import { getSheetData } from '../../../scripts/sheets';
import { cleanUpQuestionText, cleanUpResponseText, oasisItemToBeRemoved } from './text-cleanup/textCleanupUtils';
import { RowType, shortHash, uploadToSheet } from './util';

export type XMapConfig = Record<string, number>;

interface Response {
	answer: string;
	followUp: AssessmentFormViewer[];
}

export interface AssessmentFormViewer {
	header: string;
	type: RowType;
	responses: Response[];
}

interface FinalizedResponse {
	answer: string;
	followUp?: FinalizedAssessmentFormViewer[];
}

interface FinalizedAssessmentFormViewer {
	header: string;
	type: RowType;
	responses?: FinalizedResponse[];
}

interface FinalizedPhysicalAssessmentResponse {
	text: string;
	followUp?: string[];
}

interface FinalizedPhysicalAssessmentQuestion {
	id: string;
	questionType: string;
	originalText: string;
	cleanedText: string;
	responses?: FinalizedPhysicalAssessmentResponse[];
}

export async function createPhysicalAssessment(
	file: drive_v3.Schema$File,
	configFileId: string,
	htmlFilePath: string,
	xMap: XMapConfig,
	mode: 'PA' | 'OASIS' = 'PA',
) {
	const indentData = getFormRowsAndIndentLevel(htmlFilePath);
	const textIndentData = getTextEntriesIndentLevel(htmlFilePath);
	return await processAssessmentFormViewer(file, xMap, indentData, textIndentData, configFileId, mode);
}

interface IndentData {
	text: string;
	indentLevel: string | undefined;
}

interface TextWindow {
	previousCellValue: string;
	currentCellValue: string;
	nextCellValue: string;
}

async function processAssessmentFormViewer(
	file: drive_v3.Schema$File,
	xMap: XMapConfig,
	indentData: IndentData[],
	textIndentData: IndentData[],
	configFileId: string,
	mode: 'PA' | 'OASIS',
) {
	const { rows, sheet } = await getSheetData(file.id!, 'Assessment Form Viewer Report');
	const fileData: AssessmentFormViewer[] = [];
	let nestedWorkingList: AssessmentFormViewer[] = [];
	const usedDuplicateFormEntries: string[] = [];
	const usedDuplicateTextEntries: TextWindow[] = [];
	for (const row of rows) {
		const rowNumber = row.rowNumber;
		const cell = sheet.getCell(rowNumber - 1, 0);
		const cellValue = cell?.value as string;
		const format = cell.textFormat;
		const lastData = fileData[fileData.length - 1];
		const lastItem = last(nestedWorkingList);
		const nextCell = sheet.getCell(rowNumber, 0);
		const nextCellValue = nextCell?.value as string;
		const previousCell = sheet.getCell(rowNumber - 2, 0);
		const previousCellValue = previousCell?.value as string;
		if (format.bold) {
			const indentLevel = lookupIndentLevel(xMap, indentData, usedDuplicateFormEntries, cellValue);
			const type = matchType(cellValue);
			if (indentLevel === 0) {
				nestedWorkingList = [];
			} else {
				if (lastData) {
					if (!nestedWorkingList.includes(lastData)) {
						nestedWorkingList.push(lastData);
					}
				}
				nestedWorkingList.splice(indentLevel);
			}
			if (type === RowType.UNKNOWN) {
				continue;
			}

			if (nestedWorkingList.length > 0) {
				const lastItem = last(nestedWorkingList);
				if (lastItem) {
					const responsesLength = lastItem.responses.length;
					const newFollowUp = { header: cellValue, type, responses: [] };
					lastItem.responses[responsesLength - 1]?.followUp.push(newFollowUp);
					if (type === RowType.SELECT || type === RowType.MULTI_SELECT) {
						nestedWorkingList.push(newFollowUp);
					}
				}
			} else {
				fileData.push({ header: cellValue, type, responses: [] });
			}
		} else if (formMatch(cellValue)) {
			continue;
		} else if (cellValue.includes('*Effective From')) {
			continue;
		} else {
			if (lastData) {
				if (nestedWorkingList.length > 0) {
					if (!nextCellValue) {
						console.log(cellValue);
					}
					try {
						const { level, previousLevel } = lookupTextIndentLevel(
							textIndentData,
							cellValue.trim().replaceAll('\n', ''),
							nextCellValue?.trim()?.replaceAll('\n', ''),
							previousCellValue.trim().replaceAll('\n', ''),
							usedDuplicateTextEntries,
							xMap,
						);
						if (level !== previousLevel) {
							nestedWorkingList.splice(floor(level, 1));
							const newLastItem = last(nestedWorkingList);
							newLastItem?.responses.push({ answer: cellValue, followUp: [] });
						} else {
							lastItem?.responses.push({ answer: cellValue, followUp: [] });
						}
					} catch (error) {
						console.error(error);
					}
				} else {
					lastData.responses.push({ answer: cellValue, followUp: [] });
				}
			}
		}
	}
	analyzeFile(fileData);
	const flattened = createFlattenedFinalizedPhysicalAssessment(fileData, []);
	analyzeFlattened(flattened);
	const cleanedUp = flattened
		.map((d) => {
			const cleanedAnswers = d.responses ? cleanUpResponses(d.responses) : undefined;

			if (mode === 'PA') {
				if (oasisItemToBeRemoved(d.originalText)) return null;
				return { ...d, responses: cleanedAnswers, cleanedText: cleanUpQuestionText(d.originalText) };
			} else {
				if (oasisItemToBeRemoved(d.originalText))
					return { ...d, responses: cleanedAnswers, cleanedText: cleanUpQuestionText(d.originalText) };
				return null;
			}
		})
		.filter(<T>(r: T): r is NonNullable<T> => r !== null);
	if (mode === 'PA') {
		console.log('with removed length', cleanedUp.length);
		await uploadToSheet(configFileId, 'physical-assessment', cleanedUp);
	}

	return cleanedUp;
}

function cleanUpResponses(responses: FinalizedPhysicalAssessmentResponse[]) {
	const firstResponse = responses[0];
	if (!firstResponse) return responses;
	return responses
		.map((r) => {
			const cleanedText = cleanUpResponseText(r.text);
			return { text: r.text, cleanedText, followUp: r.followUp };
		})
		.toSorted((a, b) => {
			if (a.cleanedText === 'Other') return 1;
			if (b.cleanedText === 'Other') return -1;

			if (a.cleanedText === 'WNL') return -1;
			if (b.cleanedText === 'WNL') return 1;

			return 0;
		});
}

function analyzeFlattened(fileData: FinalizedPhysicalAssessmentQuestion[]) {
	const ids = fileData.map((d) => d.id);
	const followUpIds = fileData.flatMap((d) => d.responses?.flatMap((r) => r.followUp)).filter((f) => f) as string[];
	const allIdsValid = followUpIds.every((f) => ids.includes(f));
	const duplicatedIds = ids.filter((id) => ids.filter((i) => i === id).length > 1);
	const allIdsUnique = new Set(ids).size === ids.length;
	if (!allIdsValid || !allIdsUnique) {
		console.log({ duplicatedIds });
		console.error('invalid ids');
	}
}

function matchType(cellValue: string): RowType {
	if (cellValue.includes('TYPE: LIST - MULTISELECT: N')) return RowType.SELECT;
	if (cellValue.includes('TYPE: LIST - MULTISELECT: Y')) return RowType.MULTI_SELECT;
	if (cellValue.includes('TYPE: DATE - MULTISELECT: N')) return RowType.DATE;
	if (cellValue.includes('TYPE: TEXT - MULTISELECT: N')) return RowType.TEXT;
	if (cellValue.includes('TYPE: NUMERIC - MULTISELECT: N')) return RowType.NUMERIC;
	if (cellValue.includes('TYPE: UNKNOWN - MULTISELECT: N')) return RowType.UNKNOWN;
	if (cellValue.includes('TYPE: DIAGNOSES - MULTISELECT: N')) return RowType.TEXT;
	if (cellValue.includes('TYPE: VITAL SIGN HEIGHT - MULTISELECT: N')) return RowType.TEXT;
	if (cellValue.includes('VITAL SIGN WEIGHT - MULTISELECT: N')) return RowType.TEXT;
	console.error('no type found for ', cellValue);
	return RowType.TEXT;
}

function analyzeFile(fileData: FinalizedAssessmentFormViewer[]) {
	fileData.forEach((d) => {
		if (d.responses?.length === 0) {
			if (d.type === RowType.SELECT || d.type === RowType.MULTI_SELECT) {
				console.log('no responses for ', d.header);
			}
			delete d.responses;
		} else if (d.responses?.length === 1) {
			console.log('single response header', d.header);
		}
		d.responses?.forEach((r) => {
			if (r.followUp?.length) {
				analyzeFile(r.followUp);
			} else {
				delete r.followUp;
			}
		});
	});
}

function lookupTextIndentLevel(
	textIndentData: IndentData[],
	currentCellValue: string,
	nextCellValue: string,
	previousCellValue: string,
	usedDuplicateFormEntries: TextWindow[],
	xMap: XMapConfig,
): { level: number; previousLevel?: number } {
	let i = 0;
	const matches = [];
	for (const indent of textIndentData) {
		if (indent.text.trim().replaceAll('\n', '') === currentCellValue) {
			const previousIndent = textIndentData[i - 1];
			const nextIndent = textIndentData[i + 1];
			if (previousIndent && nextIndent) {
				if (
					previousIndent.text.trim().replaceAll('\n', '') === previousCellValue &&
					nextIndent.text.trim().replaceAll('\n', '') === nextCellValue
				) {
					if (indent.indentLevel && previousIndent.indentLevel) {
						const lookup = xMap[indent.indentLevel];
						if (!lookup) {
							console.log('no match');
							console.log({ indent });
							throw new Error('no match');
						}
						const previousLookup = xMap[previousIndent.indentLevel];
						if (!previousLookup) {
							console.log({ previousIndent: previousIndent.indentLevel, previousCellValue });
							console.error('no match');
							throw new Error('no match');
						}
						matches.push({ level: lookup, previousLevel: previousLookup });
					} else {
						console.log({ indent });
					}
				}
			} else {
				if ((nextCellValue === null || nextCellValue === undefined) && indent?.indentLevel) {
					const lookup = xMap[indent.indentLevel];
					return { level: lookup! };
				}
			}
		}
		i++;
	}
	if (!matches.length) {
		console.error('no match for ', { currentCellValue, previousCellValue, nextCellValue });
		throw new Error('no match');
	}
	if (matches.length > 1) {
		usedDuplicateFormEntries.push({ currentCellValue, previousCellValue, nextCellValue });
		const currentOne = usedDuplicateFormEntries.filter(
			(dup) =>
				dup.currentCellValue === currentCellValue &&
				dup.nextCellValue === nextCellValue &&
				dup.previousCellValue === previousCellValue,
		).length;
		return matches[currentOne - 1]!;
	}
	return matches[0]!;
}

function lookupIndentLevel(
	xMap: XMapConfig,
	indentData: IndentData[],
	usedDuplicateFormEntries: string[],
	cellValue?: string,
): number {
	if (!cellValue) {
		console.log('no cell value');
		return 0;
	}
	const formIndentLevelLookupMultiMatch = indentData.filter((i) => {
		const match = i.text.trim().replaceAll('\n', '') === cellValue.trim().replaceAll('\n', '');
		if (match) return match;
		return cellValue.replace('FORM: ', '') === i.text.trim();
	});
	if (formIndentLevelLookupMultiMatch.length > 1) {
		usedDuplicateFormEntries.push(cellValue);
	}
	const usedAlready = usedDuplicateFormEntries.filter((c) => c === cellValue);
	const hasBeenUsed = usedAlready.length > 0;

	const formIndentLevelLookup =
		formIndentLevelLookupMultiMatch[
			hasBeenUsed ? usedAlready.length - 1 : formIndentLevelLookupMultiMatch.length - 1
		];
	if (formIndentLevelLookup?.indentLevel) {
		const numberIndent = xMap[formIndentLevelLookup.indentLevel];
		if (numberIndent === undefined) {
			console.log({ missingLookup: formIndentLevelLookup.indentLevel, cellValue });
		}
		return numberIndent ?? 0;
	} else {
		console.log({ missingLookup: formIndentLevelLookup, cellValue });
		return 0;
	}
}

function getFormRowsAndIndentLevel(htmlFilePath: string) {
	const assessmentPdf = fs.readFileSync(htmlFilePath, 'utf-8');
	const html = cheerio.load(assessmentPdf);
	const withIdent = html('body')
		.find('div.t')
		.filter((i, el) => {
			const element = html(el);
			const text = element.text();
			return text.includes('TYPE: ') || text.includes('FORM: ');
		})
		.map((i, el) => {
			const element = html(el);
			const fullText = element
				.parent()
				.children()
				.map((i, el) => {
					const element = html(el);
					return element.text();
				})
				.toArray()
				.join('');
			const parentAttributes = element.parent().attr();
			const allClasses = parentAttributes?.class?.split(' ') ?? [];
			const xItem = allClasses.find((c) => c.startsWith('x'));
			return { text: fullText, indentLevel: xItem };
		});
	const allData = withIdent.toArray();
	return allData;
}

function getTextEntriesIndentLevel(htmlFilePath: string) {
	const assessmentPdf = fs.readFileSync(htmlFilePath, 'utf-8');
	const html = cheerio.load(assessmentPdf);
	const withIdent = html('body')
		.find('div.t')
		.filter((i, el) => {
			const element = html(el);
			const text = element.text();
			return !(
				text.includes('Powered by Homecare Homebase') ||
				text.includes('Assessment Form Viewer Report') ||
				(text.includes('Page ') && text.includes(' of '))
			);
		})
		.map((i, el) => {
			const element = html(el);
			const fullText = element
				.parent()
				.children()
				.map((i, el) => {
					const element = html(el);
					return element.text();
				})
				.toArray()
				.join('');
			const parentAttributes = element.parent().attr();
			const allClasses = parentAttributes?.class?.split(' ') ?? [];
			const xItem = allClasses.find((c) => c.startsWith('x'));
			return { text: fullText, indentLevel: xItem };
		});
	const allData = withIdent.toArray();
	const deDupedList = [];
	let i = 0;
	for (const data of allData) {
		const previousCell = allData[i - 1];
		if (previousCell && data.indentLevel === previousCell.indentLevel && data.text === previousCell.text) {
		} else {
			deDupedList.push(data);
		}
		i++;
	}
	return deDupedList;
}

function formMatch(cellValue?: string): boolean {
	if (!cellValue) return false;
	return cellValue.startsWith('FORM: '); // && (cellValue.includes('Q: ') || cellValue.includes('A: '));
}

function createFlattenedFinalizedPhysicalAssessment(
	data: AssessmentFormViewer[],
	finalList: FinalizedPhysicalAssessmentQuestion[],
): FinalizedPhysicalAssessmentQuestion[] {
	const newFinalList = recursiveFlattenPhysicalAssessment(data, finalList);
	const duplicateOriginalTextItems = newFinalList.filter((item) => {
		const dupeList = newFinalList.filter((i) => i.originalText === item.originalText);
		const hasDupes = dupeList.length > 1;
		const hasDifferentResponses = dupeList.some((i) => i.responses?.length !== item.responses?.length);
		return hasDupes && hasDifferentResponses;
	});
	// console.log({ duplicateOriginalTextItems });
	const uniqueFinal = uniqBy(newFinalList, 'originalText');
	console.log({ originalLength: newFinalList.length, uniqueLength: uniqueFinal.length });
	return uniqueFinal;
}

function recursiveFlattenPhysicalAssessment(
	data: AssessmentFormViewer[],
	finalList: FinalizedPhysicalAssessmentQuestion[],
): FinalizedPhysicalAssessmentQuestion[] {
	if (!data?.length) return finalList;
	const topLevel = data.map((topLevelQuestions) => {
		const responses = topLevelQuestions.responses?.map((response) => {
			const followUps = response.followUp?.map((fu) => physicalAssessmentShortHash(fu.header));
			return {
				text: response.answer,
				...(followUps?.length ? { followUp: followUps } : {}),
			};
		});
		const cleanedText = cleanHeader(topLevelQuestions.header);
		if (
			topLevelQuestions.type !== RowType.DATE &&
			(cleanedText.endsWith('DATE:') || cleanedText.startsWith('INDICATE DATE'))
		) {
			topLevelQuestions.type = RowType.DATE;
		}
		return {
			id: physicalAssessmentShortHash(topLevelQuestions.header),
			questionType: topLevelQuestions.type,
			originalText: topLevelQuestions.header,
			cleanedText,
			...(responses?.length ? { responses } : {}),
		};
	});
	const followUps = data
		.flatMap((topLevelQuestions) => {
			return topLevelQuestions.responses?.flatMap((response) => {
				return response.followUp?.flatMap((followUp) => {
					return followUp;
				});
			});
		})
		.filter((f) => f);
	const newFinalList = [...finalList, ...topLevel];
	return recursiveFlattenPhysicalAssessment(followUps, newFinalList);
}

// no longer doing this since we don't reference them in metadata files anyways
// function removeOasisItems(items: FinalizedPhysicalAssessmentQuestion[]) {
// 	console.log('Removing oasis items ====================');
// 	const withoutOasis = items.filter((item) => {
// 		const match = /^\(.*\).*/;
// 		const headerMatch = item.originalText.match(match);
// 		if (headerMatch) {
// 			console.log(item.originalText);
// 			return false;
// 		}
// 		return true;
// 	});
// 	console.log('=================== Removing oasis items');
// 	return withoutOasis;
// }

function physicalAssessmentShortHash(s: string) {
	return `PA-${shortHash(s)}`;
}

function cleanHeader(header: string): string {
	const indexOfType = header.indexOf(' TYPE: ');
	return header.slice(0, indexOfType);
}
