import { Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import { allOasisQuestions } from '~/assessments/oasis/data-files';
import { If } from '~/features/ui/util/If';
import { getCanAnswer } from '~/server/api/routers/patient/patient.util';
import { DataRenderer } from './DataRenderer';
import { PatientDataProps } from './PatientDataProps';

export function getSerializedValue({ patientData }: PatientDataProps) {
	return {
		label: 'Patient Payor Details',
		children: patientData.PayorSources.map((source, index) => ({
			label: `Payor Source #${index + 1}`,
			children: [
				{ label: 'Identifier', value: source.payorSourceIdentifier ?? '' },
				{ label: 'Name', value: source.payorSourceName ?? '' },
				{ label: 'Type', value: source.payorSourceType ?? '' },
			],
		})),
	};
}

export const Input = ({ patientData, print }: PatientDataProps) => {
	const M0150 = useMemo(() => allOasisQuestions.find((q) => q.id === 'M0150'), []);
	const M0063 = useMemo(() => allOasisQuestions.find((q) => q.id === 'M0063'), []);
	const M0065 = useMemo(() => allOasisQuestions.find((q) => q.id === 'M0065'), []);
	const M0150_specify = useMemo(() => allOasisQuestions.find((q) => q.id === 'M0150_specify'), []);

	return (
		<Stack direction="column" spacing={2} ml={2}>
			<DataRenderer
				label={M0150?.text ?? ''}
				type="multiselect"
				options={M0150?.responses?.map((r) => ({ label: r.text, value: `${r.code}` })) ?? []}
				name="M0150Answer"
				value={patientData.M0150Answer}
				print={print}
			/>
			<If condition={getCanAnswer(M0063?.id, patientData.M0150Answer)}>
				<DataRenderer
					label={M0063?.text ?? ''}
					name="M0063Answer"
					value={patientData.M0063Answer ?? ''}
					print={print}
				/>
			</If>
			<If condition={getCanAnswer(M0065?.id, patientData.M0150Answer)}>
				<DataRenderer
					label={M0065?.text ?? ''}
					name="M0065Answer"
					value={patientData.M0065Answer ?? ''}
					print={print}
				/>
			</If>
			<If condition={getCanAnswer(M0150_specify?.id, patientData.M0150Answer)}>
				<DataRenderer
					label={M0150_specify?.text ?? ''}
					name="M0150SpecifyAnswer"
					value={patientData.M0150SpecifyAnswer ?? ''}
					print={print}
				/>
			</If>

			{patientData.PayorSources.map((source, index) => {
				return (
					<Stack spacing={2} ml={2} key={index}>
						<Typography variant="h6">Payor Source #{index + 1}</Typography>
						<DataRenderer
							label="Identifier"
							value={source.payorSourceIdentifier ?? ''}
							name="payorSourceIdentifier"
							print={print}
						/>
						<DataRenderer
							label="Name"
							value={source.payorSourceName ?? ''}
							name="payorSourceName"
							print={print}
						/>
						<DataRenderer
							label="Type"
							value={source.payorSourceType ?? ''}
							name="payorSourceType"
							print={print}
							type="text"
						/>
					</Stack>
				);
			})}
		</Stack>
	);
};
