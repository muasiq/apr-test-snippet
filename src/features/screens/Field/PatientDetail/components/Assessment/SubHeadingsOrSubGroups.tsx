import { Box, Typography } from '@mui/material';
import { AdditionalDropdownConfigurationInput } from '~/server/api/routers/organization/organization.inputs';
import { Configuration } from '../../../../../../assessments/configurations';
import { Group } from '../../../../../../assessments/types';
import { RouterOutputs } from '../../../../../../common/utils/api';
import { PatientWithJoins } from '../../../../../../server/api/routers/patient/patient.types';
import { SubGroupMap } from './SubGroupMap';

export type Props = {
	group: Group;
	assessmentQuestionsForPatient: RouterOutputs['assessment']['getAllAssessmentQuestionsForPatient'];
	patientId: string | number;
	configuration: Configuration;
	additionalDropdownConfigurationInput: AdditionalDropdownConfigurationInput;
	patientData: PatientWithJoins;
	readOnly?: boolean;
	print?: boolean;
};
export const SubHeadingsOrSubGroups = ({
	group,
	assessmentQuestionsForPatient,
	patientId,
	configuration,
	additionalDropdownConfigurationInput,
	patientData,
	readOnly,
	print,
}: Props): JSX.Element => {
	if (group.subHeadings?.length) {
		return (
			<Box>
				{group.subHeadings?.map((subHeading) => {
					return (
						<Box key={subHeading.heading}>
							<Typography my={3} variant="h5" color="secondary">
								{subHeading.heading}
							</Typography>
							<SubGroupMap
								configuration={configuration}
								additionalDropdownConfigurationInput={additionalDropdownConfigurationInput}
								subGroups={subHeading.subGroups}
								assessmentQuestionsForPatient={assessmentQuestionsForPatient}
								patientId={patientId}
								patientData={patientData}
								readOnly={readOnly}
								print={print}
							/>
						</Box>
					);
				})}
			</Box>
		);
	} else {
		return (
			<SubGroupMap
				configuration={configuration}
				additionalDropdownConfigurationInput={additionalDropdownConfigurationInput}
				subGroups={group.subGroups}
				assessmentQuestionsForPatient={assessmentQuestionsForPatient}
				patientId={patientId}
				patientData={patientData}
				readOnly={readOnly}
				print={print}
			/>
		);
	}
};
