// https://github.com/richtr/NoSleep.js/issues/156
import { useCallback, useMemo } from 'react';
import { useUnmount } from 'usehooks-ts';
import NoSleep from '../utils/customNoSleep/main';

export const useNoSleep = () => {
	const noSleep = useMemo(() => new NoSleep(), []);

	useUnmount(() => {
		noSleep?.disable();
	});

	const enable = useCallback(() => {
		try {
			noSleep.enable();
		} catch (e) {
			console.error('error requesting noSleep', e);
		}
	}, [noSleep]);

	const disable = useCallback(() => {
		try {
			noSleep.disable();
		} catch (e) {
			console.error('error disabling noSleep', e);
		}
	}, [noSleep]);

	return { enable, disable };
};
