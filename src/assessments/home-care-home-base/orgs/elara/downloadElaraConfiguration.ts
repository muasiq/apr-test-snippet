import { makeFile } from '../util';

const superDuperConfig = '1EUCnzwc4uHU9BTDBB0SAEKln8N4Pz26AWAkTm3iV8PE';
const driveFolderId = '1d4KfcfhLw3Hw1kMNgxEqKqG3OeEPkhY-';

export async function downloadElaraConfiguration() {
	await makeFile(superDuperConfig, 'physical-assessment', 'elara', driveFolderId);
	await makeFile(superDuperConfig, 'soc-standard-assessment', 'elara', driveFolderId);
}
