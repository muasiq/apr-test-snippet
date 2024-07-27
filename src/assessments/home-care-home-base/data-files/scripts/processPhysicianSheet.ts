import { drive_v3 } from '@googleapis/drive';
import { Prisma } from '@prisma/client';
import { prisma } from '../../../../server/prisma';
import { getSheetData } from '../../../scripts/sheets';

type PhysicianData = {
	'Physician Name': string;
};

export async function processPhysicianSheet(orgId: number, file: drive_v3.Schema$File, tab = 'Sheet1') {
	const { rows } = await getSheetData<PhysicianData>(file.id!, tab);
	const allData = rows.map((row) => row.toObject());
	const toCreate: Prisma.AssociatedPhysicianCreateManyInput[] = allData
		.filter((row) => {
			const name = row['Physician Name'];
			return name && name.length > 2;
		})
		.map((row) => {
			return {
				organizationId: orgId,
				name: row['Physician Name']!,
			};
		});
	for (const item of toCreate) {
		console.log('upserting item', item.name);
		await prisma.associatedPhysician.upsert({
			where: { organizationId_name: { name: item.name, organizationId: orgId } },
			create: item,
			update: item,
		});
	}

	await prisma.$disconnect();
}
