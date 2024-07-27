import { Add } from '@mui/icons-material';
import { Box, IconButton } from '@mui/material';
import { PatientArtifactTag } from '@prisma/client';
import { ChangeEvent, useRef } from 'react';
import { useFileUploadStore } from '../../../common/hooks/useFileUploadStore';

type Props = {
	patientId: number;
	tagName: PatientArtifactTag;
};
export const ImagePickerButton = ({ patientId, tagName }: Props) => {
	const { addFiles } = useFileUploadStore();

	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleUploadClick = () => {
		if (!fileInputRef.current) return;

		fileInputRef.current.click();
	};

	const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { files } = event.target;
		if (!files?.length) return;
		const filesToAdd = Array.from(files).map((file) => ({ file, patientId, tagName }));
		addFiles(filesToAdd);
	};

	return (
		<Box position={'fixed'} bottom={'32px'} left={'50%'} sx={{ transform: 'translateX(-50%)' }}>
			<IconButton
				data-cy="image-picker-button"
				onClick={handleUploadClick}
				size="large"
				sx={{
					bgcolor: 'primary.main',
					color: '#FFF',
					boxShadow:
						' 0px 3px 5px -1px rgba(0, 0, 0, 0.20), 0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12);',
					'&:hover': {
						transition: 'all 0.2s ease-in-out',
						bgcolor: 'primary.dark',
					},
				}}
			>
				<Add />
			</IconButton>
			<input
				multiple
				type="file"
				ref={fileInputRef}
				onChange={handleInputChange}
				style={{ display: 'none' }}
				accept="image/*,.pdf"
			/>
		</Box>
	);
};
