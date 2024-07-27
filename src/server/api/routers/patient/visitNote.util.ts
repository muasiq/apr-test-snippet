import { Patient } from '@prisma/client';
import { cloudStorage } from '../../common/gcp/cloudStorage';

export const VISIT_NOTE_TYPE = {
	visitNote: 'visitNote',
	visitNoteWithExplanations: 'visitNoteWithExplanations',
} as const;

export type VisitNoteType = (typeof VISIT_NOTE_TYPE)[keyof typeof VISIT_NOTE_TYPE];

export function getCloudStorageVisitNoteLocations(patientId: number) {
	const prefix = `patient-data/patient-${patientId}/visit-notes`;
	return [
		{
			type: VISIT_NOTE_TYPE.visitNote,
			path: `${prefix}/visit-note.pdf`,
			options: { includeExplanations: false },
			fileNamePrefix: 'Apricot SOC Visit Note',
		},
		{
			type: VISIT_NOTE_TYPE.visitNoteWithExplanations,
			path: `${prefix}/visit-note-with-explanations.pdf`,
			options: { includeExplanations: true },
			fileNamePrefix: 'Apricot SOC Visit Note with Explanations',
		},
	];
}

export async function visitNotesExist(patientId: number) {
	const bucket = cloudStorage.bucket();
	const locations = getCloudStorageVisitNoteLocations(patientId);

	const filesExist = await Promise.all(
		locations.map(async ({ path }) => {
			const [exists] = await bucket.file(path).exists();
			return exists;
		}),
	);

	return filesExist.every(Boolean);
}

export async function getVisitNoteUrls(patient: Patient) {
	const locations = getCloudStorageVisitNoteLocations(patient.id);
	const signedUrls = await Promise.all(
		locations.map(async ({ type, path, fileNamePrefix }) => {
			const fileName = getVisitNoteFileName(fileNamePrefix, patient);
			const url = await cloudStorage.createSignedURL(path, 'read', false, fileName);
			return { type, ...url };
		}),
	);
	return signedUrls;
}

export function getVisitNoteFileName(prefix: string, patient: Patient) {
	return `${prefix} - ${patient.lastName},${patient.firstName}.pdf`;
}
