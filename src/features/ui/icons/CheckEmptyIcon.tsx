import { SvgIcon, SvgIconProps } from '@mui/material';

export const CheckEmptyIcon = (props: SvgIconProps) => {
	return (
		<SvgIcon {...props} viewBox="0 0 18 16">
			<svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<rect x="1.5" y="1" width="22" height="22" rx="11" stroke="#FE6477" stroke-width="2" />
			</svg>
		</SvgIcon>
	);
};
