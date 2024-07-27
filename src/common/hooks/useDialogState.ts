import { useCallback, useState } from 'react';

export function useDialogState(defaultValue = false) {
	const [isOpen, setIsOpen] = useState(defaultValue);

	const open = useCallback(() => setIsOpen(true), []);
	const close = useCallback(() => setIsOpen(false), []);
	const toggle = useCallback(() => setIsOpen((d) => !d), []);

	return { isOpen, setIsOpen, open, close, toggle };
}
