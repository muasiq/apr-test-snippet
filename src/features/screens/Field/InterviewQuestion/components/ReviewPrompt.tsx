import { Box, Button, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useInterval } from 'usehooks-ts';
import { If } from '~/features/ui/util/If';
import { useEffectOnce } from '../../../../../common/hooks/useEffectOnce';
import { useIsOnline } from '../../../../../common/hooks/useIsOnline';
import { useShallowRouterQuery } from '../../../../../common/hooks/useShallowRouterQuery';
import { pluralize } from '../../../../../common/utils/pluralize';
import { Pages } from '../../../../../common/utils/showNavBars';
import { InterviewState } from '../common/interviewState';
import { totalNumberOfItemsInDbToSyncForPatient } from './SyncInterviewQuestions';

export const ReviewPrompt = (): JSX.Element => {
	const { push } = useShallowRouterQuery();
	const router = useRouter();
	const { patientId } = router.query as { patientId: string };
	const [readyToReview, setReadyToReview] = useState(false);
	const [itemsStillNeedingToSync, setItemsStillNeedingToSync] = useState(0);
	const patientIdNumber = Number(patientId);

	const checkCount = async () => {
		if (readyToReview) return;
		const count = await totalNumberOfItemsInDbToSyncForPatient(patientIdNumber);
		if (count === 0) {
			setReadyToReview(true);
		}
		setItemsStillNeedingToSync(count);
	};

	useInterval(checkCount, readyToReview ? null : 500);

	useEffectOnce(() => {
		void checkCount();
	});

	const handleReviewNowClick = () => {
		push({ interviewState: InterviewState.REVIEW });
	};

	const { isOnline } = useIsOnline();

	return (
		<>
			<Stack p={3} height="80vh" alignContent={'center'} justifyContent={'center'}>
				<Box p={5} width={'100%'} sx={{ textAlign: 'center' }}>
					<If condition={readyToReview}>
						<Typography variant="h3" mb={3}>
							Almost done! Let&apos;s Review
						</Typography>
					</If>
					<If condition={isOnline && !readyToReview}>
						<Typography variant="h3" mb={3}>
							Almost done! We have a few more things to sync before you can review.
						</Typography>
						<Typography variant="body1">
							Please don&apos;t leave this page until the sync is complete. Contact
							support@apricothealth.ai if you don&apos;t see any progress.
						</Typography>
					</If>
					<If condition={!isOnline && !readyToReview}>
						<Typography variant="h4">
							That&apos;s it for now! Come back when you have cell service or wifi to review.
						</Typography>
					</If>
				</Box>
				<Stack sx={{ position: 'fixed', bottom: '60px', left: '10px', right: '10px' }} spacing={2}>
					<Button
						data-cy="soc-interview-review-now-button"
						disabled={!readyToReview}
						fullWidth
						onClick={handleReviewNowClick}
						variant="contained"
					>
						{readyToReview
							? 'Review Now'
							: `Syncing ${itemsStillNeedingToSync} ${pluralize('item', itemsStillNeedingToSync)}...`}
					</Button>
					<Button fullWidth onClick={() => void router.push(Pages.FIELD_SCHEDULE)} variant="outlined">
						Finish Later
					</Button>
				</Stack>
			</Stack>
		</>
	);
};
