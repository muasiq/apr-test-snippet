import { ZoomIn, ZoomOut } from '@mui/icons-material';
import { Box, Button, ButtonGroup, Checkbox, Stack, SxProps, Typography } from '@mui/material';
import { debounce } from 'lodash';
import { ComponentRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { LoadingSpinner } from '../loading/LoadingSpinner';

const SCROLLBAR_WIDTH = 15;
const SCALE_RANGE = [0.5, 1, 1.5, 2] as const;
const DEFAULT_SCALE = SCALE_RANGE[1] as (typeof SCALE_RANGE)[number];

export type PDFViewerProps = {
	url: string;
	sx?: SxProps;
	checkedPages?: number[];
	onChecked?: (val: boolean, page: number) => void;
	onDocumentLoadError?: () => void;
	fit?: 'cover' | 'contain';
};

export default function PdfViewer({
	url,
	sx,
	onChecked,
	checkedPages,
	onDocumentLoadError,
	fit = 'contain',
}: PDFViewerProps) {
	const [scale, setScale] = useState(DEFAULT_SCALE);
	const [numPages, setNumPages] = useState(0);
	const wrapperRef = useRef<ComponentRef<'div'>>(null);
	const [height, setHeight] = useState(0);
	const [width, setWidth] = useState(0);

	useEffect(() => {
		pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).toString();
	}, []);

	useEffect(() => {
		const onResize = debounce(([entry]: ResizeObserverEntry[]) => {
			if (!entry) return;
			const { width, height } = entry.contentRect;
			setHeight(height);
			setWidth(width);
		}, 50);
		const resizeObserver = new ResizeObserver(onResize);
		if (wrapperRef.current) {
			resizeObserver.observe(wrapperRef.current);
		}
		return () => {
			resizeObserver.disconnect();
		};
	}, []);

	const pageProp = useMemo(() => {
		const scaledWidth = width * scale - SCROLLBAR_WIDTH;
		const scaledHeight = height * scale - SCROLLBAR_WIDTH;
		if (fit === 'contain') return width < height ? { width: scaledWidth } : { height: scaledHeight };
		return { width: scaledWidth };
	}, [fit, width, height, scale]);

	const canZoomIn = scale < SCALE_RANGE[SCALE_RANGE.length - 1]!;
	const canZoomOut = scale > SCALE_RANGE[0];

	const zoomIn = useCallback(() => {
		setScale((val) => {
			const currentIndex = SCALE_RANGE.indexOf(val);
			const nextScale = SCALE_RANGE[currentIndex + 1];
			if (nextScale) return nextScale;
			return val;
		});
	}, []);

	const zoomOut = useCallback(() => {
		setScale((val) => {
			const currentIndex = SCALE_RANGE.indexOf(val);
			const nextScale = SCALE_RANGE[currentIndex - 1];
			if (nextScale) return nextScale;
			return val;
		});
	}, []);

	return (
		<Box ref={wrapperRef} sx={{ position: 'relative', ...sx }}>
			<Box
				data-cy="pdf-viewer"
				sx={{
					height: '100%',
					width: '100%',
					overflow: 'auto',
					scrollbarWidth: 'thin',
					'& .pdf-document': { height: '100%' },
					'& .pdf-page': { width: '100%', height: '100%' },
					'& .pdf-page > canvas': { mx: 'auto' },
				}}
			>
				<Document
					file={url}
					className="pdf-document"
					loading={<LoadingSpinner />}
					onLoadSuccess={({ numPages }) => {
						setNumPages(numPages);
					}}
					onLoadError={(err) => {
						console.log(err);
						onDocumentLoadError?.();
					}}
				>
					{Array.from(new Array(numPages), (_, index) => index + 1).map((pageNumber) => (
						<Box key={pageNumber}>
							<Stack
								position="sticky"
								top={0}
								zIndex={1}
								bgcolor="rgba(255, 255, 255, 0.5)"
								direction="row"
								alignItems="center"
								width="100%"
							>
								{onChecked && (
									<Checkbox
										checked={checkedPages?.includes(pageNumber)}
										onChange={(e) => onChecked(e.target.checked, pageNumber)}
									/>
								)}
								<Typography variant="body2">
									page {pageNumber} of {numPages} pages
								</Typography>
							</Stack>
							<Page
								{...pageProp}
								loading={''}
								className="pdf-page"
								canvasBackground="white"
								pageNumber={pageNumber}
								renderAnnotationLayer={false}
								renderForms={false}
								renderTextLayer={false}
							/>
						</Box>
					))}
				</Document>
			</Box>
			<Box position="absolute" zIndex={2} bottom={{ xs: 10, md: 20 }} right={{ xs: 10, md: 20 }}>
				<ButtonGroup variant="contained" size="small" disableElevation aria-label="zoom button group">
					<Button onClick={zoomIn} disabled={!canZoomIn}>
						<ZoomIn sx={{ fontSize: { xs: '1rem', md: '1.5rem' } }} />
					</Button>
					<Button onClick={zoomOut} disabled={!canZoomOut}>
						<ZoomOut sx={{ fontSize: { xs: '1rem', md: '1.5rem' } }} />
					</Button>
				</ButtonGroup>
			</Box>
		</Box>
	);
}
