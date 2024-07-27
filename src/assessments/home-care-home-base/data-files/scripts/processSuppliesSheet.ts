import { drive_v3 } from '@googleapis/drive';
import { Prisma } from '@prisma/client';
import { prisma } from '../../../../server/prisma';
import { getSheetData } from '../../../scripts/sheets';

type SupplyData = {
	'Supply Package': string;
	Supply: string;
	'Vendor Item Number': string;
};

export async function processSuppliesSheet(orgId: number, file: drive_v3.Schema$File, tab = 'Sheet1') {
	const { rows } = await getSheetData<SupplyData>(file.id!, tab);
	const allData = rows.map((row) => row.toObject());
	const toCreate: Prisma.SupplyCreateManyInput[] = allData
		.filter((row) => {
			const name = row['Supply Package'];
			return name && name.length > 2;
		})
		.map((row) => {
			return {
				organizationId: orgId,
				package: row['Supply Package']!,
				category: row.Supply!,
				vendor: row['Vendor Item Number']!,
			};
		});
	for (const item of toCreate) {
		await prisma.supply.upsert({
			where: { organizationId_package: { package: item.package, organizationId: orgId } },
			create: item,
			update: item,
		});
	}

	await prisma.$disconnect();
}
