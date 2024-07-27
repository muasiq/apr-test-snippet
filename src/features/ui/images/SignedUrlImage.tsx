import Image from 'next/image';
import { useSignedUrl } from '~/features/screens/Field/PatientDetail/common/hooks/useSignedUrl';

type Props = {
	artifactId: number;
	imageUrl: string;
	fileName: string;
};
export const SignedUrlImage = ({ artifactId, imageUrl, fileName }: Props) => {
	const { refetchSignedUrl, signedUrl } = useSignedUrl({
		artifactId,
		artifactUrl: imageUrl,
	});

	return <Image src={signedUrl.url} alt={fileName} layout="fill" objectFit="contain" onError={refetchSignedUrl} />;
};
