import { useQuery } from '@tanstack/react-query';
import { fetchIcdCodes } from './fetchIcdCodes';

export function useFetchIcdCodes(codeInput: string, nameInput: string, enabled = true) {
	return useQuery(
		[codeInput, nameInput],
		({ signal }) => {
			const terms = codeInput.length ? codeInput : nameInput;
			const type: 'code' | 'name' = codeInput.length ? 'code' : 'name';
			return fetchIcdCodes(terms, type, signal);
		},
		{ enabled },
	);
}
