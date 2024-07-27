import { isNaN } from 'lodash';

export const parseNumber = (numberStr?: string | null) => {
	const parsed = Number(numberStr);
	if (isNaN(parsed)) {
		return null;
	}
	return parsed;
};
