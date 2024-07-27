import { ArrowBack, ArrowForward, Close, DateRange } from '@mui/icons-material';
import { Box, Fab, Stack, SxProps, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import theme from '~/styles/theme';
import { useShallowRouterQuery } from '../../../../../../common/hooks/useShallowRouterQuery';

const buttonStyle = {
	bgcolor: '#FFF',
	color: theme.palette.primary.main,
	border: `2px solid ${theme.palette.primary.main}`,
	boxShadow: 'none',
	'&.Mui-disabled': {
		backgroundColor: '#FFF',
		color: theme.palette.disabledButtonAccentColor,
		borderColor: theme.palette.disabledButtonAccentColor,
	},
} satisfies SxProps;

type Props = {
	disableBack?: boolean;
	disableForward?: boolean;
	onForward: () => void;
	onBackward?: () => void;
};
export const DateInputBackForward = ({ disableBack, disableForward, onForward, onBackward }: Props) => {
	const router = useRouter();
	const { push } = useShallowRouterQuery();

	const handleArrowBackClick = () => {
		if (disableBack) return;
		if (onBackward) {
			onBackward();
		} else {
			router.back();
		}
	};
	const handleEditDateBtnClick = () => {
		const isEditingDate = router.query.editDate === 'true';
		void push({ editDate: !isEditingDate });
	};

	return (
		<>
			<Stack
				position={'fixed'}
				mt={-4.5}
				bottom={20}
				width={'100%'}
				textAlign={'center'}
				alignItems={'center'}
				justifyContent={'center'}
				zIndex={2}
				spacing={2}
				direction={'row'}
				left={0}
			>
				<Fab
					disabled={disableBack}
					onClick={handleArrowBackClick}
					data-cy="soc-interview-back-button"
					variant="circular"
					sx={buttonStyle}
				>
					<ArrowBack />
				</Fab>
				<Stack pt={1.5} spacing={0.5}>
					<Fab
						onClick={handleEditDateBtnClick}
						data-cy="soc-interview-date-button"
						variant="circular"
						color="primary"
						sx={{ width: 72, height: 72 }}
					>
						{router.query.editDate === 'true' ? (
							<Close sx={{ fontSize: 31 }} />
						) : (
							<DateRange sx={{ fontSize: 31 }} />
						)}
					</Fab>
					<Typography textAlign="center" variant="caption">
						{router.query.editDate === 'true' ? 'Close' : 'Update'}
					</Typography>
				</Stack>
				<Fab
					disabled={disableForward}
					onClick={() => onForward()}
					data-cy="soc-interview-next-button"
					variant="circular"
					sx={buttonStyle}
				>
					<ArrowForward />
				</Fab>
			</Stack>
			<Box
				sx={{ position: 'fixed', bottom: 0, height: '72px', left: 0, right: 0 }}
				zIndex={1}
				boxShadow={
					'0px 2px 4px -1px rgba(0, 0, 0, 0.20), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12);'
				}
				borderRadius={'16px 16px 0px 0px;'}
				bgcolor={'#FFF'}
			></Box>
		</>
	);
};
