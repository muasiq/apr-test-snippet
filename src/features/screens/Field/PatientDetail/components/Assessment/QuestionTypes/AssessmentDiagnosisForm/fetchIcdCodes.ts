export type ICDResponse = [number, string[], null, Array<[string, string]>];
export type ICDCodes = { code: string; name: string };

const ICD10_ENDPOINT = 'https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search';

export async function fetchIcdCodes(terms: string, type: 'code' | 'name', signal?: AbortSignal): Promise<ICDCodes[]> {
	if (!terms.trim().length) return [];
	const searchParams = new URLSearchParams();
	searchParams.set('df', 'code,name');
	searchParams.set('sf', type);
	searchParams.set('terms', terms.trim());
	searchParams.set('count', '500');
	const res = await fetch(`${ICD10_ENDPOINT}?${searchParams.toString()}`, {
		signal,
	});
	const data = (await res.json()) as ICDResponse;
	if (!res.ok) {
		return [];
	}
	const list = data[3];
	return list.map(([code, name]) => ({ code, name }));
}
