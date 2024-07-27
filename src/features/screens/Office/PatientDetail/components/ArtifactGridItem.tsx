import { Box, Grid, Skeleton, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Document, Thumbnail, pdfjs } from 'react-pdf';
import { RouterOutputs } from '~/common/utils/api';
import { useSignedUrl } from '~/features/screens/Field/PatientDetail/common/hooks/useSignedUrl';

type Props = {
	artifact: RouterOutputs['patientArtifact']['getAllSignedImageUrlsByIdAndTagname'][0];
	handleArtifactClick: (artifact: Props['artifact']) => void;
};

type ThumbnailProps = {
	artifact: Props['artifact'];
	handleImageLoad: () => void;
};

const ArtifactPdfThumbnail = ({ artifact, handleImageLoad }: ThumbnailProps) => {
	pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).toString();

	const { signedUrl, refetchSignedUrl } = useSignedUrl({ artifactId: artifact.id, artifactUrl: artifact.url });

	async function handleDocumentLoadError() {
		await refetchSignedUrl();
	}

	return (
		<Document file={signedUrl.url} onLoadSuccess={handleImageLoad} onLoadError={handleDocumentLoadError}>
			<Thumbnail pageNumber={1} width={350} onLoadError={handleImageLoad} />
		</Document>
	);
};

const ArtifactPreviewImage = ({ artifact, handleImageLoad }: ThumbnailProps) => {
	const isPdf = artifact.fileType.endsWith('pdf');

	return (
		<Box
			data-cy={'artifact-preview-image'}
			bgcolor={isPdf ? 'rgba(0, 0, 0, 0.3)' : 'white'}
			color={isPdf ? 'white' : 'inherit'}
			padding={0.5}
			borderRadius={2}
			width={350}
			height={350}
			sx={{
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			{isPdf ? (
				<>
					<Typography variant={'caption'}>{artifact.fileName}</Typography>
					<Box sx={{ width: '100%', height: '90%', overflow: 'hidden' }}>
						<ArtifactPdfThumbnail artifact={artifact} handleImageLoad={handleImageLoad} />
					</Box>
				</>
			) : (
				<Image
					src={artifact.url}
					alt={artifact.fileName}
					width={350}
					height={350}
					style={{
						objectFit: 'contain',
					}}
					onLoadingComplete={handleImageLoad}
					onError={handleImageLoad}
				/>
			)}
		</Box>
	);
};

export const ArtifactGridItem = ({ artifact, handleArtifactClick }: Props) => {
	const router = useRouter();
	const { split } = router.query as { split?: string };
	const [isLoadingImage, setIsLoadingImage] = useState(true);

	const handleImageLoad = () => {
		setIsLoadingImage(false);
	};

	return (
		<Grid item xs={12} sm={12} md={split === 'true' ? 12 : 6} lg={split === 'true' ? 12 : 4}>
			<Box
				display={'flex'}
				flexDirection={'column'}
				alignItems={'center'}
				border={'8px solid white'}
				borderRadius={2}
				bgcolor={'white'}
				sx={{
					cursor: 'pointer',
					boxShadow: '0px 4px 6px -1px rgba(59, 31, 43, 0.12)',
				}}
				onClick={() => handleArtifactClick(artifact)}
			>
				{isLoadingImage && (
					<Box position={'absolute'}>
						<Skeleton height={350} width={350} />
					</Box>
				)}
				<ArtifactPreviewImage artifact={artifact} handleImageLoad={handleImageLoad} />
			</Box>
			<Stack mt={1}>
				<Typography variant="caption" textAlign={'center'}>
					{artifact.fileName}
				</Typography>
			</Stack>
		</Grid>
	);
};
