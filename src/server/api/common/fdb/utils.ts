import { max, maxBy, sortBy } from 'lodash';
import { stringSimilarity } from 'string-similarity-js';

export function findClosestMatch<T, K extends keyof T>(search: string, list: T[], keys: K[]) {
	if (list.length === 0 || keys.length === 0) return undefined;

	const sorted = sortBy(list, [(item) => max(keys.map((key) => stringSimilarity(search, item[key] as string)))]);

	const match = sorted[sorted.length - 1]!;
	const closestKey = findClosestKey(search, match, keys)!;

	return { match, key: closestKey };
}

function findClosestKey<T, K extends keyof T>(search: string, obj: T, keys: K[]): K | undefined {
	return maxBy(keys, (key) => stringSimilarity(search, obj[key] as string))!;
}

// match the part of the string before the first space + number
export function extractDrugName(input: string) {
	const match = input.match(/^(.*?)(?=\s+\d)/);
	return match?.[1]?.trim() ?? input;
}
