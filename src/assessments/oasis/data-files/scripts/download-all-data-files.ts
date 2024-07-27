import { writeDataFile } from '../../../home-care-home-base/data-files/scripts/util';

const homeCareHomeBaseDocId = '1KU8OKgs8HA4FzkjMlX_ektsIAkKwZkEJpNTdFzp0KGg';
const oasis = 'Oasis';

async function main() {
	await writeDataFile(homeCareHomeBaseDocId, oasis, 'src/assessments/oasis/data-files/oasis-e-new.json');
}

main().catch(console.error);
