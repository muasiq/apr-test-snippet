import { Stack, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useShallowRouterQuery } from '../../../../../common/hooks/useShallowRouterQuery';
import { SaveNurseInterviewSOCQuestionInput } from '../../../../../server/api/routers/interviewQuestion/interviewQuestion.inputs';
import { SliderWithInput } from '../../../../ui/inputs/SliderWithInput';
import { FULL_HEIGHT_MINUS_NAVBAR } from '../../../../ui/layouts/TopNav';
import { BackForward } from './AnswerQuestion/BackForward';
import { saveInterviewSetupQuestion } from './SyncInterviewSetupQuestions';

const defaultWoundNumber = 1;
const maxWounds = 10;
type Props = {
	onBack?: () => void;
};
export const WoundNumber = ({ onBack }: Props): JSX.Element => {
	const router = useRouter();
	const { patientId, totalWoundNumber } = router.query as { patientId: string; totalWoundNumber?: string };
	const { push } = useShallowRouterQuery();
	const [sliderValue, setSliderValue] = useState(totalWoundNumber ? Number(totalWoundNumber) : defaultWoundNumber);

	const onContinue = async () => {
		const dataToUpdate: SaveNurseInterviewSOCQuestionInput = {
			patientId: Number(patientId),
			totalWounds: sliderValue,
		};

		await saveInterviewSetupQuestion(dataToUpdate);
		push({ totalWoundNumber: sliderValue, currentWoundNumber: 1, woundNumberSelect: 'false' });
	};

	return (
		<>
			<Stack p={5} height={FULL_HEIGHT_MINUS_NAVBAR}>
				<Stack flexGrow={1} justifyContent={'center'} alignItems={'center'} textAlign={'center'}>
					<Typography sx={{ textAlign: 'center' }} mb={2} variant="h4">
						How many wounds were found?
					</Typography>
					<SliderWithInput
						handleChange={(newValue) => {
							setSliderValue(newValue);
						}}
						value={sliderValue}
						min={1}
						max={maxWounds}
						defaultValue={defaultWoundNumber}
						incrementAmount={1}
					/>
				</Stack>
			</Stack>
			<BackForward onBack={onBack} onForward={onContinue} forwardDisabled={false} />
		</>
	);
};
