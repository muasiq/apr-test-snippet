import { ArrowBackIos, ArrowForwardIos, Close } from '@mui/icons-material';
import { Box, Checkbox, Dialog, DialogActions, IconButton } from '@mui/material';
import { Dispatch, SetStateAction, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { CheckEmptyIcon } from '~/features/ui/icons/CheckEmptyIcon';
import { CheckFilledIcon } from '~/features/ui/icons/CheckFilledIcon';
import { ArtifactDetails } from './UploadMedicationSelectArtifact';

type Props = {
	isDialogOpen: boolean;
	setIsDialogOpen: Dispatch<SetStateAction<boolean>>;
	signedUrl: string;
	artifactDetails: ArtifactDetails | null;
	handlePdfPageClick: (pageNumber: number) => void;
};
export const UploadMedicationPdfPageSelect = ({
	isDialogOpen,
	setIsDialogOpen,
	signedUrl,
	artifactDetails,
	handlePdfPageClick,
}: Props) => {
	const [totalPdfPages, setTotalPdfPages] = useState<number | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).toString();

	const onDocumentLoadSuccess = ({ numPages }: { numPages: number }): void => {
		setTotalPdfPages(numPages);
	};

	const handlePrevPage = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
		}
	};

	const handleNextPage = () => {
		if (currentPage < totalPdfPages!) {
			setCurrentPage(currentPage + 1);
		}
	};

	return (
		<Dialog
			open={isDialogOpen}
			onClose={() => setIsDialogOpen(false)}
			fullWidth
			maxWidth="lg"
			PaperProps={{ sx: { margin: 0 } }}
		>
			<DialogActions>
				<IconButton data-cy="close-pdf-meds-markup" onClick={() => setIsDialogOpen(false)}>
					<Close />
				</IconButton>
			</DialogActions>
			<Box position="relative">
				<Box overflow="auto">
					<Document
						file={signedUrl}
						onLoadSuccess={onDocumentLoadSuccess}
						onLoadError={(e) => console.error(e)}
					>
						<Page pageNumber={currentPage} renderTextLayer={false} height={window.innerHeight - 200}></Page>
					</Document>
					<Checkbox
						data-cy="pdf-page-mark-has-meds"
						onClick={() => handlePdfPageClick(currentPage)}
						checked={!!artifactDetails?.id && artifactDetails.relevantPages?.includes(currentPage)}
						icon={<CheckEmptyIcon />}
						checkedIcon={<CheckFilledIcon />}
						sx={{
							position: 'absolute',
							bottom: 16,
							right: 16,
							p: 0,
							border: 'none',
						}}
					/>
					{!!totalPdfPages && totalPdfPages > 1 && (
						<>
							<IconButton
								onClick={handlePrevPage}
								disabled={currentPage === 1}
								sx={{
									position: 'absolute',
									top: '50%',
									left: 16,
									transform: 'translateY(-50%)',
									zIndex: 2,
								}}
							>
								<ArrowBackIos color={currentPage === 1 ? 'disabled' : 'primary'} />
							</IconButton>
							<IconButton
								onClick={handleNextPage}
								disabled={currentPage === totalPdfPages}
								sx={{
									position: 'absolute',
									top: '50%',
									right: 16,
									transform: 'translateY(-50%)',
									zIndex: 2,
								}}
							>
								<ArrowForwardIos color={currentPage === totalPdfPages ? 'disabled' : 'primary'} />
							</IconButton>
						</>
					)}
				</Box>
			</Box>
		</Dialog>
	);
};
