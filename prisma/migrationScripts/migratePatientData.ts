// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// async function copyPayorSources() {
// 	const sources = await prisma.payorSource.findMany({
// 		include: {
// 			Patient: true,
// 		},
// 	});
// 	for (const source of sources) {
// 		if (source.Patient?.id) {
// 			const result = await prisma.patientPayorSource.create({
// 				data: {
// 					id: source.id,
// 					patientId: source.Patient.id,
// 					payorSourceName: source.payorSourceName,
// 					payorSourceType: source.payorSourceType,
// 					payorSourceIdentifier: source.payorSourceIdentifier,
// 				},
// 			});
// 			console.log(result);
// 		}
// 	}
// }

// async function main() {
// 	// await copyPayorSources();
// 	console.log('Patient migration script started.');
// 	const patients = await prisma.patient.findMany({ include: {} });

// 	console.log('Patients found:', patients.length);

// 	for (const patient of patients) {
// 		const { primaryDiagnosis } = patient;
// 		if (primaryDiagnosis) {
// 			console.log('updating patient', patient.id, primaryDiagnosis);

// 			try {
// 				await prisma.patient.update({
// 					where: { id: patient.id },
// 					data: {
// 						PrimaryDiagnosis: { create: { description: primaryDiagnosis } },
// 					},
// 				});

// 				// await prisma.patient.update({
// 				// 	where: { id: patient.id },
// 				// 	data: { payorSourceId: null, primaryDiagnosis: null },
// 				// });
// 			} catch (e) {
// 				console.error('Error updating patient', patient.id, e);
// 			}
// 		}
// 	}
// 	console.log('Patient migration script finished.');

// 	// const secondaryDiagnoses = await prisma.secondaryDiagnoses.findMany({});
// 	// console.log('Secondary diagnoses found:', secondaryDiagnoses.length);

// 	// for (const secondaryDiagnosis of secondaryDiagnoses) {
// 	// 	const { diagnosis } = secondaryDiagnosis;
// 	// 	await prisma.secondaryDiagnoses.update({
// 	// 		where: { id: secondaryDiagnosis.id },
// 	// 		data: {
// 	// 			diagnosis: null,
// 	// 			description: diagnosis,
// 	// 		},
// 	// 	});
// 	// }
// 	console.log('Secondary diagnoses migration script finished.');
// }

// main()
// 	.then(async () => {
// 		await prisma.$disconnect();
// 	})
// 	.catch(async (e) => {
// 		console.error(e);
// 		await prisma.$disconnect();
// 		process.exit(1);
// 	});
