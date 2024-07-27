import { Stack, Typography } from '@mui/material';
import { formatPhoneNumber } from '~/common/utils/phoneNumberFormat';
import { DataRenderer } from './DataRenderer';
import { PatientDataProps } from './PatientDataProps';

const label = 'Associated Physicians';

export function getSerializedValue({ patientData }: PatientDataProps) {
	if (!patientData.PatientAssociatedPhysicians.length) {
		return { label, children: [{ value: 'No associated physicians added' }] };
	}

	return {
		label,
		children: patientData.PatientAssociatedPhysicians.map((provider, index) => ({
			label: index === 0 ? `Primary Provider` : `Secondary Provider ${index}`,
			children: [
				{ label: 'Name', value: provider.name },
				{ label: 'Phone', value: formatPhoneNumber(provider.phone) },
				{ label: 'Provider Type', value: provider.providerType },
				{ label: 'Referring Physician', value: provider.referringPhysician ?? '' },
				{ label: 'Notes', value: provider.notes ?? '' },
			],
		})),
	};
}

export const Input = ({ patientData, print }: PatientDataProps) => {
	return (
		<>
			{patientData.PatientAssociatedPhysicians.map((provider, index) => {
				return (
					<Stack spacing={2} ml={2} key={index}>
						<Typography variant="h6">
							{index === 0 ? `Primary Provider` : `Secondary Provider ${index}`}
						</Typography>
						<DataRenderer label="Name" value={`${provider.name}`} name="name" print={print} />

						<DataRenderer
							label="Phone"
							value={provider.phone ?? ''}
							name="phone"
							type="pattern"
							format="(###) ###-####"
							print={print}
						/>
						<DataRenderer
							label="Provider Type"
							value={provider.providerType}
							name="provider.providerType"
							print={print}
							type="text"
						/>
						<DataRenderer
							label="Referring Physician"
							value={provider.referringPhysician ?? ''}
							name="provider.referringPhysician"
							print={print}
							type="text"
						/>
						<DataRenderer label="Notes" value={provider.notes ?? ''} name="Notes" print={print} />
					</Stack>
				);
			})}
		</>
	);
};
