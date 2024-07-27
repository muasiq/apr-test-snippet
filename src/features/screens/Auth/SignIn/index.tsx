import { AuthPageContainer } from '~/features/ui/layouts/Auth/AuthPageContainer';
import { SignInCard } from './components/SignInCard';

export const SignInScreen = () => {
	return (
		<AuthPageContainer>
			<SignInCard />
		</AuthPageContainer>
	);
};
