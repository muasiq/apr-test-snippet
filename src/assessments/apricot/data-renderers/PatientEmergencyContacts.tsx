import { Stack, Typography } from '@mui/material';
import { startCase } from 'lodash';
import { formatPhoneNumber } from '~/common/utils/phoneNumberFormat';
import { DataRenderer } from './DataRenderer';
import { PatientDataProps } from './PatientDataProps';

const label = 'Patient Emergency Contacts';

export function getSerializedValue({ patientData }: PatientDataProps) {
	if (!patientData.PatientEmergencyContacts.length) {
		return { label, children: [{ value: 'No emergency contacts added' }] };
	}

	return {
		label,
		children: patientData.PatientEmergencyContacts.map((contact, index) => ({
			label: `Contact #${index + 1}`,
			children: [
				{ label: 'Name', value: `${contact.firstName} ${contact.lastName}` },
				{ label: 'Relationship', value: contact.relationship },
				{ label: 'Type', value: contact.type?.map(startCase).join(', ') },
				{ label: 'Primary Phone', value: formatPhoneNumber(contact.phone) },
				...(contact.homePhone ? [{ label: 'Home Phone', value: formatPhoneNumber(contact.homePhone) }] : []),
				...(contact.mobilePhone
					? [{ label: 'Mobile Phone', value: formatPhoneNumber(contact.mobilePhone) }]
					: []),
				...(contact.alternatePhone
					? [{ label: 'Alternate Phone', value: formatPhoneNumber(contact.alternatePhone) }]
					: []),
				...(contact.address ? [{ label: 'Address', value: contact.address }] : []),
				...(contact.city ? [{ label: 'City', value: contact.city }] : []),
				...(contact.state ? [{ label: 'State', value: contact.state }] : []),
				...(contact.zip ? [{ label: 'Zip', value: contact.zip }] : []),
				...(contact.availability?.length
					? [{ label: 'Availability', value: contact.availability.join(', ') }]
					: []),
				...(contact.notes ? [{ label: 'Notes', value: contact.notes }] : []),
			],
		})),
	};
}

export const Input = ({ patientData, print }: PatientDataProps) => {
	return (
		<>
			{patientData.PatientEmergencyContacts.map((contact, index) => {
				return (
					<Stack spacing={2} ml={2} key={index}>
						<Typography variant="h6">Contact #{index + 1}</Typography>
						<DataRenderer
							label="Contact Name"
							value={`${contact.firstName} ${contact.lastName}`}
							name="contactName"
							print={print}
						/>
						<DataRenderer
							label="Contact Relationship"
							value={contact.relationship ?? ''}
							type="text"
							name="relationship"
							print={print}
						/>
						<DataRenderer
							label="Contact Phone"
							value={contact.phone ?? ''}
							type="pattern"
							format="(###) ###-####"
							name="phone"
							print={print}
						/>
					</Stack>
				);
			})}
		</>
	);
};
