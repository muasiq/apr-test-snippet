import { useRouter } from 'next/router';

import { AuthPageContainer } from '~/features/ui/layouts/Auth/AuthPageContainer';
import { VerificationMethod } from '~/server/api/routers/user/user.inputs';
import { SignUpCard } from './components/SignUpCard';

export const SignUpScreen = () => {
	const router = useRouter();

	const { email, token } = router.query as {
		email?: string;
		token?: string;
		verificationMethod?: VerificationMethod;
	};

	if (!email || !token) {
		console.error('Sign in page error for missing params', router.query);
		return <AuthPageContainer helperText="Invalid URL, please click the link provided from your email." />;
	}

	return (
		<AuthPageContainer>
			<SignUpCard email={email} token={token} />
		</AuthPageContainer>
	);
};
