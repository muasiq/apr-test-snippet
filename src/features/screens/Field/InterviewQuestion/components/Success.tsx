import { Button, Stack } from '@mui/material';
import lottieFile from '~/../public/lottie/medical-report-initial.json';
import { TestInterstitialAnimation } from '../../../../ui/icons/lottie/TestInterstitialAnimation';

type Props = {
	onDone: () => void;
};
export function Success({ onDone }: Props): JSX.Element {
	return (
		<>
			<Stack>
				<TestInterstitialAnimation width={300} height={600} animationData={lottieFile} />
				<Button fullWidth onClick={() => onDone()} variant="outlined">
					Done
				</Button>
			</Stack>
		</>
	);
}
