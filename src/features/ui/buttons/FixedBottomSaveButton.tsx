import { Box, Slide } from '@mui/material';
import { LoadingButton } from '~/features/ui/loading/LoadingButton';

type Props = {
	isLoading: boolean;
	show: boolean;
	width?: string | number;
	ml?: number;
	dataCy?: string;
	onClick: () => void;
};
export function FixedBottomSaveButton({
	width = '100%',
	show,
	ml = 0,
	dataCy = 'save-button',
	isLoading,
	onClick,
}: Props): JSX.Element {
	return (
		<>
			<Slide direction="up" in={show} unmountOnExit>
				<Box position={'fixed'} bottom={0} right={0} left={0} width={width} zIndex={1000}>
					<Box p={3} ml={ml} bgcolor={'white'} boxShadow={'0px -4px 8px -2px rgba(59, 31, 43, 0.12)'}>
						<LoadingButton
							data-cy={dataCy}
							label="Save Changes"
							isLoading={isLoading}
							onClick={() => onClick()}
							fullWidth
							variant={'contained'}
						/>
					</Box>
				</Box>
			</Slide>
		</>
	);
}
