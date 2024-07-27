import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useMixpanel } from './useMixpanel';

export function MixpanelIdentifyUser() {
	const mixpanel = useMixpanel();
	const session = useSession();

	useEffect(() => {
		if (session.data?.user && mixpanel) {
			const { id, email, organizationId, name } = session.data.user;
			mixpanel.identify(id);
			mixpanel.people.set({ $name: name, $email: email, organizationId });
		}
	}, [session, mixpanel]);
	return null;
}
