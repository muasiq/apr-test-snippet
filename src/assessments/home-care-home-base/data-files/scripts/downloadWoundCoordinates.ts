import * as fs from 'fs';
import { getSheetData } from '../../../scripts/sheets';

const sheetId = '1bmPo7jaD0Cwob_RoV405UYAVvtFCW7EOqYRe7fuuhKs';
const woundLocationPath = 'src/assessments/home-care-home-base/data-files/wound-location-coordinates.json';
const woundRegionPath = 'src/assessments/home-care-home-base/data-files/wound-region-coordinates.json';

async function main() {
	await downloadWoundLocation();
	await downloadWoundRegion();
}

async function downloadWoundLocation() {
	const tabName = 'HCHB Coordinates - Location';
	const sheetData = await getSheetData<LocationInterface>(sheetId, tabName);
	const toWrite = sheetData.rows.map((s) => {
		const allColumns = s.toObject();
		return {
			View: allColumns['HCHB View'],
			Region: allColumns['HCHB Region'],
			Location: allColumns['HCHB Location'],
			x: Number(allColumns.x),
			y: Number(allColumns.y),
		};
	});
	fs.writeFileSync(woundLocationPath, JSON.stringify(toWrite));
}

async function downloadWoundRegion() {
	const tabName = 'HCHB Coordinates - Region';
	const sheetData = await getSheetData<RegionInterface>(sheetId, tabName);
	const toWrite = sheetData.rows.map((s) => {
		const allColumns = s.toObject();
		return {
			View: allColumns['HCHB View'],
			Region: allColumns['HCHB Region'],
			x: Number(allColumns.x),
			y: Number(allColumns.y),
		};
	});
	fs.writeFileSync(woundRegionPath, JSON.stringify(toWrite));
}

interface LocationInterface {
	'HCHB View': string;
	'HCHB Region': string;
	'HCHB Location': string;
	x: string;
	y: string;
}

type RegionInterface = Omit<LocationInterface, 'HCHB Location'>;

main().catch(console.error);
