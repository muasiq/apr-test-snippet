import { Button, CircularProgress, type ButtonProps } from '@mui/material';

type LoadingButtonProps = {
	label: string;
	isLoading: boolean;
} & ButtonProps;

export const LoadingButton = ({ label, isLoading, onClick, disabled, ...buttonProps }: LoadingButtonProps) => {
	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		if (onClick) {
			onClick(event);
		}
	};

	return (
		<Button {...buttonProps} onClick={handleClick} disabled={isLoading || disabled} sx={{ pl: 4.5 }}>
			{label}

			<CircularProgress
				sx={{
					visibility: isLoading ? 'visible' : 'hidden',
					ml: 1,
				}}
				size={20}
				color="inherit"
			/>
		</Button>
	);
};
