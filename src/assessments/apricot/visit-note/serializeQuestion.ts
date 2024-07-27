import { uniq } from 'lodash';
import { Configuration } from '~/assessments/configurations';
import { AutoCalculateMap } from '~/assessments/oasis/auto-calculate-fields';
import {
	AssessmentQuestion,
	AssessmentQuestionSources,
	AssessmentQuestionType,
	QuestionSource,
} from '~/assessments/types';
import { AutoCalculateFieldResolver } from '~/assessments/util/autoCalculateFieldsUtil';
import { lookupQuestion } from '~/assessments/util/lookupQuestionUtil';
import { getQuestionResolverType, QuestionResolverTypes } from '~/assessments/util/questionResolverType';
import { SchemaAssessmentAnswer } from '~/common/types/AssessmentSuggestionAndChoice';
import { addMultipleIndex } from '~/common/utils/addMultipleIndex';
import { formatDate } from '~/common/utils/dateFormat';
import { responseMatches } from '~/common/utils/responseMatches';
import { PatientWithJoins } from '~/server/api/routers/patient/patient.types';
import { CustomAssessmentNumber } from '../custom';
import { customAssessmentValue } from '../customSerializedValue';
import { DataRendererLookup } from '../data-renderers';
import { isSerializedComponent, SerializedNode } from './serializeConfig';

type QuestionProps = {
	question: QuestionSource;
	multipleIndex?: number;
	patientData: PatientWithJoins;
	configuration: Configuration;
	answers: SchemaAssessmentAnswer[];
	includeExplanations?: boolean;
};

export const SerializeQuestionLookup: Record<QuestionResolverTypes, (props: QuestionProps) => SerializedNode> = {
	[QuestionResolverTypes.ASSESSMENT]: ({
		question,
		configuration,
		answers,
		multipleIndex,
		patientData,
		includeExplanations,
	}) => {
		const resolved = lookupQuestion(question.id!, configuration);
		const answer = answers.find((oq) => {
			return oq.assessmentNumber === addMultipleIndex(resolved.id, multipleIndex);
		});

		const value = assessmentResolver({ answer, question: resolved });

		if (
			includeExplanations &&
			value &&
			!isSerializedComponent(value) &&
			answer?.generatedResponseAccepted &&
			answer.generatedResponse?.explanation
		) {
			value.note = `SOURCE: ${answer.generatedResponse.explanation}`;
		}

		// followups
		const response =
			resolved.responses?.filter((r) => responseMatches(answer?.checkedResponse?.choice, r.text)) ?? [];
		const followUp = uniq(response?.flatMap((r) => (r.followup ? r.followup : [])));

		if (followUp.length) {
			const serializedFollowups = followUp.map((q) => {
				const lookedUpFollowup = lookupQuestion(q, configuration);
				return serializeQuestion({
					question: lookedUpFollowup,
					multipleIndex,
					patientData,
					configuration,
					answers,
					includeExplanations,
				});
			});

			return { children: [value, ...serializedFollowups] };
		}

		return value;
	},
	[QuestionResolverTypes.NOTE]: ({ question }) => {
		return { label: `Note*: ${question.note}`, value: '' };
	},
	[QuestionResolverTypes.PATIENT_DATA]: ({ question, patientData }) => {
		return patientDataResolver({ question, patientData });
	},
	[QuestionResolverTypes.AUTO_CALCULATE]: ({
		question,
		configuration,
		answers,
		multipleIndex,
		patientData,
		includeExplanations,
	}) => {
		const value = autoCalculateResolver({
			question,
			assessmentData: answers as unknown as AutoCalculateFieldResolver['assessmentData'],
			configuration,
			additionalDropdownConfigurationInput: {
				facilityType: [],
				attachmentOptions: [],
				attachmentLocations: [],
				serviceLocations: [],
				patientContactRelationship: [],
				patientContactAvailability: [],
				payorType: [],
				advanceDirectiveType: [],
				advanceDirectiveContents: [],
				emergencyContactType: [],
				supplyDeliveryMethod: [],
				vaccinationType: [],
				vaccinationSource: [],
				medicationFrequency: [],
				medicationRoute: [],
				additionalMedicationDescriptors: [],
			},
			readOnly: true,
		});

		if (value && 'followups' in value && value.followups) {
			const serializedFollowups = value.followups.map((q) => {
				const lookedUpFollowup = lookupQuestion(q, configuration);
				return serializeQuestion({
					question: lookedUpFollowup,
					multipleIndex,
					patientData,
					configuration,
					answers,
					includeExplanations,
				});
			});

			return { children: [value, ...serializedFollowups] };
		}

		return value;
	},
};

export function serializeQuestion(props: QuestionProps) {
	const questionType = getQuestionResolverType(props.question);
	const serialize = SerializeQuestionLookup[questionType];
	return serialize(props);
}

function patientDataResolver({ question, patientData }: { question: QuestionSource; patientData: PatientWithJoins }) {
	const resolver = DataRendererLookup[question.patientDataResolver!];

	if (!resolver) {
		console.error('unknown patient data question:', question);
		throw new Error('unknown patient data question');
	}

	return resolver.getSerializedValue({ patientData });
}

function autoCalculateResolver({ question, ...rest }: AutoCalculateFieldResolver & { question: QuestionSource }) {
	const resolver = AutoCalculateMap[question.autoCalculateFieldResolver!];

	if (!resolver) {
		console.error('unknown auto calculate question:', question);
		throw new Error('unknown auto calculate question');
	}

	return resolver.getSerializedValue(rest);
}

function assessmentResolver({
	answer,
	question,
}: {
	answer?: SchemaAssessmentAnswer;
	question: AssessmentQuestion;
}): SerializedNode {
	if (question.source === AssessmentQuestionSources.Custom) {
		return customAssessmentResolver({ answer, question });
	}

	let value = answer?.checkedResponse?.choice ?? '';
	if (question.mappedType === AssessmentQuestionType.Date) {
		try {
			value = formatDate(value as string);
		} catch (e) {
			console.error(`Error formatting date for ${question.id}:`, { value, question });
		}
	} else if (question.mappedType === AssessmentQuestionType.SelectAllThatApply) {
		if (value) {
			const arrValue = Array.isArray(value) ? value : [value];
			value = arrValue.join('\n');
		}
	}

	return { label: formatAssessmentQuestionLabel(question), value: String(value) };
}

function customAssessmentResolver({
	answer,
	question,
}: {
	answer?: SchemaAssessmentAnswer;
	question: AssessmentQuestion;
}) {
	const id = question.id as CustomAssessmentNumber;
	const valueFn = customAssessmentValue[id];

	if (!valueFn) {
		throw new Error(`invalid custom assessment id: ${id}`);
	}

	const value = valueFn({ answer: answer?.checkedResponse as never, question });
	return { label: formatAssessmentQuestionLabel(question), children: [value] };
}

function formatAssessmentQuestionLabel(question: AssessmentQuestion) {
	let label = question.text;

	if (question.source === AssessmentQuestionSources.Oasis) {
		label = `(${question.id}) ${label}`;
	} else if (question.source === AssessmentQuestionSources.Pathways && question.treatmentCode) {
		label = `(${question.treatmentCode}) ${label}`;
	}
	return label;
}
