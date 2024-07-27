import { Box, useMediaQuery } from '@mui/material';
import { PatientArtifactTag } from '@prisma/client';
import { UploadFileInput } from '~/features/screens/Field/PatientDetail/components/FileUpload/UploadFileInput';
import { ImagePickerButton } from '~/features/ui/buttons/ImagePickerButton';
import theme from '~/styles/theme';

type Props = {
	patientId: number;
	tagName: PatientArtifactTag;
};
export const ArtifactUpload = ({ patientId, tagName }: Props) => {
	const isMediumScreen = useMediaQuery(theme.breakpoints.up('md'));

	return (
		<Box pt={2}>
			{isMediumScreen ? (
				<UploadFileInput patientId={patientId} tagName={tagName} />
			) : (
				<ImagePickerButton patientId={patientId} tagName={tagName} />
			)}
		</Box>
	);
};
