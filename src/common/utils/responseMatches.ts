import { isArray } from 'lodash';

export const responseMatches = (
	choice: (string | number | null | undefined)[] | string | number | null | undefined,
	text: string,
) => {
	if (choice === null || choice === undefined) return false;
	if (isArray(choice)) {
		return choice.some((c) => c?.toString()?.toLowerCase() === text.toString().toLowerCase());
	} else {
		return choice?.toString()?.toLowerCase() === text.toString().toLowerCase();
	}
};
