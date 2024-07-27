import { useRouter } from 'next/router';

import { AuthPageContainer } from '~/features/ui/layouts/Auth/AuthPageContainer';
import { ResetPasswordCard } from './components/ResetPasswordCard';

export const ResetPasswordScreen = () => {
	const router = useRouter();

	const { email, token } = router.query as { email: string | undefined; token: string | undefined };

	if (!email || !token) {
		return <AuthPageContainer helperText="Invalid URL, please click the link provided from your email." />;
	}

	return (
		<AuthPageContainer>
			<ResetPasswordCard email={email} token={token} />
		</AuthPageContainer>
	);
};
