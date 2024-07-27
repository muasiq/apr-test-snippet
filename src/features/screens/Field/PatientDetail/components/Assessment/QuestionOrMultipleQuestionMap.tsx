import { Box, Typography } from '@mui/material';
import { get } from 'lodash';
import { AdditionalDropdownConfigurationInput } from '~/server/api/routers/organization/organization.inputs';
import { DataRendererLookup } from '../../../../../../assessments/apricot/data-renderers';
import { Configuration } from '../../../../../../assessments/configurations';
import { AutoCalculateMap } from '../../../../../../assessments/oasis/auto-calculate-fields';
import { PreReqMap } from '../../../../../../assessments/oasis/prerequisites/PreReqMap';
import { QuestionSource, SubGroup } from '../../../../../../assessments/types';
import { AutoCalculateFieldResolver } from '../../../../../../assessments/util/autoCalculateFieldsUtil';
import { lookupQuestion } from '../../../../../../assessments/util/lookupQuestionUtil';
import { SchemaAssessmentAnswer } from '../../../../../../common/types/AssessmentSuggestionAndChoice';
import { RouterOutputs } from '../../../../../../common/utils/api';
import { PatientWithJoins } from '../../../../../../server/api/routers/patient/patient.types';
import theme from '../../../../../../styles/theme';
import { AssessmentQuestionTypeSwitch } from './AssessmentQuestionTypeSwitch';

type Props = {
	subGroup: SubGroup;
	assessmentQuestionsForPatient: RouterOutputs['assessment']['getAllAssessmentQuestionsForPatient'];
	patientId: string | number;
	patientData: PatientWithJoins;
	configuration: Configuration;
	additionalDropdownConfigurationInput: AdditionalDropdownConfigurationInput;
	readOnly?: boolean;
	print?: boolean;
};
export function QuestionOrMultipleQuestionMap({
	subGroup,
	assessmentQuestionsForPatient,
	configuration,
	additionalDropdownConfigurationInput,
	print,
	readOnly,
	patientId,
	patientData,
}: Props) {
	if (subGroup.multiple) {
		const repeatTimes = get(patientData, subGroup.multiple.repeatTimesFieldResolver, 0) as number;
		return Array.from({ length: repeatTimes }, (_, index) => {
			return (
				<Box key={index}>
					<Typography my={2} variant="h5">
						{`${subGroup.heading} ${index + 1}`}
					</Typography>
					{subGroup.multiple!.questions.map((item, i) => {
						return (
							<QuestionMap
								multipleIndex={index + 1}
								key={item.id ?? '' + i}
								item={item}
								i={i}
								assessmentQuestionsForPatient={assessmentQuestionsForPatient}
								patientId={patientId}
								patientData={patientData}
								configuration={configuration}
								additionalDropdownConfigurationInput={additionalDropdownConfigurationInput}
								readOnly={readOnly}
								print={print}
							/>
						);
					})}
				</Box>
			);
		});
	}
	return subGroup.questions.map((item, i) => {
		return (
			<QuestionMap
				key={item.id ?? '' + i}
				item={item}
				i={i}
				assessmentQuestionsForPatient={assessmentQuestionsForPatient}
				patientId={patientId}
				patientData={patientData}
				configuration={configuration}
				additionalDropdownConfigurationInput={additionalDropdownConfigurationInput}
				readOnly={readOnly}
				print={print}
			/>
		);
	});
}

type QuestionMapProps = {
	item: QuestionSource;
	i: number;
	assessmentQuestionsForPatient: RouterOutputs['assessment']['getAllAssessmentQuestionsForPatient'];
	patientId: string | number;
	patientData: PatientWithJoins;
	configuration: Configuration;
	additionalDropdownConfigurationInput: AdditionalDropdownConfigurationInput;
	multipleIndex?: number;
	readOnly?: boolean;
	print?: boolean;
};
function QuestionMap({
	item,
	i,
	assessmentQuestionsForPatient,
	configuration,
	additionalDropdownConfigurationInput,
	print,
	multipleIndex,
	readOnly = false,
	patientId,
	patientData,
}: QuestionMapProps) {
	if (item.id && item.source) {
		if (checkIfNoPreReqOrPreReqSatisfied(item, assessmentQuestionsForPatient, configuration)) {
			return (
				<Box key={item.id} mb={3} borderLeft={print ? '' : `2px solid ${theme.palette.secondary.main}`} pl={2}>
					<AssessmentQuestionTypeSwitch
						configuration={configuration}
						additionalDropdownConfigurationInput={additionalDropdownConfigurationInput}
						allAnswers={(assessmentQuestionsForPatient ?? []) as unknown as SchemaAssessmentAnswer[]}
						question={lookupQuestion(item.id, configuration)}
						patientId={Number(patientId)}
						readOnly={readOnly}
						isSpawn={!!item.preRequisiteSatisfied}
						print={print}
						multipleIndex={multipleIndex}
					/>
				</Box>
			);
		}
	} else if (item.note) {
		return (
			<Box key={item.note} mb={3}>
				<Typography variant="h6">Note*: {item.note}</Typography>
			</Box>
		);
	} else if (item.patientDataResolver) {
		const DataResolverComponent = DataRendererLookup[item.patientDataResolver].Input;
		return (
			<Box key={i} mb={3}>
				<DataResolverComponent print={print} patientData={patientData} />
			</Box>
		);
	} else if (item.autoCalculateFieldResolver) {
		const AutoCalcComponent = AutoCalculateMap[item.autoCalculateFieldResolver].Input;
		return (
			<Box key={i} mb={3}>
				<AutoCalcComponent
					assessmentData={assessmentQuestionsForPatient as AutoCalculateFieldResolver['assessmentData']}
					readOnly={readOnly}
					print={print}
					configuration={configuration}
					additionalDropdownConfigurationInput={additionalDropdownConfigurationInput}
				></AutoCalcComponent>
			</Box>
		);
	} else {
		console.error('Invalid item', item);
		throw new Error('Invalid item');
	}
}

function checkIfNoPreReqOrPreReqSatisfied(
	item: QuestionSource,
	assessmentQuestionsForPatient: RouterOutputs['assessment']['getAllAssessmentQuestionsForPatient'],
	configuration: Configuration,
) {
	if (!item.preRequisiteSatisfied) {
		return true;
	}
	const lookup = PreReqMap[item.preRequisiteSatisfied];
	return lookup(assessmentQuestionsForPatient, configuration);
}
