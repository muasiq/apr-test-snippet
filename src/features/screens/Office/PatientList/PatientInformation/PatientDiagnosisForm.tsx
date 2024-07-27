import { Box, Grid, Typography } from '@mui/material';
import { Fragment } from 'react';
import { Control, UseFormSetValue, useFieldArray } from 'react-hook-form';
import { AddAndRemoveButtons } from '~/features/screens/Field/PatientDetail/components/AddAndRemoveButtons';
import { DiagnosesForm } from '~/features/screens/Field/PatientDetail/components/Assessment/QuestionTypes/AssessmentDiagnosisForm/DiagnosesForm';
import { If } from '~/features/ui/util/If';
import { AssessmentCheckInput } from '~/server/api/routers/assessment/assessment.inputs';

type Props = {
	patientId?: number;
	formReadonly?: boolean;
	control: Control<AssessmentCheckInput>;
	setValue: UseFormSetValue<AssessmentCheckInput>;
};
const emptyDiagnosis = {
	diagnosisCode: '',
	diagnosisDescription: '',
	symptomControlRating: '',
	onsetOrExacerbation: '',
	dateOfOnsetOrExacerbation: new Date(),
};

export function PatientDiagnosisForm({ setValue, formReadonly, control }: Props) {
	const diagnosesArray = useFieldArray({
		control,
		name: 'checkedResponse.choice.diagnoses',
	});

	const handleAddForm = () => {
		diagnosesArray.append(emptyDiagnosis);
	};

	const handleRemoveForm = (index: number) => {
		diagnosesArray.remove(index);
	};

	return (
		<Box>
			<Typography variant="h6" mb={2}>
				Diagnoses
			</Typography>
			<If condition={!diagnosesArray.fields.length}>
				<AddAndRemoveButtons
					handleAdd={handleAddForm}
					readOnly={!!formReadonly}
					shouldShowAdd={true}
					shouldShowRemove={false}
					addText="Add Diagnosis"
				/>
			</If>

			{diagnosesArray.fields.map((field, index) => (
				<Fragment key={field.id}>
					<Grid container key={field.id} spacing={2}>
						<DiagnosesForm
							control={control}
							setValue={setValue}
							index={index}
							canCopy={false}
							readOnly={formReadonly}
						/>
					</Grid>
					<Box mt={1} mb={2}>
						<AddAndRemoveButtons
							handleRemove={() => handleRemoveForm(index)}
							handleAdd={handleAddForm}
							readOnly={!!formReadonly}
							shouldShowAdd={index === diagnosesArray.fields.length - 1}
							shouldShowRemove={diagnosesArray.fields.length > 1}
							addText="Add Diagnosis"
						/>
					</Box>
				</Fragment>
			))}
		</Box>
	);
}
