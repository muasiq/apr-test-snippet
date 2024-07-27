import { Snackbar } from '@mui/material';
import { useEffect } from 'react';
import { useAlert } from '../../../common/hooks/useAlert';
import { useFileUpload } from '../../../common/hooks/useFileUpload';
import { FileToUploadWithId, useFileUploadStore } from '../../../common/hooks/useFileUploadStore';
import { pluralize } from '../../../common/utils/pluralize';
import { LoadingSpinner } from './LoadingSpinner';

export const FileUploadsManager = (): JSX.Element => {
	const alert = useAlert();
	const { files, removeFile } = useFileUploadStore();
	const { handleFileUpload } = useFileUpload();
	const numberOfFiles = files.length;

	useEffect(() => {
		const runUpload = async () => {
			if (!numberOfFiles) return;
			const [file] = files as [FileToUploadWithId];
			try {
				await handleFileUpload(file.file, file.patientId, file.tagName);
			} catch (e) {
				alert.addErrorAlert({ message: `Error uploading ${file.file.name} ` });
			}
			removeFile(file.id);
		};
		void runUpload();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [files, numberOfFiles, removeFile]);

	return (
		<>
			<Snackbar
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				open={numberOfFiles > 0}
				message={`Uploading ${numberOfFiles} ${pluralize('file', numberOfFiles)}`}
				action={<LoadingSpinner sx={{ mr: 2 }} positionAbsolute={false} size={25} />}
			/>
		</>
	);
};
