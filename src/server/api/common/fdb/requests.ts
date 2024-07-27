import { z } from 'zod';

import { createDispensableDrug } from '~/common/testUtils/entityBuilders/medication';
import logger from '~/common/utils/logger';
import { env } from '~/env.mjs';
import {
	clinicalQuantitiesResponseSchema,
	drugSearchResponseSchema,
	getDispensableDrugResponseSchema,
	screenResponseSchema,
} from './schema';
import { FDBSearchType } from './types';

const BASE_URL = 'https://api.fdbcloudconnector.com/CC/api';
const AUTH_SCHEME = 'SHAREDKEY';
const FDB_CLIENT_ID = env.FDB_API_CLIENT_ID;
const FDB_SECRET_KEY = env.FDB_API_SECRET_KEY;
const SYSTEM_NAME = 'Apricot';

const shouldMockApi = !FDB_CLIENT_ID;

// DispensableDrug: drug name, route, dose form, strength and strength unit of measure
// https://docs.fdbhealth.com/display/CCDOCUS/DispensableDrugs+-+REST
export async function searchDispensableDrugs({
	search,
	searchType = 'Exhaustive',
	limit = 100,
	offset = 0,
}: {
	search: string;
	searchType?: FDBSearchType;
	limit?: number;
	offset?: number;
}) {
	if (shouldMockApi) {
		return { offset: 0, limit: 100, total: 0, results: [] };
	}

	const params = new URLSearchParams({
		callSystemName: SYSTEM_NAME,
		searchType,
		searchText: search,
		limit: limit.toString(),
		offset: offset.toString(),
		// aligns with filters used in hchb
		SearchFilter: 'NOT GenericDrugNameCode: "0" AND NOT DrugNameSourceCode: "0"',
	});

	const res = await makeRequest({
		route: `/v1_3/DispensableDrugs/?${params.toString()}`,
		schema: drugSearchResponseSchema,
	});

	return {
		offset: res.offset,
		limit: res.limit,
		total: res.TotalResultCount,
		results: res.Items,
	};
}

export async function getDispensableDrug(id: string) {
	if (shouldMockApi) {
		return createDispensableDrug();
	}

	const params = new URLSearchParams({
		callSystemName: SYSTEM_NAME,
	});

	const res = await makeRequest({
		route: `/v1_3/DispensableDrugs/${id}?${params.toString()}`,
		schema: getDispensableDrugResponseSchema,
	});

	return res.DispensableDrug;
}

// https://docs.fdbhealth.com/display/CCDOCUS/Drug-Drug+Interaction+for+Screening+-+REST
type Drug = { DrugID: string; DrugConceptType: string };
export async function getDrugInteractions(drugs: Drug[], options: { severityFilter?: '1' | '2' | '3' } = {}) {
	if (shouldMockApi) {
		return { isSuccess: true, data: [] };
	}

	const body = {
		DDIScreenRequest: {
			ProspectiveOnly: false,
			SeverityFilter: '3',
			...options,
		},
		CallContext: {
			CallSystemName: SYSTEM_NAME,
		},
		ScreenProfile: {
			ScreenDrugs: drugs,
		},
	};

	const { DDIScreenResponse } = await makeRequest({
		route: `/v1_4/Screen`,
		options: { method: 'POST', body: JSON.stringify(body) },
		schema: screenResponseSchema,
	});

	return {
		isSuccess: DDIScreenResponse.IsSuccessful,
		data: DDIScreenResponse.DDIScreenResults,
		errors: DDIScreenResponse.Notes,
	};
}

export async function getClinicalQuantities(dispensibleDrugId: string) {
	if (shouldMockApi) {
		return { offset: 0, limit: 100, total: 0, results: [] };
	}

	const params = new URLSearchParams({
		callSystemName: SYSTEM_NAME,
	});

	const res = await makeRequest({
		route: `/v1_4/DispensableDrugs/${dispensibleDrugId}/ClinicalQuantities?${params.toString()}`,
		schema: clinicalQuantitiesResponseSchema,
	});

	return {
		offset: res.offset,
		limit: res.limit,
		total: res.TotalResultCount,
		results: res.Items,
	};
}

async function makeRequest<T extends z.ZodTypeAny>({
	route,
	options = {},
	schema,
}: {
	route: string;
	options?: object;
	schema: T;
}): Promise<z.infer<T>> {
	const url = `${BASE_URL}${route}`;
	const headers = {
		Authorization: `${AUTH_SCHEME} ${FDB_CLIENT_ID}:${FDB_SECRET_KEY}`,
		'Content-Type': 'application/json',
	};

	const response = await fetch(url, { method: 'GET', ...options, headers });
	if (!response.ok) {
		logger.error('fdb api error::', { response, service: 'fdb-api' });
		throw new Error(response.statusText);
	}

	const data = (await response.json()) as unknown;

	try {
		return schema.parse(data) as T;
	} catch (error) {
		logger.error('fdb api validation error', { data, error, service: 'fdb-api' });
		throw error;
	}
}
