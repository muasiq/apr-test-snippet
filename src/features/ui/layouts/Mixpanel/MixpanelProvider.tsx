import { Config } from 'mixpanel-browser';
import { LibMixpanelProvider } from './lib/LibMixpanelProvider';

const MIXPANEL_CONFIG: Partial<Config> = {
	debug: false,
	ignore_dnt: true,
	track_pageview: false,
	persistence: 'localStorage',
};

const MIXPANEL_TOKEN = '62f42040f6b88279ab9e72f6536729ff';

type Props = React.PropsWithChildren;
export function MixpanelProvider({ children }: Props) {
	return (
		<LibMixpanelProvider config={MIXPANEL_CONFIG} token={MIXPANEL_TOKEN}>
			{children}
		</LibMixpanelProvider>
	);
}
