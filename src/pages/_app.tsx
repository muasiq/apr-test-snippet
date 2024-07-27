import { CssBaseline, ThemeProvider } from '@mui/material';
import { LicenseInfo } from '@mui/x-license-pro';
import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { type AppType } from 'next/app';
import { AlertProvider } from '~/common/providers/AlertProvider';
import { api } from '~/common/utils/api';
import { SyncInterviewSetupQuestions } from '~/features/screens/Field/InterviewQuestion/components/SyncInterviewSetupQuestions';
import { SyncInterviewUploadQuestions } from '~/features/screens/Field/InterviewQuestion/components/SyncInterviewUploadQuestions';
import { InactivityTimeout } from '~/features/ui/auth/InactivityTimeout';
import { SignedIn } from '~/features/ui/auth/SignedIn';
import { GlobalLayout } from '~/features/ui/layouts/GlobalLayout';
import { SentryUserManager } from '~/features/ui/util/SentryUserManager';
import '~/styles/globals.css';
import theme from '~/styles/theme';
import { env } from '../env.mjs';
import { SyncInterviewQuestions } from '../features/screens/Field/InterviewQuestion/components/SyncInterviewQuestions';
import { Loading } from '../features/ui/auth/Loading';
import { SignedInOrAuthPage } from '../features/ui/auth/SignedInOrAuthPage';
import { SignedOut } from '../features/ui/auth/SignedOut';
import { MixpanelIdentifyUser } from '../features/ui/layouts/Mixpanel/MixpanelIdentifyUser';
import { MixpanelProvider } from '../features/ui/layouts/Mixpanel/MixpanelProvider';
import { FileUploadsManager } from '../features/ui/loading/FileUploadsManager';

LicenseInfo.setLicenseKey(env.NEXT_PUBLIC_MUI_PRO_LICENSE_KEY);

const MyApp: AppType<{ session: Session | null }> = ({ Component, pageProps: { session, ...pageProps } }) => {
	return (
		<SessionProvider session={session} refetchWhenOffline={false}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<GlobalLayout>
					<SentryUserManager />
					<MixpanelProvider>
						<AlertProvider verticalPosition="top" horizontalPosition="center">
							{/* <AppUpdatePrompt /> */}
							<Loading />
							<SignedInOrAuthPage>
								<Component {...pageProps} />
							</SignedInOrAuthPage>
							<SignedIn>
								<>
									<MixpanelIdentifyUser />
									<InactivityTimeout />
									<SyncInterviewQuestions />
									<SyncInterviewSetupQuestions />
									<SyncInterviewUploadQuestions />
									<FileUploadsManager />
								</>
							</SignedIn>
							<SignedOut />
						</AlertProvider>
					</MixpanelProvider>
				</GlobalLayout>
			</ThemeProvider>
		</SessionProvider>
	);
};

export default api.withTRPC(MyApp);
