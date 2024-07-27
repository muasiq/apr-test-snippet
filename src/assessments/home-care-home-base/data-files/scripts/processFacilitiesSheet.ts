import { drive_v3 } from '@googleapis/drive';
import { Prisma, State } from '@prisma/client';
import { prisma } from '../../../../server/prisma';
import { getSheetData } from '../../../scripts/sheets';

type FacilityData = {
	'Facility Name': string;
	'Facility Type': string;
	Street: string;
	City: string;
	State: string;
	Zip: string;
	Phone: string;
	Fax: string;
};

export async function processFacilitiesSheet(orgId: number, file: drive_v3.Schema$File, tab = 'Sheet1') {
	const { rows } = await getSheetData<FacilityData>(file.id!, tab);
	const allData = rows.map((row) => row.toObject());
	const toCreate: Prisma.FacilityCreateManyInput[] = allData
		.filter((row) => row.State?.length === 2 && row.State !== '~ ')
		.map((row) => {
			return {
				organizationId: orgId,
				name: row['Facility Name']!,
				facilityType: row['Facility Type']!,
				street: row.Street!,
				city: row.City!,
				state: row.State as State,
				zip: row.Zip!,
				phone: row.Phone!,
				fax: row.Fax!,
			};
		});
	for (const item of toCreate) {
		console.log('upserting item', item.name);
		await prisma.facility.upsert({
			where: { organizationId_name: { name: item.name, organizationId: orgId } },
			create: item,
			update: item,
		});
	}

	await prisma.$disconnect();
}
