import { Box } from '@mui/material';
import lottie from 'lottie-web';
import { useEffect, useRef } from 'react';

type Props = {
	width: number;
	height: number;
	animationData: unknown;
};
export function TestInterstitialAnimation({ width, height, animationData }: Props) {
	const container = useRef<Element | null>(null);

	useEffect(() => {
		if (container.current) {
			const animationInstance = lottie.loadAnimation({
				container: container.current,
				renderer: 'svg',
				loop: true,
				autoplay: true,
				animationData,
			});

			return () => animationInstance.destroy();
		}
	}, []);

	return <Box width={width} height={height} ref={container} />;
}
