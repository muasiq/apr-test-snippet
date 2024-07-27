import { PatientArtifactTag } from '@prisma/client';
import { api } from '~/common/utils/api';
import { trpc } from '../utils/trpc';
import { useAlert } from './useAlert';

/**
 * Hook to handle file uploads to GCP (Google Cloud Platform) for a specific patient.
 *
 * This hook simplifies the process of uploading files to GCP using signed URLs.
 *
 * @usage
 * 1. In your component, call `useFileUpload` to gain access to  `handleFileUpload`.
 * 2. Supply a `File` to `handleFileUpload` for the upload process.
 *
 */

export const useFileUpload = () => {
	const alert = useAlert();
	const trpcUtils = trpc.useUtils();
	const { mutateAsync: createArtifact } = api.patientArtifact.createArtifactAndGenerateSignedUrl.useMutation();
	const finalizeArtifactUploadMutation = api.patientArtifact.finalizeArtifactUpload.useMutation();

	const uploadFile = async (
		file: File,
		patientId: number,
		tagName: PatientArtifactTag,
	): Promise<{ response: boolean; id?: number }> => {
		try {
			const { signedUrl, id } = await createArtifact({
				patientId,
				fileName: file.name,
				action: 'write',
				tagName,
				fileType: file.type,
			});

			const response = await fetch(signedUrl, {
				method: 'PUT',
				body: file,
				headers: {
					'Content-Type': file.type,
				},
			});

			return {
				response: response.ok,
				id,
			};
		} catch (error) {
			alert.addErrorAlert({ message: `We ran into an issue uploading file: ${file.name}. Please try again.` });
			return {
				response: false,
			};
		}
	};

	const handleFileUpload = async (file: File, patientId: number, tagName: PatientArtifactTag) => {
		const { id, response } = await uploadFile(file, patientId, tagName);

		if (response && id) {
			await finalizeArtifactUploadMutation.mutateAsync({
				artifactId: id,
			});
			void trpcUtils.patient.getById.invalidate();
		}

		void trpcUtils.patientArtifact.getAllSignedImageUrlsByIdAndTagname.invalidate({
			patientId,
			tagName,
		});
	};

	return { handleFileUpload };
};
