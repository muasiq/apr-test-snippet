import { CustomAssessmentNumber } from '~/assessments/apricot/custom';
import { api } from '~/common/utils/api';
import { lookupQuestion } from '../../../../../../assessments/util/lookupQuestionUtil';
import { useConfiguration } from '../../../../../../common/hooks/useConfiguration';
import { SchemaAssessmentAnswer } from '../../../../../../common/types/AssessmentSuggestionAndChoice';
import { AssessmentMedicationForm } from '../../../PatientDetail/components/Assessment/QuestionTypes/AssessmentMedicationForm';

type Props = {
	patientId: number;
	answer: SchemaAssessmentAnswer;
	readOnly: boolean;
};
export function MedicationEntry({ patientId, answer, readOnly }: Props) {
	const { configuration } = useConfiguration();
	const additionalConfigQuery = api.organization.getAdditionalDropdownConfiguration.useQuery();

	if (!configuration || additionalConfigQuery.isLoading) {
		return null;
	}

	const question = lookupQuestion(CustomAssessmentNumber.MEDICATIONS, configuration);

	return (
		<AssessmentMedicationForm
			patientId={patientId}
			question={question}
			readOnly={readOnly}
			configuration={configuration}
			additionalDropdownConfigurationInput={additionalConfigQuery.data!}
			answer={answer}
			unsavedChangesAlert={true}
		/>
	);
}
