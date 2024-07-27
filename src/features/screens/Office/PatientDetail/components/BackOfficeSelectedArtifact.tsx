import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Stack } from '@mui/material';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { useAlert } from '~/common/hooks/useAlert';
import { useShallowRouterQuery } from '~/common/hooks/useShallowRouterQuery';
import { RouterOutputs, api } from '~/common/utils/api';
import { DownloadButton } from '~/features/ui/buttons/DownloadButton';
import { FixedBottomSaveButton } from '~/features/ui/buttons/FixedBottomSaveButton';
import { FormSelect, FormTextField } from '~/features/ui/form-inputs';
import { SignedUrlImage } from '~/features/ui/images/SignedUrlImage';
import { FULL_HEIGHT_MINUS_NAVBAR } from '~/features/ui/layouts/TopNav';
import { DocumentViewer } from '~/features/ui/pdf/DocumentViewer';
import {
	patientArtifactUpdateSchema,
	type PatientArtifactUpdateInput,
} from '~/server/api/routers/patientArtifact/patientArtifact.inputs';
import theme from '~/styles/theme';
import { PatientWithJoins } from '../../../../../server/api/routers/patient/patient.types';
import { DeleteArtifactButton } from '../../../../ui/buttons/DeleteArtifactButton';

type Props = {
	selectedArtifact: RouterOutputs['patientArtifact']['getAllSignedImageUrlsByIdAndTagname'][0];
	patientArtifacts: PatientWithJoins['PatientArtifacts'];
};
export const BackOfficeSelectedArtifact = ({ selectedArtifact, patientArtifacts }: Props) => {
	const alert = useAlert();
	const router = useRouter();
	const { pushReplaceQuery } = useShallowRouterQuery();

	const isFilePdf = selectedArtifact.fileType.endsWith('pdf');

	const utils = api.useUtils();
	const attachmentTypes = api.organization.getAttachmentTypes.useQuery();
	const updateMutation = api.patientArtifact.updateArtifact.useMutation({
		onSuccess({ tagName, patientId }) {
			alert.addSuccessAlert({ message: 'Artifact updated' });
			void utils.patientArtifact.getAllSignedImageUrlsByIdAndTagname.invalidate({ patientId, tagName });
		},
		onError(e) {
			console.error(e);
			alert.addErrorAlert({ message: 'Error updating artifact' });
		},
	});

	const form = useForm<PatientArtifactUpdateInput>({
		values: {
			fileName: selectedArtifact.fileName,
			artifactId: selectedArtifact.id,
			attachmentTypeId: selectedArtifact.attachmentType?.id,
		},
		resolver: zodResolver(patientArtifactUpdateSchema),
	});

	const onSubmit = form.handleSubmit((data) => {
		updateMutation.mutate(data);
	});

	const handleBack = () => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { selectedArtifact: _, ...routerQuery } = router.query;
		pushReplaceQuery({ ...routerQuery });
	};

	return (
		<Box sx={{ mt: -1 }} height={{ xs: `auto`, md: FULL_HEIGHT_MINUS_NAVBAR }}>
			<Stack
				direction={{ xs: 'column', md: 'row' }}
				sx={{
					maxWidth: theme.breakpoints.values.lg,
					mx: 'auto',
					mb: 1,
				}}
				spacing={3}
				justifyContent="space-between"
			>
				<Box style={{ flex: 1 }}>
					<Stack
						direction={{ xs: 'column', md: 'row' }}
						alignItems={{ xs: 'start', md: 'center' }}
						spacing={1}
					>
						<FormTextField
							control={form.control}
							sx={{ maxWidth: 320 }}
							fullWidth
							label="File Name"
							name="fileName"
							size="small"
						/>
						<FormSelect
							size="small"
							sx={{ maxWidth: 320 }}
							fullWidth
							control={form.control}
							label="Attachment Type"
							name="attachmentTypeId"
							options={
								attachmentTypes.data?.map((attachmentType) => ({
									label: attachmentType.description,
									value: attachmentType.id,
								})) ?? []
							}
						/>
					</Stack>
					<FixedBottomSaveButton
						width={router.query.split === 'true' ? '50%' : '100%'}
						show={form.formState.isDirty}
						isLoading={updateMutation.isLoading}
						onClick={() => onSubmit()}
					/>
				</Box>
				<Stack direction={'row'} alignItems={'center'} spacing={1}>
					<DownloadButton
						downloadUrl={selectedArtifact.url}
						fileName={selectedArtifact.fileName}
						expires={selectedArtifact.expires}
						artifactId={selectedArtifact.id}
					/>
					<DeleteArtifactButton
						userThatUploadedId={selectedArtifact.userThatUploadedId}
						artifactId={selectedArtifact.id}
						onDeleteSuccess={handleBack}
					/>
				</Stack>
			</Stack>
			<Box sx={{ height: { xs: 'calc(100dvh - 200px)' } }} position={'relative'} flexGrow={1} overflow={'auto'}>
				{isFilePdf ? (
					<DocumentViewer
						patientArtifacts={patientArtifacts}
						artifactId={selectedArtifact.id}
						artifactUrl={selectedArtifact.url}
					/>
				) : (
					<SignedUrlImage
						artifactId={selectedArtifact.id}
						imageUrl={selectedArtifact.url}
						fileName={selectedArtifact.fileName}
					/>
				)}
			</Box>
		</Box>
	);
};
