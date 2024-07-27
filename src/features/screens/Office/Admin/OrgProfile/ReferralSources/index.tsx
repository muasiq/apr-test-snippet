import { Stack } from '@mui/material';
import { AssociatedFacilities } from '~/features/screens/Office/Admin/OrgProfile/ReferralSources/AssociatedFacilities';
import { AssociatedPhysician } from '~/features/screens/Office/Admin/OrgProfile/ReferralSources/AssociatedPhysicians';

export function ReferralSources(): JSX.Element {
	return (
		<>
			<Stack spacing={3}>
				<AssociatedPhysician />
				<AssociatedFacilities />
			</Stack>
		</>
	);
}
