import { downloadAccentraConfiguration } from './accentra/downloadAccentraConfiguration';
import { downloadChoiceConfiguration } from './choice/downloadChoiceConfiguration';
import { downloadElaraConfiguration } from './elara/downloadElaraConfiguration';

async function main() {
	await downloadAccentraConfiguration();
	await downloadChoiceConfiguration();
	await downloadElaraConfiguration();
}

main().catch(console.error);
