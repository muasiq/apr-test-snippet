import { Download } from '@mui/icons-material';
import { Button, ButtonProps } from '@mui/material';
import { api } from '~/common/utils/api';
import { downloadFile } from '~/features/ui/util/downloadFile';

type Props = {
	artifactId: number;
	downloadUrl: string;
	fileName: string;
	expires: Date;
} & ButtonProps;

export const DownloadButton = ({ artifactId, downloadUrl, fileName, expires, ...buttonProps }: Props) => {
	const { mutateAsync } = api.patientArtifact.getSignedImageUrlId.useMutation({
		onSuccess: (data) => {
			downloadFile(data.signedUrl, fileName);
		},
	});

	const handleDownload = async (event?: React.MouseEvent<HTMLButtonElement>) => {
		event?.preventDefault();

		const now = new Date();
		const expiryDate = new Date(expires);

		if (now <= expiryDate) {
			downloadFile(downloadUrl, fileName);
		} else {
			await mutateAsync({
				id: artifactId,
			});
		}
	};

	return (
		<Button endIcon={<Download />} onClick={handleDownload} {...buttonProps}>
			Download
		</Button>
	);
};
