import { Alert, Box } from '@mui/material';
import { AutoCalculateFieldResolver } from '~/assessments/util/autoCalculateFieldsUtil';
import { AutoCalculateInput } from '~/features/ui/oasis/AutoCalculateInput';

export const HEIGHT_QUESTION_ID = 'M1060A';
const label = 'Patient Height';

export function formatHeight(value: number) {
	const ft = Math.floor(value / 12);
	const inches = value % 12;
	return `${ft}ft ${inches}in`;
}

function getHeightValue({ assessmentData }: AutoCalculateFieldResolver) {
	const height = assessmentData.find((item) => item.assessmentNumber === HEIGHT_QUESTION_ID);
	return parseInt(height?.checkedResponse.choice ?? '');
}

export function getSerializedValue(props: AutoCalculateFieldResolver) {
	const height = getHeightValue(props);

	if (!height) {
		return { label, value: 'No height data available' };
	}

	return { label, value: formatHeight(height) };
}

export const Input = (props: AutoCalculateFieldResolver) => {
	const height = getHeightValue(props);

	if (!height) {
		return (
			<Box pl={2}>
				<Alert severity="warning" icon={false}>
					No height data available
				</Alert>
			</Box>
		);
	}

	return (
		<Box pl={2}>
			<AutoCalculateInput question="Patient Height" score={formatHeight(height)} />
		</Box>
	);
};
