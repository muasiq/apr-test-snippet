import { expect, it } from '@jest/globals';
import { parseMedication } from './medication';

describe('parseMedication function', () => {
	it('should parse medication string with drug name and strength', () => {
		const medication = 'Amoxicillin 500 mg oral tablet';
		const expected = {
			drugName: 'Amoxicillin',
			strength: '500 mg',
			route: 'oral',
			form: 'tablet',
		};
		expect(parseMedication(medication)).toEqual(expected);
	});

	it('should parse medication string without route and form', () => {
		const medication = 'Ibuprofen 200 mg';
		const expected = {
			drugName: 'Ibuprofen',
			strength: '200 mg',
			route: undefined,
			form: undefined,
		};
		expect(parseMedication(medication)).toEqual(expected);
	});

	it('should parse medication string without strength', () => {
		const medication = 'Lisinopril oral tablet';
		const expected = {
			drugName: 'Lisinopril',
			strength: undefined,
			route: 'oral',
			form: 'tablet',
		};
		expect(parseMedication(medication)).toEqual(expected);
	});

	it('should parse medication string without drug name', () => {
		const medication = '20 mg oral tablet';
		const expected = {
			drugName: '',
			strength: '20 mg',
			route: 'oral',
			form: 'tablet',
		};
		expect(parseMedication(medication)).toEqual(expected);
	});

	it('should return undefined for empty string', () => {
		const medication = '';
		const expected = {
			drugName: '',
			strength: undefined,
			route: undefined,
			form: undefined,
		};
		expect(parseMedication(medication)).toEqual(expected);
	});
});
