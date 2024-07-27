import { SvgIcon, SvgIconProps } from '@mui/material';

interface Props extends SvgIconProps {
	customColor?: string;
}
export const WaveformIcon = ({ customColor, ...props }: Props) => {
	return (
		<SvgIcon {...props} viewBox="0 0 18 16">
			<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
				<g id="waveform" clipPath="url(#clip0_3148_729)">
					<rect
						id="Rectangle 1"
						x="1.85718"
						y="11.1509"
						width="2.68831"
						height="9.69796"
						rx="1.34416"
						fill={customColor ?? 'white'}
					/>
					<rect
						id="Rectangle 2"
						x="7.23389"
						y="5.89795"
						width="2.68831"
						height="20.2041"
						rx="1.34416"
						fill={customColor ?? 'white'}
					/>
					<rect
						id="Rectangle 3"
						x="12.6106"
						y="1.85693"
						width="2.68831"
						height="28.2857"
						rx="1.34416"
						fill={customColor ?? 'white'}
					/>
					<rect
						id="Rectangle 4"
						x="17.9871"
						y="7.91846"
						width="2.68831"
						height="16.1633"
						rx="1.34416"
						fill={customColor ?? 'white'}
					/>
					<rect
						id="Rectangle 5"
						x="23.3638"
						y="3.87744"
						width="2.68831"
						height="24.2449"
						rx="1.34416"
						fill={customColor ?? 'white'}
					/>
					<rect
						id="Rectangle 6"
						x="28.7402"
						y="9.53467"
						width="2.68831"
						height="12.9306"
						rx="1.34416"
						fill={customColor ?? 'white'}
					/>
				</g>
				<defs>
					<clipPath id="clip0_3148_729">
						<rect width="30.8571" height="30.8571" fill="white" transform="translate(0.571533 0.571289)" />
					</clipPath>
				</defs>
			</svg>
		</SvgIcon>
	);
};
