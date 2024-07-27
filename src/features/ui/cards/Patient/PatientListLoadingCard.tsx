import { Skeleton, Stack } from '@mui/material';

export const PatientListLoadingCard = () => {
	const randomWidthTop = Math.floor(Math.random() * (165 - 140 + 1)) + 140;
	const randomWidthBottom = Math.floor(Math.random() * (150 - 130 + 1)) + 130;

	return (
		<Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} p={2}>
			<Stack>
				<Skeleton width={randomWidthTop} height={35} variant="text" />
				<Skeleton width={randomWidthBottom} height={20} variant="text" />
			</Stack>
			<Stack direction={'row'} spacing={3} alignItems={'center'}>
				<Skeleton
					width={105}
					height={35}
					variant="rounded"
					sx={{
						borderRadius: '16px',
					}}
				/>
				<Skeleton width={30} height={30} variant="circular" />
			</Stack>
		</Stack>
	);
};
