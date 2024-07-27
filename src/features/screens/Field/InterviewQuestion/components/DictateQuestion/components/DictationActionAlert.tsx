import { Alert, AlertTitle, Box, Button, Slide, Typography } from '@mui/material';
import { ReactElement, useRef } from 'react';
import theme from '~/styles/theme';

type Props = {
	icon: ReactElement;
	alertTitle: string;
	alertBody: string;
	alertActionButtonColor: string;
	actionButtonClick?: () => void;
	actionButtonText?: string;
	alertBackgroundColor?: string;
	textColor?: string;
};
export const DictationActionAlert = ({
	actionButtonClick,
	actionButtonText,
	alertBody,
	alertTitle,
	icon,
	alertBackgroundColor,
	alertActionButtonColor,
	textColor,
}: Props) => {
	const containerRef = useRef<HTMLElement>(null);

	return (
		<Box ref={containerRef} sx={{ overflow: 'hidden' }}>
			<Slide direction="down" in={true} mountOnEnter unmountOnExit container={containerRef.current}>
				<Alert
					sx={{
						px: 4,
						bgcolor: alertBackgroundColor ?? theme.palette.secondaryAlert,
						borderRadius: 0,
					}}
					icon={icon}
					action={
						actionButtonText && (
							<Button
								sx={{ color: alertActionButtonColor }}
								size="small"
								onClick={actionButtonClick}
								data-cy="dictation-action-alert-button"
							>
								{actionButtonText}
							</Button>
						)
					}
				>
					<AlertTitle sx={{ color: textColor }}>{alertTitle}</AlertTitle>
					<Box mt={-0.75}>
						<Typography sx={{ color: textColor }}>{alertBody}</Typography>
					</Box>
				</Alert>
			</Slide>
		</Box>
	);
};
