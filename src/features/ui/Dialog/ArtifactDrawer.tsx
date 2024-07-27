import { Box, Stack, SwipeableDrawer, Typography, useMediaQuery } from '@mui/material';
import { useRouter } from 'next/router';
import { PropsWithChildren } from 'react';
import { useShallowRouterQuery } from '~/common/hooks/useShallowRouterQuery';
import { RouterOutputs } from '~/common/utils/api';
import { DeleteArtifactButton } from '~/features/ui/buttons/DeleteArtifactButton';
import { DownloadButton } from '~/features/ui/buttons/DownloadButton';
import theme from '~/styles/theme';

type Props = {
	selectedArtifact: RouterOutputs['patientArtifact']['getAllSignedImageUrlsByIdAndTagname'][0];
} & PropsWithChildren;
export function ArtifactDrawer({ selectedArtifact, children }: Props) {
	const router = useRouter();
	const { pushReplaceQuery } = useShallowRouterQuery();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

	function handleCloseDialog() {
		window.history?.length > 0 ? void router.back() : pushReplaceQuery({ patientId: router.query.patientId });
	}

	const { fileName, id: artifactId, userThatUploadedId, expires, url: signedUrl } = selectedArtifact;

	return (
		<SwipeableDrawer
			anchor={isMobile ? 'bottom' : 'right'}
			open={!!selectedArtifact}
			onClose={handleCloseDialog}
			onOpen={() => null}
		>
			<Box height={isMobile ? '90vh' : '100%'} width={isMobile ? '100%' : 800}>
				<Stack direction={{ sm: 'row' }} justifyContent={'space-between'} alignItems={'center'} p={2}>
					<Typography variant={'h4'}>{fileName}</Typography>
					<Stack direction={'row'} spacing={2}>
						<DownloadButton
							artifactId={artifactId}
							expires={expires}
							fileName={fileName}
							downloadUrl={signedUrl}
						/>
						<DeleteArtifactButton
							userThatUploadedId={userThatUploadedId}
							artifactId={artifactId}
							onDeleteSuccess={handleCloseDialog}
						/>
					</Stack>
				</Stack>
				{children}
			</Box>
		</SwipeableDrawer>
	);
}
