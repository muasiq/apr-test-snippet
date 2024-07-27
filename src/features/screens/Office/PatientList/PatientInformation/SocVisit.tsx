import { Box, Grid, Stack, Typography } from '@mui/material';
import { orderBy } from 'lodash';
import { Control, useWatch } from 'react-hook-form';
import {
	FormAutocomplete,
	FormDatePicker,
	FormInlineCheckbox,
	FormSelect,
	FormTimePicker,
} from '~/features/ui/form-inputs';
import { CreatePatientInput, UpdatePatientInput } from '~/server/api/routers/patient/patient.inputs';
import { api } from '../../../../../common/utils/api';

type Props = {
	control: Control<CreatePatientInput | UpdatePatientInput>;
	formReadonly?: boolean;
};

export const SocVisit = ({ control, formReadonly }: Props): JSX.Element => {
	const { data: users } = api.user.getCaseManagerUsers.useQuery();
	const { data: locations } = api.organization.getLocations.useQuery();

	const { physicianOrderedSOCDateNA, locationId } = useWatch({ control });
	const patientId = useWatch({ control, name: 'id' });

	const resolvedUsers =
		users
			?.filter((user) => user.Locations.some((loc) => loc.id === locationId))
			.map((user) => ({ id: user.id, label: user.name ?? user.email })) ?? [];
	const sortedUsers = orderBy(resolvedUsers, 'label');

	return (
		<Box>
			<Typography mb={2} variant="h6">
				SOC Visit Details
			</Typography>
			<Grid container spacing={2}>
				<Grid item xs={12} sm={6}>
					<FormSelect
						control={control}
						data-cy="branch-input"
						name="locationId"
						label="Branch"
						options={locations?.map((location) => ({ value: +location.id, label: location.name })) ?? []}
						readOnly={formReadonly}
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<FormAutocomplete
						data-cy="case-manager-input"
						control={control}
						name="SOCVisitCaseManagerId"
						label={'Case Manager' + (patientId ? '' : ' (Optional)')}
						options={sortedUsers}
						disabled={!locationId}
						readOnly={formReadonly}
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<FormDatePicker
						dataCy="soc-visit-date"
						control={control}
						name="SOCVisitDate"
						label="SOC Visit Date"
						readOnly={formReadonly}
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<FormTimePicker
						data-Cy="soc-visit-time"
						control={control}
						name="SOCVisitTime"
						label={'SOC Visit Start Time' + (patientId ? '' : ' (Optional)')}
						readOnly={formReadonly}
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<FormDatePicker
						control={control}
						name="PatientReferralSource.referralDate"
						label="Referral Date"
						readOnly={formReadonly}
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<Stack direction="row">
						<FormDatePicker
							disabled={!!physicianOrderedSOCDateNA}
							control={control}
							name="physicianOrderedSOCDate"
							label="Date of Physician-ordered Start of Care"
							readOnly={formReadonly}
						/>
						<FormInlineCheckbox
							control={control}
							data-cy="soc-date-unknown-checkbox"
							label="N/A"
							name="physicianOrderedSOCDateNA"
							readOnly={formReadonly}
						/>
					</Stack>
				</Grid>
			</Grid>
		</Box>
	);
};
