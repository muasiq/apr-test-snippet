import { Box, Dialog, ImageList, ImageListItem, Typography } from '@mui/material';
import { PatientArtifactTag } from '@prisma/client';
import Image from 'next/image';
import { useState } from 'react';
import { RouterOutputs, api } from '~/common/utils/api';
import { ImagePickerButton } from '~/features/ui/buttons/ImagePickerButton';

type Props = {
	tagName: PatientArtifactTag;
	patientId: number;
	photosData: {
		data: RouterOutputs['patientArtifact']['getAllSignedImageUrlsByIdAndTagname'] | undefined;
		isLoading: boolean;
		error: ReturnType<typeof api.patientArtifact.getAllSignedImageUrlsByIdAndTagname.useQuery>['error'];
	};
};

export const PhotosTab = ({ tagName, patientId, photosData }: Props) => {
	const [photoPopoverUrl, setPhotoPopoverUrl] = useState<string | null>(null);

	const { data, isLoading, error } = photosData;

	if (isLoading) {
		return <Typography variant="body2">Loading...</Typography>;
	} else if (!data) {
		return <Typography variant="body2">No photos uploaded</Typography>;
	} else if (error) {
		return <Typography variant="body2">Error: {error.message}</Typography>;
	}

	return (
		<Box>
			<ImageList sx={{ width: '100%' }} rowHeight={300} gap={4} cols={4}>
				{data.map((photo) => (
					<ImageListItem key={photo.url} onClick={() => setPhotoPopoverUrl(photo.url)}>
						<Image objectFit="contain" sizes={'500px'} src={`${photo.url}`} alt={photo.fileName} fill />
					</ImageListItem>
				))}
			</ImageList>

			<ImagePickerButton patientId={patientId} tagName={tagName} />
			<Dialog
				maxWidth="xl"
				fullWidth={true}
				open={photoPopoverUrl !== null}
				onClose={() => setPhotoPopoverUrl(null)}
			>
				<Box height={'80vh'}>
					{photoPopoverUrl && (
						<Image sizes={'100vw'} objectFit="contain" fill src={photoPopoverUrl} alt={'image'} />
					)}
				</Box>
			</Dialog>
		</Box>
	);
};
