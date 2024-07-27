import { SvgIcon, SvgIconProps } from '@mui/material';

export const CheckFilledIcon = (props: SvgIconProps) => {
	return (
		<SvgIcon {...props} viewBox="0 0 18 16">
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<rect x="1" y="1" width="22" height="22" rx="11" fill="#FE6477" />
				<rect x="1" y="1" width="22" height="22" rx="11" stroke="#FE6477" stroke-width="2" />
				<path
					d="M9.32923 15.2293L5.85423 11.7543L4.6709 12.9293L9.32923 17.5876L19.3292 7.5876L18.1542 6.4126L9.32923 15.2293Z"
					fill="white"
				/>
			</svg>
		</SvgIcon>
	);
};
