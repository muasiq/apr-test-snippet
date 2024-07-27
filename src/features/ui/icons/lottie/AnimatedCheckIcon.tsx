import { Box } from '@mui/material';
import lottie from 'lottie-web';
import { useEffect, useRef } from 'react';

export const AnimatedCheckIcon = () => {
	const container = useRef<Element | null>(null);

	useEffect(() => {
		if (container.current) {
			const animationInstance = lottie.loadAnimation({
				container: container.current, // the dom element
				renderer: 'svg',
				loop: false,
				autoplay: true,
				path: '/lottie/Check.json', // the path to the animation json
			});

			return () => animationInstance.destroy();
		}
	}, []);

	return <Box width={32} height={32} ref={container} />;
};
