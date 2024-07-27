import { useEffect, useState } from 'react';

export const useCurrentWindowWidth = () => {
	const [width, setWidth] = useState<number>(0);

	useEffect(() => {
		setWidth(window.innerWidth);

		const handleResize = () => {
			setWidth(window.innerWidth);
		};

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []);

	return { width };
};
