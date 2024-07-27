import { drive_v3 } from '@googleapis/drive';
import { prisma } from '../../../../server/prisma';
import { getSheetData } from '../../../scripts/sheets';

type CodeData = {
	'Service Code': string;
	'Service Line': string;
	Discipline: string;
	'Visit Type': string;
	Description: string;
};

export async function processServiceCodesSheet(orgId: number, file: drive_v3.Schema$File, tab = 'Sheet1') {
	const { rows } = await getSheetData<CodeData>(file.id!, tab);
	const allData = rows.map((row) => row.toObject());
	const toCreate = allData
		.filter((row) => {
			const name = row['Service Code'];
			return name && name.length > 2;
		})
		.map((row) => {
			return {
				organizationId: orgId,
				code: row['Service Code']!,
				description: row.Description!,
				discipline: row.Discipline!,
				visitType: row['Visit Type']!,
				line: row['Service Line']!,
			};
		});
	const skilledNursingServiceCodes = toCreate.filter(
		(item) =>
			item.discipline.trim() === 'SN' &&
			item.line.trim() === 'HOME HEALTH' &&
			['MEDICAL TREATMENT', 'SUBSEQUENT'].includes(item.visitType),
	);
	const additionalServiceCodes = toCreate.filter(
		(item) => item.line.trim() === 'HOME HEALTH' && item.visitType.trim() === 'ADD-ON',
	);
	for (const item of skilledNursingServiceCodes) {
		const toInsert = { code: item.code.trim(), description: item.description.trim(), organizationId: orgId };
		console.log('upserting to sn codes', toInsert);
		await prisma.skilledNursingServiceCodes.upsert({
			where: { organizationId_code: { code: item.code, organizationId: orgId } },
			create: toInsert,
			update: toInsert,
		});
	}

	for (const item of additionalServiceCodes) {
		const toInsert = {
			code: item.code.trim(),
			description: item.description.trim(),
			organizationId: orgId,
			discipline: item.discipline.trim(),
		};
		console.log('upserting to other codes', toInsert);
		await prisma.additionalEvaluationServiceCodes.upsert({
			where: { organizationId_code: { code: item.code, organizationId: orgId } },
			create: toInsert,
			update: toInsert,
		});
	}

	await prisma.$disconnect();
}
