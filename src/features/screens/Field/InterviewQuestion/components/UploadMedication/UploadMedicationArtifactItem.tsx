import { Box, Checkbox, Grid, Skeleton, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import { Dispatch, SetStateAction, useState } from 'react';
import { RouterOutputs } from '~/common/utils/api';
import { CheckEmptyIcon } from '~/features/ui/icons/CheckEmptyIcon';
import { CheckFilledIcon } from '~/features/ui/icons/CheckFilledIcon';
import { UploadMedicationPdfPageSelect } from './UploadMedicationPdfPageSelect';
import { ArtifactDetails } from './UploadMedicationSelectArtifact';

type Props = {
	artifact: RouterOutputs['patientArtifact']['getAllSignedImageUrlsByIdAndTagname'][0];
	artifactDetails: ArtifactDetails | null;
	setArtifactDetails: Dispatch<SetStateAction<ArtifactDetails[]>>;
};

export const UploadMedicationArtifactItem = ({ artifact, artifactDetails, setArtifactDetails }: Props) => {
	const [isLoadingImage, setIsLoadingImage] = useState(true);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const handleImageLoadError = () => {
		setIsLoadingImage(false);
		console.error('error loading image', artifact.url);
	};

	const handleClick = () => {
		if (artifact.fileType.endsWith('pdf')) {
			setIsDialogOpen(true);
			return;
		}
		if (artifactDetails === null) {
			setArtifactDetails((prev) => [...prev, { id: artifact.id, artifactType: 'image' }]);
		} else {
			setArtifactDetails((prev) => prev.filter((a) => a.id !== artifact.id));
		}
	};

	const handlePdfPageClick = (pageNumber: number) => {
		setArtifactDetails((prev) => {
			const existingArtifactIndex = prev.findIndex((a) => a.id === artifact.id);
			if (existingArtifactIndex === -1) {
				return [...prev, { id: artifact.id, artifactType: 'pdf', relevantPages: [pageNumber] }];
			} else {
				const newState = [...prev];
				const existingArtifact = newState[existingArtifactIndex];
				if (!existingArtifact?.relevantPages) return prev;

				const existingPages = existingArtifact.relevantPages ?? [];
				const pageIndex = existingPages.indexOf(pageNumber);

				if (pageIndex === -1) {
					existingArtifact.relevantPages = [...existingPages, pageNumber];
				} else {
					const updatedPages = existingPages.filter((page) => page !== pageNumber);
					if (updatedPages.length === 0) {
						newState.splice(existingArtifactIndex, 1);
					} else {
						existingArtifact.relevantPages = updatedPages;
					}
				}
				return newState;
			}
		});
	};

	return (
		<>
			<UploadMedicationPdfPageSelect
				key={artifact.id}
				isDialogOpen={isDialogOpen}
				setIsDialogOpen={setIsDialogOpen}
				signedUrl={artifact.url}
				artifactDetails={artifactDetails}
				handlePdfPageClick={handlePdfPageClick}
			/>
			<Grid item xs={12} sm={12} md={6} lg={4}>
				<Box
					data-cy="select-referral-for-meds"
					position="relative"
					borderRadius={2}
					overflow="hidden"
					onClick={handleClick}
					sx={{ cursor: 'pointer', width: '100%', paddingTop: '100%' }}
				>
					<Box
						position="absolute"
						top={0}
						left={0}
						right={0}
						bottom={0}
						display="flex"
						justifyContent="center"
						alignItems="center"
					>
						{isLoadingImage && (
							<Box position="absolute" top={0} left={0} right={0} bottom={0}>
								<Skeleton variant="rectangular" width="100%" height="100%" />
							</Box>
						)}
						<Image
							src={artifact.fileType.endsWith('pdf') ? '/pdf-placeholder-image.png' : artifact.url}
							alt={artifact.fileName}
							layout="fill"
							objectFit="contain"
							style={{ borderRadius: '8px' }}
							onLoadingComplete={() => setIsLoadingImage(false)}
							onError={handleImageLoadError}
						/>
						<Box position="absolute" bottom={16} right={16}>
							<Checkbox
								checked={!!artifactDetails?.id}
								onChange={handleClick}
								icon={<CheckEmptyIcon />}
								checkedIcon={<CheckFilledIcon />}
								sx={{ p: 0, border: 'none' }}
							/>
						</Box>
					</Box>
				</Box>
				<Stack mt={1}>
					<Typography variant="caption" textAlign="center">
						{artifact.fileName}
					</Typography>
				</Stack>
			</Grid>
		</>
	);
};
