import theme from '~/styles/theme';

export const primaryTextFieldStyles = {
	'&:hover': {
		'& .MuiOutlinedInput-root': {
			'& fieldset': {
				borderColor: theme.palette.primary.main,
			},
		},
	},
	'& .MuiOutlinedInput-root': {
		'& fieldset': {
			borderColor: theme.palette.primary.main,
		},
	},
};
