import { ArrowBack } from '@mui/icons-material';
import { Button, ButtonProps } from '@mui/material';
import { useRouter } from 'next/router';
import theme from '~/styles/theme';
import { Pages } from '../../../common/utils/showNavBars';

type Props = {
	iconColor?: string;
	text?: string;
} & ButtonProps;
export const BackButton = ({ iconColor, text = '', ...rest }: Props) => {
	const router = useRouter();

	const back = () => {
		if (router.query.selectedArtifact) {
			void router.push(
				{ pathname: router.pathname, query: { ...router.query, selectedArtifact: undefined } },
				undefined,
				{ shallow: true },
			);
			return;
		}
		if (router.pathname.includes('/field/patient')) {
			void router.push(Pages.FIELD_SCHEDULE);
			return;
		}
		if (router.pathname.includes('/office/patient')) {
			// they just landed on patient detail page and we want to use router back to persist their search params from patient list page
			if (router.query.currentTab === 'Information' && Object.keys(router.query).length === 2) {
				void router.back();
				return;
			}
			void router.push(Pages.OFFICE_PATIENT_LIST);
			return;
		}
	};

	return (
		<Button
			startIcon={
				<ArrowBack
					sx={{
						color: iconColor ?? theme.palette.text.primary,
					}}
				/>
			}
			variant="text"
			data-cy="back-button"
			onClick={() => back()}
			{...rest}
		>
			{text}
		</Button>
	);
};
