import { makeFile } from '../util';

const choiceSuperDuperConfig = '1SNz9JxhO-dN7WKOQgJuUhJF4bfQLqhthue6FQ1ZKIso';

export async function downloadChoiceConfiguration() {
	await makeFile(choiceSuperDuperConfig, 'physical-assessment', 'choice');
	await makeFile(choiceSuperDuperConfig, 'soc-standard-assessment', 'choice');
}
