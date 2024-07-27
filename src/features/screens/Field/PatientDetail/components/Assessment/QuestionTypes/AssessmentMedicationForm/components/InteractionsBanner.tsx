import { Alert, Button } from '@mui/material';
import { formatDateTime } from '~/common/utils/dateFormat';
import { pluralize } from '~/common/utils/pluralize';
import { AssessmentMedicationSchema } from '~/server/api/routers/assessment/assessment.inputs';

type Props = {
	onAction?: () => void;
	hideAction?: boolean;
	interactions: AssessmentMedicationSchema['interactions'];
	hideIcon?: boolean;
};

export function InteractionsBanner({ onAction, interactions, hideAction, hideIcon }: Props) {
	if (!interactions?.data.length) {
		return null;
	}

	const { text, color } = getInteractionsBannerDetails(interactions);

	const props: Partial<Parameters<typeof Alert>[0]> = { severity: color };
	if (hideIcon) {
		props.icon = false;
	}
	if (!hideAction) {
		props.action = (
			<Button size="small" onClick={onAction} color={color}>
				View
			</Button>
		);
	}

	return <Alert {...props}>{text}</Alert>;
}

function getInteractionsBannerDetails(interactions: NonNullable<AssessmentMedicationSchema['interactions']>) {
	if (interactions.verified) {
		return {
			color: 'success',
			text: `${interactions.verifiedBy} acknowledged reviewing medication interactions on ${formatDateTime(interactions.verifiedAt)}.`,
		} as const;
	}

	return {
		color: 'info',
		text: `${interactions?.data.length} medication ${pluralize('interaction', interactions?.data.length)}`,
	} as const;
}
