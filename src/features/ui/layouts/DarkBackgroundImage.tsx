import { Box, styled } from '@mui/material';

export const DarkBackgroundImage = styled(Box)(({}) => ({
	position: 'absolute',
	top: '0', // For mobile devices
	left: '0',
	width: '100%', // For mobile devices
	height: '100%',
	backgroundImage: 'url(/dark-bg-gradient.png)',
	backgroundSize: 'cover',
	backgroundPosition: 'center',
	zIndex: -1,
}));
