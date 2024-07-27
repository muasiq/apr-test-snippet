import { PatientArtifactStatus, PatientArtifactTag, PatientAuditLogAction } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { sub } from 'date-fns';
import logger from '~/common/utils/logger';
import { Prisma } from '../../../prisma';
import { cloudDocumentAI } from '../../common/gcp/cloudDocumentAI';
import { cloudStorage } from '../../common/gcp/cloudStorage';
import { PermissionedTRPCContext } from '../../trpc';
import { createAuditLog } from '../auditLog/auditLog.service';
import * as patientService from '../patient/patient.service';
import * as patientArtifactInputs from './patientArtifact.inputs';
import { patientArtifactRepo } from './patientArtifact.repo';
import { PatientArtifactWithDocument } from './patientArtifact.types';
import { patientDocumentArtifactRepo } from './patientDocumentArtifact.repo';

const MAX_CONCURRENT_DOCUMENTS_PROCESSING = 5;
const MAX_EXTRACTION_ATTEMPTS = 3;

async function callBatchProcessDocuments(artifactId: number, ctx: PermissionedTRPCContext) {
	const patientArtifact = await patientArtifactRepo.findFirstOrThrow(ctx, {
		where: { id: artifactId },
		include: {
			patient: {
				include: {
					Organization: true,
				},
			},
		},
	});

	const extractedLocationName = `patient-artifact/${patientArtifact.patient.Organization.name}/patient-${patientArtifact.patientId}/${patientArtifact.tagName}/artifact-${patientArtifact.id}/extracted-documents/`;

	const documentExtractionOutputLocation = cloudStorage.location(extractedLocationName);

	return await patientArtifactRepo.update(ctx, {
		where: { id: patientArtifact.id },
		data: {
			patientDocumentArtifact: {
				create: {
					documentExtractionOutputLocation: documentExtractionOutputLocation,
					status: PatientArtifactStatus.ExtractionNotStarted,
				},
			},
		},
		include: {
			patientDocumentArtifact: true,
		},
	});
}

export const processQueuedArtifacts = async (prisma: Prisma) => {
	const alreadyProcessingDocs = await prisma.patientArtifact.count({
		where: {
			patientDocumentArtifact: {
				status: PatientArtifactStatus.ExtractionStarted,
				updatedAt: {
					gte: sub(new Date(), { minutes: 15 }),
				},
			},
		},
	});
	if (alreadyProcessingDocs) {
		return;
	}
	const queuedArtifacts = await prisma.patientArtifact.findMany({
		where: {
			patientDocumentArtifact: {
				status: {
					in: [PatientArtifactStatus.ExtractionNotStarted, PatientArtifactStatus.ExtractionFailed],
				},
				extractionAttempts: {
					lte: MAX_EXTRACTION_ATTEMPTS,
				},
			},
		},
		take: MAX_CONCURRENT_DOCUMENTS_PROCESSING,
		include: {
			patientDocumentArtifact: true,
		},
	});
	queuedArtifacts.forEach((artifact) => OCRDocument(artifact, prisma));
};

const OCRDocument = async (artifact: PatientArtifactWithDocument, prisma: Prisma) => {
	if (!artifact.patientDocumentArtifact) {
		throw new Error(`No patientDocumentArtifact found for artifact: ${artifact.id}`);
	}
	try {
		logger.info('Marked artifact document as started id=', artifact.id);
		await prisma.patientArtifact.update({
			where: { id: artifact.id },
			data: {
				patientDocumentArtifact: {
					update: {
						status: PatientArtifactStatus.ExtractionStarted,
					},
				},
			},
		});

		const { rawText, outputName, paragraphs } = await cloudDocumentAI.processDocument(artifact);

		await prisma.patientDocumentArtifact.update({
			where: { id: artifact.patientDocumentArtifact.id },
			data: {
				patientArtifactId: artifact.id,
				documentRawText: rawText,
				documentExtractionOutputLocation: outputName,
				status: PatientArtifactStatus.ExtractionCompleted,
				extractionAttempts: { increment: 1 },
				paragraphs: {
					create: paragraphs,
				},
			},
		});

		logger.info('Marked artifact document as completed id=', artifact.id);
	} catch (e: unknown) {
		logger.error(`Error processing document id: ${artifact.id}`, e);
		logger.info(JSON.stringify(e));
		await prisma.patientDocumentArtifact.update({
			where: { id: artifact.patientDocumentArtifact.id },
			data: {
				status: PatientArtifactStatus.ExtractionFailed,
				extractionAttempts: { increment: 1 },
			},
		});
	}
};

export const deleteArtifact = async (
	{ artifactId }: patientArtifactInputs.DeleteArtifact,
	ctx: PermissionedTRPCContext,
) => {
	const result = await patientArtifactRepo.delete(ctx, {
		where: {
			id: artifactId,
		},
	});
	if (!result) {
		throw new Error('You are not allowed to delete this artifact');
	}
	return result;
};

export const getAllSignedImageUrlsByPatientId = async (
	{ patientId, tagName, viewOnly }: patientArtifactInputs.GetAllSignedImageUrlsByIdAndTagnameInput,
	ctx: PermissionedTRPCContext,
) => {
	const artifacts = await patientArtifactRepo.findMany(ctx, {
		where: { patientId, tagName, uploadFinalized: true },
		select: {
			id: true,
			fileName: true,
			fileType: true,
			cloudStorageLocation: true,
			userThatUploadedId: true,
			attachmentType: true,
		},
	});

	const urlData = await Promise.all(
		artifacts
			.filter((p) => p.cloudStorageLocation)
			.map(async (photo) => {
				const url = await cloudStorage.createSignedURL(
					photo.cloudStorageLocation!,
					'read',
					viewOnly,
					photo.fileName,
				);
				return { ...photo, url: url.signedUrl, expires: url.expires };
			}),
	);

	return urlData;
};

export const getSignedImageUrlById = async (
	{ id, viewOnly }: patientArtifactInputs.GetSignedImageUrlByIdInput,
	ctx: PermissionedTRPCContext,
) => {
	const photo = await patientArtifactRepo.findFirstOrThrow(ctx, {
		where: {
			id,
		},
	});
	if (!photo.cloudStorageLocation) {
		logger.error('No cloud storage location found for photo', photo.id);
		throw new Error('No cloud storage location found for photo');
	}

	const { signedUrl } = await cloudStorage.createSignedURL(
		photo.cloudStorageLocation,
		'read',
		viewOnly,
		photo.fileName,
	);
	return { ...photo, signedUrl };
};

const createPatientArtifact = async (
	input: patientArtifactInputs.CreatePatientArtifactInput,
	ctx: PermissionedTRPCContext,
) => {
	const { patientId, fileName, tagName, fileType } = input;
	const patient = await patientService.getPatientById(patientId, ctx, { Organization: true });

	const artifact = await patientArtifactRepo.create(ctx, {
		data: {
			patientId,
			fileName,
			tagName,
			fileType,
			uploadFinalized: false,
			userThatUploadedId: ctx.session.user.id,
		},
		select: {
			id: true,
		},
	});

	const cloudStorageLocation = `patient-artifact/${patient.Organization.name}/patient-${patientId}/${tagName}/artifact-${artifact.id}/${fileName}`;

	void createAuditLog(
		{
			patientId,
			payload: input,
			action: PatientAuditLogAction.UPLOAD_ARTIFACT,
		},
		ctx,
	);

	return await patientArtifactRepo.update(ctx, {
		where: {
			id: artifact.id,
		},
		data: {
			cloudStorageLocation,
		},
	});
};

export const saveArtifactRelevantPages = async (
	{ relevantPages, artifactId }: patientArtifactInputs.SaveArtifactRelevantPagesInput,
	ctx: PermissionedTRPCContext,
) => {
	const artifact = await patientArtifactRepo.findFirstOrThrow(ctx, {
		where: {
			id: artifactId,
		},
		include: {
			patientDocumentArtifact: true,
		},
	});

	if (!artifact.patientDocumentArtifact?.id) {
		throw new Error(`Patient artifact ${artifactId} does not have a patient document artifact id`);
	}

	return await patientDocumentArtifactRepo.update(ctx, {
		where: {
			id: artifact.patientDocumentArtifact.id,
		},
		data: {
			relevantPages,
		},
	});
};

export const saveArtifactRelevantMedPages = async (
	{ relevantMedPages, artifactId }: patientArtifactInputs.SaveArtifactRelevantMedPagesInput,
	ctx: PermissionedTRPCContext,
) => {
	const artifact = await patientArtifactRepo.findFirstOrThrow(ctx, {
		where: {
			id: artifactId,
		},
		include: {
			patientDocumentArtifact: true,
		},
	});

	if (!artifact.patientDocumentArtifact?.id) {
		throw new Error(`Patient artifact ${artifactId} does not have a patient document artifact id`);
	}

	return await patientDocumentArtifactRepo.update(ctx, {
		where: {
			id: artifact.patientDocumentArtifact.id,
		},
		data: {
			relevantMedPages,
		},
	});
};

export async function finalizeArtifactUpload(
	{ artifactId }: patientArtifactInputs.FinalizeArtifactUploadInput,
	ctx: PermissionedTRPCContext,
) {
	const updated = await patientArtifactRepo.update(ctx, {
		where: {
			id: artifactId,
		},
		data: {
			uploadFinalized: true,
		},
	});
	const tagName = updated.tagName;
	if ((updated && tagName === PatientArtifactTag.ReferralDocument) || tagName === PatientArtifactTag.Medication) {
		return await callBatchProcessDocuments(artifactId, ctx);
	}
	return updated;
}

export const createPatientArtifactAndGenerateSignedUrl = async (
	input: patientArtifactInputs.CreateArtifactAndGenerateSignedUrlInput,
	ctx: PermissionedTRPCContext,
) => {
	const { cloudStorageLocation, id } = await createPatientArtifact(input, ctx);

	if (!cloudStorageLocation) {
		throw new TRPCError({
			code: 'INTERNAL_SERVER_ERROR',
			message: 'Failed to create patient artifact',
		});
	}

	try {
		const url = await cloudStorage.createSignedURL(cloudStorageLocation, input.action);
		return {
			signedUrl: url.signedUrl,
			id,
		};
	} catch (e: unknown) {
		logger.error('error creating signed url', e);
		await patientArtifactRepo.delete(ctx, { where: { id } });
		throw e;
	}
};

export const updateArtifact = async (
	input: patientArtifactInputs.PatientArtifactUpdateInput,
	ctx: PermissionedTRPCContext,
) => {
	const { artifactId, attachmentTypeId, fileName } = input;
	return await patientArtifactRepo.update(ctx, {
		where: { id: artifactId },
		data: { attachmentTypeId, fileName },
	});
};
