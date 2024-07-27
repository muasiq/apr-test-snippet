import { IconButton, Stack, Typography } from '@mui/material';
import { ApricotMark } from '~/features/ui/icons/ApricotMark';
import { useShallowRouterQuery } from '../../../../../common/hooks/useShallowRouterQuery';

export const MagicButton = () => {
	const { push } = useShallowRouterQuery();
	return (
		<Stack spacing={2} justifyContent={'center'} alignItems={'center'}>
			<IconButton
				onClick={() => void push({ interviewTab: 'newOrInProgress' })}
				size="large"
				sx={{
					width: '120px',
					height: '120px',
					background: 'linear-gradient(126deg, #FE3B52 -7.77%, #FFAB91 160.05%)',
					color: '#FFF',
					'&:hover': {
						background: 'linear-gradient(126deg, #FE3B52 -7.77%, #FFAB91 160.05%)',
					},
				}}
			>
				<ApricotMark
					sx={{
						width: '56px',
						height: '56px',
					}}
				/>
			</IconButton>
			<Typography variant="h5">Get Started</Typography>
		</Stack>
	);
};
