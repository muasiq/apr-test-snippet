import { Box, Typography } from '@mui/material';
import { AdditionalDropdownConfigurationInput } from '~/server/api/routers/organization/organization.inputs';
import { Configuration } from '../../../../../../assessments/configurations';
import { SubGroup } from '../../../../../../assessments/types';
import { RouterOutputs } from '../../../../../../common/utils/api';
import { PatientWithJoins } from '../../../../../../server/api/routers/patient/patient.types';
import { QuestionOrMultipleQuestionMap } from './QuestionOrMultipleQuestionMap';

type Props = {
	subGroups: SubGroup[];
	assessmentQuestionsForPatient: RouterOutputs['assessment']['getAllAssessmentQuestionsForPatient'];
	patientId: string | number;
	patientData: PatientWithJoins;
	configuration: Configuration;
	additionalDropdownConfigurationInput: AdditionalDropdownConfigurationInput;
	readOnly?: boolean;
	print?: boolean;
};
export const SubGroupMap = ({
	subGroups,
	assessmentQuestionsForPatient,
	patientId,
	patientData,
	configuration,
	additionalDropdownConfigurationInput,
	readOnly = false,
	print,
}: Props) => {
	return subGroups.map((subGroup) => {
		return (
			<Box key={subGroup.heading}>
				<Typography mb={1} variant="h6" color="primary">
					{subGroup.heading}
				</Typography>
				<QuestionOrMultipleQuestionMap
					subGroup={subGroup}
					assessmentQuestionsForPatient={assessmentQuestionsForPatient}
					patientId={patientId}
					patientData={patientData}
					configuration={configuration}
					additionalDropdownConfigurationInput={additionalDropdownConfigurationInput}
					readOnly={readOnly}
					print={print}
				></QuestionOrMultipleQuestionMap>
			</Box>
		);
	});
};
