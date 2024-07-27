import { useContext } from 'react';
import { MixpanelContext, libMixpanelContext } from './lib/LibMixpanelContext';

export const useMixpanel = (): MixpanelContext => useContext(libMixpanelContext);
