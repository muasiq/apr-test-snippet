import { Prisma } from '@prisma/client';

export type PatientArtifactWithParagraphs = Prisma.PatientArtifactGetPayload<{
	include: { patientDocumentArtifact: { include: { paragraphs: true } } };
}>;

export type PatientArtifactWithDocument = Prisma.PatientArtifactGetPayload<{
	include: { patientDocumentArtifact: true };
}>;
