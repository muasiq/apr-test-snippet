import { FileCreateOptions, uploadConfigurationToSheets } from '../common/uploadConfigurationToSheets';
import { options } from './options';

async function main() {
	await uploadConfigurationToSheets([FileCreateOptions.PHYSICAL_ASSESSMENT], options);
}

main().catch(console.error);
