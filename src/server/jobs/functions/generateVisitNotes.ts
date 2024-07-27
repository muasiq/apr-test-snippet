import { Patient, PatientArtifactTag } from '@prisma/client';
import { type GetFunctionInput } from 'inngest';
import { getVisitNotePdfBuffer } from '~/assessments/apricot/visit-note';
import { SchemaAssessmentAnswer } from '~/common/types/AssessmentSuggestionAndChoice';
import { isPostSignOffStatus } from '~/common/utils/patientStatusUtils';
import { cloudStorage } from '~/server/api/common/gcp/cloudStorage';
import { resolveConfigurationTypes } from '~/server/api/routers/configuration/configuration.service';
import { PatientWithJoinsInclude } from '~/server/api/routers/patient/patient.types';
import { getCloudStorageVisitNoteLocations, getVisitNoteFileName } from '~/server/api/routers/patient/visitNote.util';
import { prisma } from '~/server/prisma';
import { EVENT } from '../events';
import { inngest } from '../inngest';

type EventArgs =
	| GetFunctionInput<typeof inngest, typeof EVENT.patientReadyForEMR>
	| GetFunctionInput<typeof inngest, typeof EVENT.patientVisitNoteRequested>;

export const generateVisitNotes = inngest.createFunction(
	{ id: 'generate-visit-notes', idempotency: 'event.data.patientId' },
	[{ event: EVENT.patientReadyForEMR }, { event: EVENT.patientVisitNoteRequested }],
	handler,
);

export async function handler({ event }: EventArgs) {
	const { patientId } = event.data;

	const fileUrls = await generateAndSaveVisitNotePdf({ patientId });

	return { status: 'success', filePaths: fileUrls.map((d) => d.path) };
}

async function generateAndSaveVisitNotePdf({ patientId }: { patientId: number }) {
	const patient = await prisma.patient.findUniqueOrThrow({
		where: { id: patientId },
		include: PatientWithJoinsInclude,
	});

	if (!isPostSignOffStatus(patient.status)) {
		throw new Error(`Can't generate visit notes for ${patient.id} with status ${patient.status}.`);
	}

	const configuration = resolveConfigurationTypes(
		await prisma.versionedConfiguration.findUniqueOrThrow({
			where: { id: patient.versionedConfigurationId },
		}),
	);
	const answers = (await prisma.assessmentAnswer.findMany({
		where: { patientId: patient.id },
	})) as SchemaAssessmentAnswer[];

	const bucket = cloudStorage.bucket();
	const locations = getCloudStorageVisitNoteLocations(patient.id);

	await Promise.all(
		locations.map(async ({ path, options }) => {
			const pdfBuffer = await getVisitNotePdfBuffer({ configuration, patientData: patient, answers, ...options });
			await bucket.file(path).save(pdfBuffer);
		}),
	);

	await upsertVisitNotePatientArtifacts({ patient });

	return locations;
}

async function upsertVisitNotePatientArtifacts({ patient }: { patient: Patient }) {
	const locations = getCloudStorageVisitNoteLocations(patient.id);
	const visitNoteArtifacts = await prisma.patientArtifact.findMany({
		where: {
			patientId: patient.id,
			tagName: PatientArtifactTag.VisitNote,
		},
	});

	const organization = await prisma.organization.findUniqueOrThrow({
		where: { id: patient.organizationId },
		include: { VisitNoteAttachmentType: true },
	});

	const visitNoteAttachmentTypeId = organization.VisitNoteAttachmentType?.id;

	return Promise.all(
		locations.map(async ({ path, fileNamePrefix }) => {
			const existingArtifact = visitNoteArtifacts.find((a) => a.cloudStorageLocation === path);

			const artifactArgs = {
				attachmentTypeId: visitNoteAttachmentTypeId,
				fileName: getVisitNoteFileName(fileNamePrefix, patient),
				fileType: 'application/pdf',
			};

			if (existingArtifact) {
				return prisma.patientArtifact.update({
					where: { id: existingArtifact.id },
					data: artifactArgs,
				});
			} else {
				return prisma.patientArtifact.create({
					data: {
						...artifactArgs,
						cloudStorageLocation: path,
						patientId: patient.id,
						tagName: PatientArtifactTag.VisitNote,
					},
				});
			}
		}),
	);
}
