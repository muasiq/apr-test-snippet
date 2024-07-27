import { difference, isEqual } from 'lodash';

export function arrayDiff<T>(prev: T[], next: T[]) {
	const toRemove = difference(prev, next);
	const toAdd = difference(next, prev);

	return {
		removeItems: toRemove,
		removeIndices: toRemove.map((rmVal) => prev.findIndex((val) => isEqual(val, rmVal))),
		addItems: toAdd,
	};
}
