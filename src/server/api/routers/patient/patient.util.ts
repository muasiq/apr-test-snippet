/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

export const getCanAnswer = (questionId?: string, M0150?: string[] | null) => {
	if (!M0150 || !questionId) return false;
	switch (questionId) {
		case 'M0063':
			return M0150.some((code) => code === '01' || code === '02');
		case 'M0065':
			return M0150.some((code) => code === '03' || code === '04');
		case 'M0150_specify':
			return M0150.some((code) => code === '11');
		default:
			return false;
	}
};
