import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import localFont from 'next/font/local';
declare module '@mui/material/styles' {
	interface Palette {
		glass: string;
		secondaryAlert: string;
		successBackground: string;
		errorBackground: string;
		alertInfoTextColor: string;
		alertErrorTextColor: string;
		heading: string;
		disabledButtonAccentColor: string;
	}
	interface PaletteOptions {
		glass: string;
		secondaryAlert: string;
		successBackground: string;
		errorBackground: string;
		alertInfoTextColor: string;
		alertErrorTextColor: string;
		heading: string;
		disabledButtonAccentColor: string;
	}
	interface TypographyVariants {
		body1b: React.CSSProperties;
		helper: React.CSSProperties;
	}
	interface TypographyVariantsOptions {
		body1b?: React.CSSProperties;
		helper?: React.CSSProperties;
	}
}

declare module '@mui/material/Typography' {
	interface TypographyPropsVariantOverrides {
		body1b: true;
		helper: true;
	}
}

export const poppins = localFont({
	src: [
		{ path: './fonts/poppins-latin-400.woff2', weight: '400' },
		{ path: './fonts/poppins-latin-500.woff2', weight: '500' },
		{ path: './fonts/poppins-latin-600.woff2', weight: '600' },
	],
	display: 'swap',
});
export const inter = localFont({
	src: [
		{ path: './fonts/inter-latin-400+500.woff2', weight: '400' },
		{ path: './fonts/inter-latin-400+500.woff2', weight: '500' },
	],
	display: 'swap',
});
export const roboto = localFont({
	src: [{ path: './fonts/roboto-latin-400.woff2', weight: '400' }],
	display: 'swap',
});
export const kalam = localFont({
	src: [
		{ path: './fonts/kalam-latin-300.woff2', weight: '300' },
		{ path: './fonts/kalam-latin-400.woff2', weight: '400' },
		{ path: './fonts/kalam-latin-700.woff2', weight: '700' },
	],
	display: 'swap',
});

// Create a theme instance.
let theme = createTheme({
	palette: {
		text: {
			primary: '#3B1F2B',
			secondary: '#3B1F2B99',
			disabled: '#3B1F2B61',
		},
		primary: {
			main: '#FE6477',
			dark: '#FE3B52',
			light: '#FFECEF',
			contrastText: '#FFFFFF',
		},
		secondary: {
			main: '#8D97E2',
			dark: '#343B6C',
			light: '#BFC5EF',
			contrastText: '#FFFFFF',
		},
		error: {
			main: '#D32F2F',
			dark: '#C62828',
			light: '#EF5350',
			contrastText: '#FFFFFF',
		},
		warning: {
			main: '#F57C00',
			dark: '#EF6C00',
			light: '#FF9800',
			contrastText: '#FFFFFF',
		},
		info: {
			main: '#0288D1',
			dark: '#01579B',
			light: '#03A9F4',
			contrastText: '#FFFFFF',
		},
		success: {
			main: '#1C564B',
			dark: '#11342D',
			light: '#3A7368',
			contrastText: '#FFFFFF',
		},
		action: {
			active: '#3B1F2B8F',
			hover: '#3B1F2B0A',
			selected: '#3B1F2B14',
			disabledBackground: '#3B1F2B1F',
			focus: '#3B1F2B1F',
			disabled: '#3B1F2B61',
		},
		divider: '#8D97E229',
		common: {
			white: '#FFFFFF',
			black: '#3B1F2B',
		},
		glass: '#FFFFFF66',
		secondaryAlert: '#F4F5FE',
		successBackground: '#EDF7ED',
		errorBackground: '#FDEDED',
		alertErrorTextColor: '#5F2120',
		alertInfoTextColor: '#5A629E',
		heading: '#6F3A51',
		disabledButtonAccentColor: '#3B1F2B1F',
	},
	typography: {
		fontFamily: poppins.style.fontFamily,
	},
	components: {
		MuiTextField: {
			styleOverrides: {
				root: {
					'& .MuiInputLabel-root, .MuiInputLabel-root.Mui-focused': {
						color: '#6F3A51',
					},
					'&:hover': {
						'& .MuiOutlinedInput-root': {
							'& fieldset': {
								borderColor: '#BFC5EF',
							},
						},
					},
					'& .MuiOutlinedInput-root': {
						'& fieldset': {
							borderColor: '#BFC5EF',
						},
					},
				},
			},
		},
		MuiOutlinedInput: {
			styleOverrides: {
				root: {
					backgroundColor: '#FFF',
					'& .MuiOutlinedInput-input': {
						borderRadius: '8px',
					},
					'& .MuiOutlinedInput-notchedOutline': {
						borderRadius: '8px',
					},
				},
			},
		},
		MuiTab: {
			styleOverrides: {
				root: {
					color: '#6F3A51',
				},
			},
		},
		MuiButton: {
			styleOverrides: {
				root: {
					boxShadow: 'none',
					'&:hover': {
						boxShadow: 'none',
					},
				},
			},
			variants: [
				{
					props: { variant: 'contained' },
					style: {
						backgroundColor: '#FE6477',
						color: '#FFFFFF',
						borderRadius: '100px',
					},
				},
				{
					props: { variant: 'outlined' },
					style: {
						color: '#FE6477',
						border: '2px solid #FE6477',
						borderRadius: '100px',
						'&:hover': {
							backgroundColor: '#FE6477',
							border: '2px solid #FE6477',
							color: '#FFFFFF',
						},
					},
				},
				{
					props: { variant: 'text' },
					style: {
						color: '#FE6477',
						borderRadius: '100px',
					},
				},
			],
		},
	},
});

theme = responsiveFontSizes(theme, {
	breakpoints: ['xs', 'sm', 'md', 'lg', 'xl'],
});

theme.typography.h1 = {
	fontWeight: 600,
	lineHeight: 1.167,
	letterSpacing: '-0.01562em',
	fontSize: '96px',
	[theme.breakpoints.down('sm')]: {
		fontSize: '48px',
	},
	color: theme.palette.heading,
};

theme.typography.h2 = {
	fontSize: '60px',
	fontWeight: 600,
	lineHeight: '120%',
	letterSpacing: '-0.5px',
	[theme.breakpoints.down('sm')]: {
		fontSize: '40px',
	},
	color: theme.palette.heading,
};

theme.typography.h3 = {
	fontSize: '48px',
	fontWeight: 600,
	lineHeight: '116.7%',
	[theme.breakpoints.down('sm')]: {
		fontSize: '32px',
	},
	color: theme.palette.heading,
};

theme.typography.h4 = {
	fontSize: '34px',
	fontWeight: 600,
	lineHeight: '123.5%',
	letterSpacing: '0.25px',
	[theme.breakpoints.down('sm')]: {
		fontSize: '24px',
	},
	color: theme.palette.heading,
};

theme.typography.h5 = {
	fontSize: '24px',
	fontWeight: 600,
	lineHeight: '113.4%',
	[theme.breakpoints.down('sm')]: {
		fontSize: '18px',
	},
	color: theme.palette.heading,
};

theme.typography.h6 = {
	fontSize: '20px',
	fontWeight: 600,
	lineHeight: '160%',
	letterSpacing: '0.15px',
	[theme.breakpoints.down('sm')]: {
		fontSize: '14px',
	},
	color: theme.palette.heading,
};

theme.typography.body1 = {
	fontFamily: inter.style.fontFamily,
	fontSize: '16px',
	fontWeight: 400,
	lineHeight: '150%',
	letterSpacing: '0.15px',
};

theme.typography.body1b = {
	fontFamily: inter.style.fontFamily,
	fontSize: '16px',
	fontWeight: 'bold',
	lineHeight: '150%',
	letterSpacing: '0.15px',
};

theme.typography.body2 = {
	fontFamily: roboto.style.fontFamily,
	fontSize: '14px',
	fontWeight: 400,
	lineHeight: '143%',
	letterSpacing: '0.17px',
};

theme.typography.subtitle1 = {
	fontFamily: inter.style.fontFamily,
	fontSize: '16px',
	fontWeight: 500,
	lineHeight: '175%',
	letterSpacing: '0.15px',
};

theme.typography.subtitle2 = {
	fontFamily: inter.style.fontFamily,
	fontSize: '14px',
	fontWeight: 500,
	lineHeight: '157%',
	letterSpacing: '0.1px',
};

theme.typography.caption = {
	fontFamily: inter.style.fontFamily,
	fontSize: '12px',
	fontWeight: 400,
	lineHeight: '166%',
	letterSpacing: '0.4px',
	[theme.breakpoints.down('sm')]: {
		fontSize: '10px',
	},
};

theme.typography.overline = {
	fontSize: '12px',
	fontWeight: 500,
	lineHeight: '266%',
	letterSpacing: '1px',
	textTransform: 'uppercase',
};

theme.typography.helper = {
	fontSize: '12px',
	fontWeight: 400,
	lineHeight: '166%',
	letterSpacing: '0.4px',
};

export default theme;
