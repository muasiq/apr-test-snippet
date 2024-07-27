import { Stack } from '@mui/material';
import { formatDate } from '~/common/utils/dateFormat';
import { formatPhoneNumber } from '~/common/utils/phoneNumberFormat';
import { DataRenderer } from './DataRenderer';
import type { PatientDataProps } from './PatientDataProps';

export function getSerializedValue({ patientData }: PatientDataProps) {
	return {
		label: 'Patient Referral Source',
		children: [
			{ label: 'Name', value: patientData.PatientReferralSource?.contactName ?? '' },
			{ label: 'Phone', value: formatPhoneNumber(patientData.PatientReferralSource?.contactPhone) },
			{ label: 'Facility Name', value: patientData.PatientReferralSource?.facilityName ?? '' },
			{ label: 'Facility Type', value: patientData.PatientReferralSource?.facilityType ?? '' },
			{ label: 'Referral Date', value: formatDate(patientData.PatientReferralSource?.referralDate) },
		],
	};
}

export const Input = ({ patientData, print }: PatientDataProps) => {
	return (
		<Stack spacing={2} ml={2}>
			<DataRenderer
				label="Name"
				value={patientData.PatientReferralSource?.contactName ?? ''}
				name="contactName"
				print={print}
			/>
			<DataRenderer
				label="Phone"
				value={patientData.PatientReferralSource?.contactPhone ?? ''}
				name="contactPhone"
				type="pattern"
				format="(###) ###-####"
				print={print}
			/>
			<DataRenderer
				label="Facility Name"
				value={patientData.PatientReferralSource?.facilityName ?? ''}
				name="facilityName"
				print={print}
			/>
			<DataRenderer
				label="Facility Type"
				value={patientData.PatientReferralSource?.facilityType ?? ''}
				name="facilityType"
				print={print}
				type="text"
			/>
			<DataRenderer
				label="Referral Date"
				value={patientData.PatientReferralSource?.referralDate?.toISOString() ?? ''}
				name="referralDate"
				print={print}
				type="date"
			/>
		</Stack>
	);
};
