import { writeDataFile } from './util';

const homeCareHomeBaseDocId = '1KU8OKgs8HA4FzkjMlX_ektsIAkKwZkEJpNTdFzp0KGg';
const masterQuestionMap = 'MasterQuestionMap';
const pathways = 'Pathways';
const physicalAssessment = 'PhysicalAssessment';

async function main() {
	await writeDataFile(
		homeCareHomeBaseDocId,
		masterQuestionMap,
		'src/assessments/home-care-home-base/data-files/master-question-map-new.json',
	);
	await writeDataFile(
		homeCareHomeBaseDocId,
		pathways,
		'src/assessments/home-care-home-base/data-files/pathways-new.json',
	);
	await writeDataFile(
		homeCareHomeBaseDocId,
		physicalAssessment,
		'src/assessments/home-care-home-base/data-files/physical-assessment-new.json',
	);
}

main().catch(console.error);
