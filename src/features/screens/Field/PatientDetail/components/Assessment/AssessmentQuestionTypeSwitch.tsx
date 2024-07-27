import { Typography } from '@mui/material';
import { Configuration } from '~/assessments/configurations';
import { AssessmentQuestion, AssessmentQuestionType } from '~/assessments/types';
import { SchemaAssessmentAnswer } from '~/common/types/AssessmentSuggestionAndChoice';
import { addMultipleIndex } from '~/common/utils/addMultipleIndex';
import { AdditionalDropdownConfigurationInput } from '~/server/api/routers/organization/organization.inputs';
import { AssessmentAdditionalEvaluationsForm } from './QuestionTypes/AssessmentAdditionalEvaluationsForm';
import { AssessmentAdvanceDirectivesFrom } from './QuestionTypes/AssessmentAdvanceDirectivesFrom';
import { AssessmentDiagnosisForm } from './QuestionTypes/AssessmentDiagnosisForm';
import { AssessmentFacilityForm } from './QuestionTypes/AssessmentFacilityForm';
import { AssessmentFreeForm } from './QuestionTypes/AssessmentFreeForm';
import { AssessmentHomeHealthAideVisitFrequenciesForm } from './QuestionTypes/AssessmentHomeHealthAideVisitFrequenciesForm';
import { AssessmentMedAdminForm } from './QuestionTypes/AssessmentMedAdminForm';
import { AssessmentMedicationForm } from './QuestionTypes/AssessmentMedicationForm';
import { AssessmentPlanBuilderForm } from './QuestionTypes/AssessmentPlanBuilderForm';
import { AssessmentProcedureForm } from './QuestionTypes/AssessmentProceedureForm';
import { AssessmentSelectAllThatApply } from './QuestionTypes/AssessmentSelectAllThatApply';
import { AssessmentSelectOne } from './QuestionTypes/AssessmentSelectOne';
import { AssessmentSkilledNursingVisitFrequenciesForm } from './QuestionTypes/AssessmentSkilledNursingVisitFrequenciesForm';
import { AssessmentSupplyListForm } from './QuestionTypes/AssessmentSupplyListForm';
import { AssessmentVaccinationForm } from './QuestionTypes/AssessmentVaccinationForm';
import { AssessmentVitalSignParametersForm } from './QuestionTypes/AssessmentVitalSignParametersForm';

type Props = {
	question: AssessmentQuestion;
	patientId: number;
	allAnswers: SchemaAssessmentAnswer[];
	configuration: Configuration;
	additionalDropdownConfigurationInput: AdditionalDropdownConfigurationInput;
	isSpawn?: boolean;
	readOnly?: boolean;
	multipleIndex?: number;
	print?: boolean;
};
export const AssessmentQuestionTypeSwitch = ({
	question,
	patientId,
	allAnswers,
	multipleIndex,
	configuration,
	additionalDropdownConfigurationInput,
	isSpawn = false,
	readOnly = false,
	print,
}: Props): JSX.Element => {
	const answer = allAnswers.find((oq) => {
		return oq.assessmentNumber === addMultipleIndex(question.id, multipleIndex);
	});
	switch (question.mappedType) {
		case AssessmentQuestionType.SelectAllThatApply:
			return (
				<AssessmentSelectAllThatApply
					configuration={configuration}
					additionalDropdownConfigurationInput={additionalDropdownConfigurationInput}
					allAnswers={allAnswers}
					question={question}
					patientId={patientId}
					answer={answer}
					isSpawn={isSpawn}
					readOnly={readOnly}
					multipleIndex={multipleIndex}
					print={print}
				/>
			);
		case AssessmentQuestionType.SelectOne:
			return (
				<AssessmentSelectOne
					configuration={configuration}
					additionalDropdownConfigurationInput={additionalDropdownConfigurationInput}
					allAnswers={allAnswers}
					question={question}
					patientId={patientId}
					answer={answer}
					isSpawn={isSpawn}
					readOnly={readOnly}
					multipleIndex={multipleIndex}
					print={print}
				/>
			);
		case AssessmentQuestionType.FreeForm:
			return (
				<AssessmentFreeForm
					configuration={configuration}
					additionalDropdownConfigurationInput={additionalDropdownConfigurationInput}
					allAnswers={allAnswers}
					question={question}
					patientId={patientId}
					answer={answer}
					isSpawn={isSpawn}
					readOnly={readOnly}
					multipleIndex={multipleIndex}
					print={print}
				/>
			);
		case AssessmentQuestionType.FreeFormNumber:
			return (
				<AssessmentFreeForm
					configuration={configuration}
					additionalDropdownConfigurationInput={additionalDropdownConfigurationInput}
					allAnswers={allAnswers}
					number
					question={question}
					patientId={patientId}
					answer={answer}
					isSpawn={isSpawn}
					readOnly={readOnly}
					multipleIndex={multipleIndex}
					print={print}
				/>
			);
		case AssessmentQuestionType.Date:
			return (
				<AssessmentFreeForm
					configuration={configuration}
					additionalDropdownConfigurationInput={additionalDropdownConfigurationInput}
					allAnswers={allAnswers}
					date
					question={question}
					patientId={patientId}
					answer={answer}
					isSpawn={isSpawn}
					readOnly={readOnly}
					multipleIndex={multipleIndex}
					print={print}
				/>
			);
		case AssessmentQuestionType.LongText:
			return (
				<AssessmentFreeForm
					configuration={configuration}
					additionalDropdownConfigurationInput={additionalDropdownConfigurationInput}
					allAnswers={allAnswers}
					question={question}
					patientId={patientId}
					answer={answer}
					isSpawn={isSpawn}
					readOnly={readOnly}
					multipleIndex={multipleIndex}
					print={print}
				/>
			);
		case AssessmentQuestionType.Medication:
			return (
				<AssessmentMedicationForm
					configuration={configuration}
					additionalDropdownConfigurationInput={additionalDropdownConfigurationInput}
					question={question}
					patientId={patientId}
					answer={answer}
					readOnly={readOnly}
					print={print}
				/>
			);
		case AssessmentQuestionType.Vaccination:
			return (
				<AssessmentVaccinationForm
					configuration={configuration}
					additionalDropdownConfigurationInput={additionalDropdownConfigurationInput}
					question={question}
					patientId={patientId}
					answer={answer}
					readOnly={readOnly}
					print={print}
				/>
			);
		case AssessmentQuestionType.Diagnosis:
			return (
				<AssessmentDiagnosisForm
					configuration={configuration}
					additionalDropdownConfigurationInput={additionalDropdownConfigurationInput}
					question={question}
					patientId={patientId}
					answer={answer}
					readOnly={readOnly}
					print={print}
				/>
			);
		case AssessmentQuestionType.MedAdmin:
			return (
				<AssessmentMedAdminForm
					configuration={configuration}
					additionalDropdownConfigurationInput={additionalDropdownConfigurationInput}
					question={question}
					patientId={patientId}
					answer={answer}
					readOnly={readOnly}
					print={print}
				/>
			);
		case AssessmentQuestionType.Panel:
			return (
				<Typography mb={2} variant={print ? 'body1' : 'body1b'}>
					{question.text}
				</Typography>
			);

		case AssessmentQuestionType.PlanBuilder:
			return (
				<AssessmentPlanBuilderForm
					configuration={configuration}
					additionalDropdownConfigurationInput={additionalDropdownConfigurationInput}
					question={question}
					patientId={patientId}
					answer={answer}
					readOnly={readOnly}
					print={print}
				/>
			);
		case AssessmentQuestionType.SupplyList:
			return (
				<AssessmentSupplyListForm
					configuration={configuration}
					additionalDropdownConfigurationInput={additionalDropdownConfigurationInput}
					question={question}
					patientId={patientId}
					answer={answer}
					readOnly={readOnly}
					print={print}
				/>
			);
		case AssessmentQuestionType.AdvanceDirectives:
			return (
				<AssessmentAdvanceDirectivesFrom
					configuration={configuration}
					additionalDropdownConfigurationInput={additionalDropdownConfigurationInput}
					question={question}
					patientId={patientId}
					answer={answer}
					readOnly={readOnly}
					print={print}
				/>
			);
		case AssessmentQuestionType.SkilledNursingVisitFrequencies:
			return (
				<AssessmentSkilledNursingVisitFrequenciesForm
					configuration={configuration}
					additionalDropdownConfigurationInput={additionalDropdownConfigurationInput}
					question={question}
					patientId={patientId}
					answer={answer}
					readOnly={readOnly}
					print={print}
				/>
			);
		case AssessmentQuestionType.HomeHealthAideVisitFrequencies:
			return (
				<AssessmentHomeHealthAideVisitFrequenciesForm
					configuration={configuration}
					additionalDropdownConfigurationInput={additionalDropdownConfigurationInput}
					question={question}
					patientId={patientId}
					answer={answer}
					readOnly={readOnly}
					print={print}
				/>
			);
		case AssessmentQuestionType.Procedures:
			return (
				<AssessmentProcedureForm
					configuration={configuration}
					additionalDropdownConfigurationInput={additionalDropdownConfigurationInput}
					question={question}
					patientId={patientId}
					answer={answer}
					readOnly={readOnly}
					print={print}
				/>
			);
		case AssessmentQuestionType.AdditionalEvaluation:
			return (
				<AssessmentAdditionalEvaluationsForm
					configuration={configuration}
					additionalDropdownConfigurationInput={additionalDropdownConfigurationInput}
					question={question}
					patientId={patientId}
					answer={answer}
					readOnly={readOnly}
					print={print}
				/>
			);
		case AssessmentQuestionType.Facilities:
			return (
				<AssessmentFacilityForm
					configuration={configuration}
					additionalDropdownConfigurationInput={additionalDropdownConfigurationInput}
					question={question}
					patientId={patientId}
					answer={answer}
					readOnly={readOnly}
					print={print}
				/>
			);
		case AssessmentQuestionType.VitalSignParameters:
			return (
				<AssessmentVitalSignParametersForm
					configuration={configuration}
					additionalDropdownConfigurationInput={additionalDropdownConfigurationInput}
					question={question}
					patientId={patientId}
					answer={answer}
					readOnly={readOnly}
					print={print}
				/>
			);

		default:
			return (
				<Typography variant="body1">
					id: {question.id},Unknown Question Type: {question.questionType}
				</Typography>
			);
	}
};
