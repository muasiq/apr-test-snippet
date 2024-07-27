import { init, type Config } from 'mixpanel-browser';
import { useMemo, type ProviderProps } from 'react';
import { libMixpanelContext, type MixpanelContext } from './LibMixpanelContext';

export interface MixpanelProviderProps extends Omit<ProviderProps<MixpanelContext>, 'value'> {
	config?: Partial<Config>;
	name?: string;
	token?: string;
}

export function LibMixpanelProvider({ children, config: _config, name: _name, token }: MixpanelProviderProps) {
	const name = useMemo(() => _name ?? 'apricot', [_name]);

	const config = useMemo(
		() => ({
			track_pageview: false, // Rarely makes sense to track page views in React apps
			..._config,
		}),
		[_config],
	);

	const context = useMemo(() => (token ? init(token, config, name) : undefined), [config, name, token]);

	return <libMixpanelContext.Provider value={context}>{children}</libMixpanelContext.Provider>;
}
