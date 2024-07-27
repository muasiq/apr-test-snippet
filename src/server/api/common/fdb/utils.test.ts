import { expect, it } from '@jest/globals';
import { extractDrugName, findClosestMatch } from './utils';

describe('fdb utils', () => {
	describe('findClosestMatch', () => {
		it('should return closest value', () => {
			const drugs = [
				{ id: '1', name: 'Protonix 60 mg capsule' },
				{ id: '2', name: 'Protonix 40 mg tablet' },
				{ id: '3', name: 'Protonix 50 mg tablet' },
				{ id: '4', name: 'Protonix 60 mg tablet' },
			];

			expect(findClosestMatch('Protonix 50 mg tablet', drugs, ['name'])).toEqual({
				match: drugs[2],
				key: 'name',
			});
			expect(findClosestMatch('Protonix 40 mg tablet', drugs, ['name'])).toEqual({
				match: drugs[1],
				key: 'name',
			});
			expect(findClosestMatch('Protonix capsule', drugs, ['name'])).toEqual({ match: drugs[0], key: 'name' });
		});
	});
	describe('extractDrugName', () => {
		it('should pull drug name before the number', () => {
			expect(extractDrugName('Protonix 50 mg tablet')).toEqual('Protonix');
			expect(extractDrugName('HumuLIN R U-500 KWIKPEN 500 UNIT/ML Sopn')).toEqual('HumuLIN R U-500 KWIKPEN');
			expect(extractDrugName('Protonix capsule')).toEqual('Protonix capsule');
		});
	});
});
