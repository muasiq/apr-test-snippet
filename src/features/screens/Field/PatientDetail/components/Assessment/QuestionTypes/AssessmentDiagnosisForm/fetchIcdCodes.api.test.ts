import { expect, it } from '@jest/globals';
import { fetchIcdCodes } from './fetchIcdCodes';

describe('fetchIcdCodes', () => {
	it('should fetch ICD codes by term', async () => {
		const result = await fetchIcdCodes('Diabetes', 'name');
		expect(result.length).toBeGreaterThanOrEqual(100);
		expect(result.some((item) => item.code === 'E23.2' && item.name === 'Diabetes insipidus')).toBe(true);
	}, 10000);

	it('should fetch ICD codes by code', async () => {
		const result = await fetchIcdCodes('E08', 'code');
		expect(result.length).toBeGreaterThanOrEqual(7);
		expect(
			result.some(
				(item) =>
					item.code === 'E08.00' &&
					item.name ===
						'Diabetes mellitus due to underlying condition with hyperosmolarity without nonketotic hyperglycemic-hyperosmolar coma (NKHHC)',
			),
		).toBe(true);
	}, 10000);
});
