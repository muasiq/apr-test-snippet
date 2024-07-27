import { makeFile } from '../util';

const superDuperConfig = '1bCxofvKQYWhyjcdWCsl9tiA33_eqEh2BH0D3HnMORj8';

export async function downloadAccentraConfiguration() {
	await makeFile(superDuperConfig, 'physical-assessment', 'accentra');
	await makeFile(superDuperConfig, 'soc-standard-assessment', 'accentra');
}
