import { Box, Typography } from '@mui/material';

import { PatientArtifactTag } from '@prisma/client';
import { useDropzone } from 'react-dropzone';
import { useFileUploadStore } from '../../../../../../common/hooks/useFileUploadStore';

type Props = {
	patientId: number;
	tagName: PatientArtifactTag;
};
export const UploadFileInput = ({ patientId, tagName }: Props) => {
	const { addFiles } = useFileUploadStore();

	const { getRootProps, getInputProps } = useDropzone({
		accept: {
			'application/pdf': ['.pdf'],
			'image/*': ['.jpg', '.jpeg', '.png'],
		},
		onDrop: (files) => addFiles(files.map((file) => ({ file, patientId, tagName }))),
	});

	return (
		<>
			<Box
				{...getRootProps()}
				sx={{
					mb: 2,
					flex: 1,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					padding: '20px',
					borderWidth: 2,
					borderRadius: 2,
					borderColor: '#eeeeee',
					borderStyle: 'dashed',
					backgroundColor: '#fafafa',
					color: '#bdbdbd',
					outline: 'none',
					transition: 'border .24s ease-in-out',
					cursor: 'pointer',
				}}
			>
				<input {...getInputProps()} />
				<Typography>Drag your files here, or click to select file</Typography>
			</Box>
		</>
	);
};
