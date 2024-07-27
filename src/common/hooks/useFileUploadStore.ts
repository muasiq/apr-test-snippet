import { PatientArtifactTag } from '@prisma/client';
import { v4 } from 'uuid';
import { create } from 'zustand';

interface FileToUpload {
	file: File;
	patientId: number;
	tagName: PatientArtifactTag;
}
export type FileToUploadWithId = FileToUpload & { id: string };

interface FileUploadState {
	files: FileToUploadWithId[];
	addFiles: (files: FileToUpload[]) => void;
	removeFile: (id: string) => void;
}

export const useFileUploadStore = create<FileUploadState>((set) => ({
	files: [],
	addFiles: (files: FileToUpload[]) =>
		set((state) => {
			const filesWithId = files.map((file) => ({ ...file, id: v4() }));
			return { files: [...state.files, ...filesWithId] };
		}),
	removeFile: (id: string) => set((state) => ({ files: state.files.filter((file) => file.id !== id) })),
}));
