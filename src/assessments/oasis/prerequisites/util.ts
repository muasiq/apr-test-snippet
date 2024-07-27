import { Configuration } from '../../configurations';
import { lookupQuestion } from '../../util/lookupQuestionUtil';

export function satisifedPreReq(id: string, configuration: Configuration, codes: string[], answer: string): boolean {
	const lookup = lookupQuestion(id, configuration);
	const responses = lookup.responses?.filter((r) => codes.includes(r.code ?? ''));
	const satisfied = !!responses?.find((r) => r.text.toLowerCase() === answer.toLowerCase());
	return satisfied;
}
