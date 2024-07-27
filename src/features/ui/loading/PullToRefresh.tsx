import { Box } from '@mui/material';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { usePullToRefresh } from 'use-pull-to-refresh';
import { ConfirmDialog } from '../Dialog/ConfirmDialog';
import { LoadingSpinner } from './LoadingSpinner';

const MAXIMUM_PULL_LENGTH = 240;
const REFRESH_THRESHOLD = 180;

export const PullToRefresh = () => {
	const { isReady, reload } = useRouter();
	const [isConfirming, setIsConfirming] = useState(false);

	const { isRefreshing } = usePullToRefresh({
		onRefresh: confirmRefresh,
		maximumPullLength: MAXIMUM_PULL_LENGTH,
		refreshThreshold: REFRESH_THRESHOLD,
		isDisabled: !isReady,
	});

	function confirmRefresh() {
		setIsConfirming(true);
	}

	if (isConfirming) {
		return (
			<ConfirmDialog
				title="Refresh Page?"
				body="Are you sure you want to refresh the page? Any unsaved changes will be lost."
				onConfirm={() => reload()}
				onClose={() => setIsConfirming(false)}
			/>
		);
	}

	if (isRefreshing) {
		return (
			<Box
				sx={{
					position: 'fixed',
					top: REFRESH_THRESHOLD / 3,
					left: '45%',
				}}
			>
				<LoadingSpinner color={'primary'} positionAbsolute={false} />
			</Box>
		);
	}
	return null;
};
