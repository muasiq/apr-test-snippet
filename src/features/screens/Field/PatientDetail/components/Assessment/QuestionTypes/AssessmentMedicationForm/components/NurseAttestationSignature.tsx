import { Box, Typography } from '@mui/material';
import { formatDateTime } from '~/common/utils/dateFormat';
import { SignatureTextField } from '~/features/ui/inputs/SignatureTextField';

type Props = {
	verifiedBy: string;
	verifiedAt: string | Date;
};

export const NurseAttestationSignature = ({ verifiedBy, verifiedAt }: Props): JSX.Element => {
	return (
		<Box>
			<Typography variant="body2">
				{verifiedBy} acknowledged reviewing the medication(s) for any potential adverse effects and drug
				reactions, including ineffective drug therapy, significant side effects, significant drug interactions,
				duplicate drug therapy, and non-compliance with drug therapy on {formatDateTime(verifiedAt)}.
			</Typography>
			<SignatureTextField value={verifiedBy} readOnly={true} />
		</Box>
	);
};
