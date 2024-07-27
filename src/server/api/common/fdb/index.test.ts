import { expect, it } from '@jest/globals';
import logger from '~/common/utils/logger';
import { getDoseUnitOptions, getInteractions, resolveDispensableDrug } from '.';
import { DispensableDrug } from './types';

jest.mock('~/env.mjs', () => ({
	env: {
		FDB_API_CLIENT_ID: '123',
		FDB_API_SECRET_KEY: 'mock-secret',
	},
}));

const MOCK_DRUGS = [
	{
		DispensableGenericID: '4383',
		DispensableGenericDesc: 'aspirin 500 mg ORAL tablet, delayed release (enteric coated)',
		DispensableDrugID: '179458',
		DispensableDrugDesc: 'aspirin 500 mg tablet,delayed release',
		RouteDesc: 'oral',
		DoseFormDesc: 'tablet',
	},
	{
		DispensableGenericID: '4377',
		DispensableGenericDesc: 'aspirin 500 mg ORAL tablet',
		DispensableDrugID: '216092',
		DispensableDrugDesc: 'aspirin 500 mg tablet',
		RouteDesc: 'oral',
		DoseFormDesc: 'tablet',
	},
	{
		DispensableGenericID: '4490',
		DispensableGenericDesc: 'acetaminophen 500 mg ORAL tablet',
		DispensableDrugID: '227988',
		DispensableDrugDesc: 'Non-Aspirin Extra Strength 500 mg tablet',
		RouteDesc: 'oral',
		DoseFormDesc: 'powder',
	},
];

const MOCK_INTERACTIONS = {
	DDIScreenResponse: {
		DDIScreenResults: [
			{
				ScreenMessage:
					'Coumadin 6 mg tablet and acetaminophen 500 mg tablet may interact based on the potential interaction between SELECTED ANTICOAGULANTS and ACETAMINOPHEN.',
				ClinicalEffects: [
					{
						ClinicalEffectCode: 'INF',
						ClinicalEffectDesc: 'Increased effect of the former drug',
					},
				],
				InteractionDesc: 'SELECTED ANTICOAGULANTS/ACETAMINOPHEN',
				Severity: '3',
				ScreenDrug1: {
					DrugDose: null,
					Prospective: false,
					DrugDesc: 'Coumadin 6 mg tablet',
					DrugID: '196962',
					DrugConceptType: 3,
				},
				ScreenDrug2: {
					DrugDose: null,
					Prospective: false,
					DrugDesc: 'acetaminophen 500 mg tablet',
					DrugID: '206813',
					DrugConceptType: 3,
				},
				HasHumanClinicalTrial: true,
				HasCaseReports: true,
				HasMeetingAbstract: false,
				HasVitroOrAnimalStudy: false,
				HasMfgInfo: false,
				HasReview: true,
				MonographID: 1720,
				InteractionID: 1720,
				SeverityDesc: 'Moderate Interaction: Assess the risk to the patient and take action as needed. ',
				EDIPageReference: '04/021.00',
				ScreenDrugs: [
					{
						DrugDose: null,
						Prospective: false,
						DrugDesc: 'Coumadin 6 mg tablet',
						DrugID: '196962',
						DrugConceptType: 3,
					},
					{
						DrugDose: null,
						Prospective: false,
						DrugDesc: 'acetaminophen 500 mg tablet',
						DrugID: '206813',
						DrugConceptType: 3,
					},
				],
				ClinicalEffectsNarrative:
					'Concurrent use of routine acetaminophen, especially at dosages greater than 2 grams/day, and coumarin anticoagulants may result in elevated anticoagulant effects.',
			},
		],
		IsSuccessful: true,
	},
};

describe('FDB Api', () => {
	let fetchMock: jest.SpyInstance;
	let loggerMock: jest.SpyInstance;

	const mockResponse = (res: unknown) => {
		fetchMock.mockImplementationOnce(
			jest.fn(() =>
				Promise.resolve({
					ok: true,
					status: 200,
					json: () => Promise.resolve(res),
				}),
			) as jest.Mock,
		);
	};

	const getSearchDrugQS = (term: string) => {
		const qs = new URLSearchParams({ searchText: term });
		return qs.toString();
	};

	beforeEach(() => {
		fetchMock = jest.spyOn(global, 'fetch');
		loggerMock = jest.spyOn(logger, 'error');
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe('resolveDispensableDrug', () => {
		describe('success', () => {
			it('should return first drug entry', async () => {
				const search = 'ASPIRIN 500 MG TABLET';
				mockResponse({ offset: 0, limit: 100, TotalResultCount: 3, Items: MOCK_DRUGS });
				const res = await resolveDispensableDrug({ name: search });

				expect(fetchMock).toHaveBeenCalled();
				expect(fetchMock).toHaveBeenCalledWith(
					expect.stringContaining(getSearchDrugQS(search)),
					expect.objectContaining({ method: 'GET' }),
				);
				expect(loggerMock).not.toHaveBeenCalled();
				expect(res).toEqual(MOCK_DRUGS[1]);
			});

			it('should return undefined if medication is empty', async () => {
				const res = await resolveDispensableDrug({ name: '' });
				expect(res).toEqual(undefined);
			});

			it('should attempt broader searches if not found', async () => {
				mockResponse({ offset: 0, limit: 100, TotalResultCount: 0, Items: [] });
				mockResponse({ offset: 0, limit: 100, TotalResultCount: 0, Items: [] });
				mockResponse({
					offset: 0,
					limit: 100,
					TotalResultCount: 3,
					Items: MOCK_DRUGS,
				});

				const res = await resolveDispensableDrug({ name: 'ASPIRIN HCl 500 MG TABLET' });

				expect(fetchMock).toHaveBeenCalledTimes(3);
				expect(fetchMock).toHaveBeenNthCalledWith(
					1,

					expect.stringContaining(getSearchDrugQS('ASPIRIN HCl 500 MG TABLET')),
					expect.objectContaining({ method: 'GET' }),
				);
				expect(fetchMock).toHaveBeenNthCalledWith(
					2,
					expect.stringContaining(getSearchDrugQS('ASPIRIN HCl')),
					expect.objectContaining({ method: 'GET' }),
				);
				expect(fetchMock).toHaveBeenNthCalledWith(
					3,
					expect.stringContaining(getSearchDrugQS('ASPIRIN')),
					expect.objectContaining({ method: 'GET' }),
				);
				expect(res).toEqual(MOCK_DRUGS[1]);
			});

			it('should return undefined if broad search has no results', async () => {
				mockResponse({ offset: 0, limit: 100, TotalResultCount: 0, Items: [] });
				mockResponse({ offset: 0, limit: 100, TotalResultCount: 0, Items: [] });
				mockResponse({ offset: 0, limit: 100, TotalResultCount: 0, Items: [] });
				const res = await resolveDispensableDrug({ name: 'Drug Name 500 MG Tab' });
				expect(fetchMock).toHaveBeenCalledTimes(3);
				expect(res).toEqual(undefined);
			});
		});

		describe('fail', () => {
			it('should log api validation error and return undefined', async () => {
				const invalidDrug = { DispensableDrugID: 'invalid drug schema' };
				mockResponse({ offset: 0, limit: 100, TotalResultCount: 2, Items: [invalidDrug] });

				const res = await resolveDispensableDrug({ name: 'Aspirin' });

				expect(res).toBe(undefined);
				expect(loggerMock).toHaveBeenCalled();
			});

			it('should throw when request fails', async () => {
				fetchMock.mockImplementation(
					jest.fn(() => Promise.resolve({ ok: false, status: 401, statusText: 'Unauthorized' })),
				);

				const res = await resolveDispensableDrug({ name: 'Aspirin' });

				expect(res).toBe(undefined);
				expect(loggerMock).toHaveBeenCalled();
			});
		});
	});

	describe('getInteractions', () => {
		describe('success', () => {
			it('should return interactions', async () => {
				mockResponse(MOCK_INTERACTIONS);
				const res = await getInteractions(['206813', '196962']);

				expect(fetchMock).toHaveBeenCalled();
				const [url, options] = fetchMock.mock.calls[0] as [string, { body: string; method: string }];
				const body = JSON.parse(options.body) as object;

				expect(url).toEqual('https://api.fdbcloudconnector.com/CC/api/v1_4/Screen');
				expect(options.method).toEqual('POST');
				expect(body).toMatchObject({
					DDIScreenRequest: expect.objectContaining({ SeverityFilter: '3' }),
					ScreenProfile: {
						ScreenDrugs: expect.arrayContaining([
							{ DrugConceptType: 'DispensableDrug', DrugID: '206813' },
							{ DrugConceptType: 'DispensableDrug', DrugID: '196962' },
						]),
					},
				});

				expect(res).toEqual(
					expect.arrayContaining([
						expect.objectContaining({
							ScreenMessage:
								'Coumadin 6 mg tablet and acetaminophen 500 mg tablet may interact based on the potential interaction between SELECTED ANTICOAGULANTS and ACETAMINOPHEN.',
						}),
					]),
				);
			});
		});
	});

	describe('getDoseUnitOptions', () => {
		it.each([
			{
				name: 'aerosol',
				drug: { DispensableDrugID: '580991', DoseFormDesc: 'Aerosol, Spray' },
				units: ['puff', 'spray', 'Per instructions'],
			},
			{
				name: 'cream',
				drug: { DispensableDrugID: '580349', DoseFormDesc: 'Comb. Package, Cleanser and Cream' },
				units: ['cm', 'inch', 'Per instructions'],
			},
		])('should get units from custom map for: $name', async ({ drug, units }) => {
			const doseUnits = await getDoseUnitOptions(drug as DispensableDrug);
			expect(doseUnits).toEqual(units);
		});

		it.each([
			{
				name: 'auto-injector',
				drug: {
					DispensableDrugID: '275334',
					DispensableDrugDesc: 'epinephrine 0.3 mg/0.3 mL injection, auto-injector',
					MedStrengthUnit: 'mg/0.3 mL',
					DoseFormDesc: 'Auto-Injector',
				},
				quantities: [
					{
						ClinicalQuantityDesc: '2 auto-injector syringe',
						SubUnitOfMeasureDesc: 'auto-injector',
						PackageDesc: 'syringe',
					},
					{
						ClinicalQuantityDesc: '2 syringe',
						SubUnitOfMeasureDesc: 'syringe',
						PackageDesc: null,
					},
				],
				units: ['auto-injector', 'syringe', 'mg', 'Per instructions'],
			},
			{
				name: 'bandage',
				drug: {
					DispensableDrugID: '556969',
					DispensableDrugDesc: 'Icy Hot Medicated Sleeve 16 % bandage',
					MedStrengthUnit: '%',
					DoseFormDesc: 'Bandage',
				},
				quantities: [
					{
						ClinicalQuantityDesc: '3 bandage box',
						SubUnitOfMeasureDesc: 'bandage',
						PackageDesc: 'box',
					},
				],
				units: ['bandage', '%', 'Per instructions'],
			},
			{
				name: '% and mg',
				drug: {
					DispensableDrugID: '604655',
					DispensableDrugDesc: 'NOpioid-LMC Kit 7.5 mg-4 %-4 % combo pack, tablet and patch',
					MedStrengthUnit: '4 %-4 %',
					DoseFormDesc: 'Comb. Package, Tablet & Pad',
				},
				quantities: [
					{
						ClinicalQuantityDesc: '40 combination package, tablet and patch box',
						SubUnitOfMeasureDesc: 'combination package, tablet and patch',
						PackageDesc: 'box',
					},
				],
				units: ['combination package, tablet and patch', 'mg', '%', 'Per instructions'],
			},
			{
				name: '% in name an mg capitalized',
				drug: {
					DispensableDrugID: '150412',
					DispensableDrugDesc: 'Dianeal Low Calcium with 4.25% dextrose calcium 2.5 mEq/L-mag 0.5mEq/L',
					RouteDesc: 'intraperitoneal',
					MedStrengthUnit: 'Mg 0.5 mEq/L',
					DoseFormDesc: 'solution',
				},
				quantities: [
					{
						ClinicalQuantityDesc: '2000 mL flexible container',
						SubUnitOfMeasureDesc: 'mL',
						PackageDesc: 'flexible container',
					},
					{
						ClinicalQuantityDesc: '3000 mL flexible container',
						SubUnitOfMeasureDesc: 'mL',
						PackageDesc: 'flexible container',
					},
				],
				units: ['mL', 'Per instructions'],
			},
			{
				name: 'mcg DFE',
				drug: {
					DispensableDrugID: '615893',
					DispensableDrugDesc: 'Obstetrix DHA Prenatal Duo 29 mg iron-1,700 mcg DFE tablet, capsule DR',
					MedStrengthUnit: '1,700 mcg DFE',
					DoseFormDesc: 'Comb. Package, Tablet DR and Capsule DR',
					RouteDesc: 'oral',
				},
				quantities: [
					{
						ClinicalQuantityDesc: '60 each bottle',
						SubUnitOfMeasureDesc: 'each',
						PackageDesc: 'bottle',
					},
				],
				units: ['each', 'mg', 'mcg DFE', 'Per instructions'],
			},
			{
				name: 'mcg DFE name only',
				drug: {
					DispensableDrugID: '603014',
					DispensableDrugDesc: 'Nufola 25 mg-3,500 mcg DFE-1mg-300mg capsule',
					RouteDesc: 'oral',
					MedStrengthUnit: 'DFE-1 mg-300 mg',
					DoseFormDesc: 'capsule',
				},
				quantities: [
					{
						ClinicalQuantityDesc: 'capsule',
						SubUnitOfMeasureDesc: 'capsule',
						PackageDesc: null,
					},
				],
				units: ['capsule', 'mg', 'mcg DFE', 'Per instructions'],
			},
		])('should get units from clinical quantities for: $name', async ({ drug, quantities, units }) => {
			mockResponse({
				offset: 0,
				limit: 100,
				TotalResultCount: quantities.length,
				Items: quantities,
			});
			const doseUnits = await getDoseUnitOptions(drug as DispensableDrug);
			expect(doseUnits).toEqual(units);
		});
	});
});
