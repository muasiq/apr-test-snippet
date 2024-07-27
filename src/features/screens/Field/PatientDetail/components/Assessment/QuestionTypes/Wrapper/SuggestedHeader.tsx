import { Box, Typography } from '@mui/material';
import { LoadingSpinner } from '../../../../../../../ui/loading/LoadingSpinner';
import { If } from '../../../../../../../ui/util/If';

type Props = {
	loadingText?: string;
	loadingGuess: boolean;
	hasAcceptedValue: boolean;
};
export const SuggestedHeader = ({ loadingText, loadingGuess, hasAcceptedValue }: Props) => {
	if (hasAcceptedValue) {
		return <></>;
	} else if (loadingGuess) {
		return (
			<>
				<Box p={3}>
					<LoadingSpinner positionAbsolute={false} size={30} />
					<If condition={!!loadingText}>
						<Typography variant="h6">{loadingText}</Typography>
					</If>
				</Box>
			</>
		);
	}
};
