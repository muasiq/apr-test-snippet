import { type Mixpanel } from 'mixpanel-browser';
import { createContext } from 'react';

export type MixpanelContext = Mixpanel | undefined;

export const libMixpanelContext = createContext<MixpanelContext>(undefined);
