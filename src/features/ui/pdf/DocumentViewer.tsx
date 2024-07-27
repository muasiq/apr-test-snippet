import { useCallback, useMemo } from 'react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { useAlert } from '~/common/hooks/useAlert';
import { api } from '~/common/utils/api';
import { useSignedUrl } from '~/features/screens/Field/PatientDetail/common/hooks/useSignedUrl';
import { updateRelevantPages } from '~/features/screens/Field/PatientDetail/common/util/updateRelevantPages.ts';
import theme from '~/styles/theme';
import { PatientWithJoins } from '../../../server/api/routers/patient/patient.types';
import PdfViewer from './pdf-viewer';

type Props = {
	patientArtifacts: PatientWithJoins['PatientArtifacts'];
	artifactUrl: string;
	artifactId: number;
};
export const DocumentViewer = ({ patientArtifacts, artifactId, artifactUrl }: Props) => {
	const alert = useAlert();
	const utils = api.useUtils();

	const { refetchSignedUrl, signedUrl } = useSignedUrl({ artifactId, artifactUrl });
	const relevantPages = useMemo(
		() =>
			new Map(
				patientArtifacts.map((artifact) => [
					artifact.id,
					artifact.patientDocumentArtifact?.relevantPages ?? [],
				]),
			),
		[patientArtifacts],
	);

	const saveArtifactRelevantPagesMutation = api.patientArtifact.saveArtifactRelevantPages.useMutation({
		onSuccess: () => {
			void utils.patient.getById.invalidate();
		},
		onError: (error) => {
			alert.addErrorAlert({
				title: 'There was an error saving the relevant pages. Please try again.',
				message: error.message,
			});
		},
	});

	const handleCheckboxChange = useCallback(
		(_: boolean, selectedPageNumber: number) => {
			const updatedRelevantPages = updateRelevantPages(relevantPages, artifactId, selectedPageNumber);

			saveArtifactRelevantPagesMutation.mutate({
				artifactId,
				relevantPages: updatedRelevantPages.get(artifactId) ?? [],
			});
		},
		[artifactId, relevantPages, saveArtifactRelevantPagesMutation],
	);

	return (
		<PdfViewer
			url={signedUrl.url}
			checkedPages={relevantPages.get(artifactId)}
			onChecked={handleCheckboxChange}
			onDocumentLoadError={() => refetchSignedUrl()}
			fit="cover"
			sx={{
				height: '100%',
				width: '100%',
				maxWidth: theme.breakpoints.values.lg,
				margin: 'auto',
			}}
		/>
	);
};
