import { AssessmentAnswer, AssessmentAnswerIntegrationStatus } from '@prisma/client';
import {
	BradenRiskAssessmentQuestions,
	getBradenRiskLevelText,
	getPA1049FollowUpQuestionIds,
} from '~/assessments/home-care-home-base/orgs/choice/auto-calculate-fields/PA1045/bradenRiskAssessmentUtil';
import { NUTRITIONAL_ASSESSMENT_QUESTION_DATA_OASIS_NUMBER } from '~/assessments/home-care-home-base/orgs/choice/auto-calculate-fields/PA2515/NutritionalAssessment';
import {
	getNutritionalAssessmentQuestionData,
	getNutritionalAssessmentScore,
} from '~/assessments/home-care-home-base/orgs/choice/auto-calculate-fields/PA2515/nutritionalAssessmentUtil';
import {
	MAHCRiskAssessmentQuestions,
	getMAHCRiskLevelText,
} from '~/assessments/home-care-home-base/orgs/choice/auto-calculate-fields/PA3208/MAHCRiskAssessmentUtil';
import { BimsAssessmentQuestions } from '~/assessments/oasis/auto-calculate-fields/C0500/BimsAssessmentUtil';
import { MoodInterviewQuestionsEnum } from '~/assessments/oasis/auto-calculate-fields/D0160/moodInterviewUtil';
import { HEIGHT_QUESTION_ID } from '~/assessments/oasis/auto-calculate-fields/PatientFormattedHeight';
import { AssessmentQuestionType } from '~/assessments/types';
import {
	getAnsweredAssessmentQuestionsByEnum,
	getDataFileChoiceScore,
} from '~/assessments/util/autoCalculateFieldsUtil';
import { Configuration } from '../../../../../assessments/configurations';
import { RpaAssessmentAnswerWithQuestionText, generateAnswer, hardCodedIds } from './patient-rpa.utils';

export type CalculatedQuestionResponse = {
	answers: RpaAssessmentAnswerWithQuestionText[];
	followups?: string[];
};

export function getBimsAssessmentAnswers(
	answers: AssessmentAnswer[] | null,
	configuration: Configuration | null,
): CalculatedQuestionResponse {
	const id = hardCodedIds.cust13;
	const label = 'BIMS Summary Score';
	if (!answers || !configuration) {
		return { answers: [generateAnswer(id, label, null, AssessmentQuestionType.FreeForm)] };
	}

	const answeredBimsQuestions = getAnsweredAssessmentQuestionsByEnum(answers, BimsAssessmentQuestions);

	const totalScore = answeredBimsQuestions.reduce(
		(acc, item) => acc + getDataFileChoiceScore(withCheckedResponse(item), configuration),
		0,
	);

	return { answers: [generateAnswer(id, label, totalScore, AssessmentQuestionType.FreeForm)] };
}

export function getBradenRiskAssessmentAnswers(
	answers: AssessmentAnswer[] | null,
	configuration: Configuration | null,
): CalculatedQuestionResponse {
	const BRADEN_RISK_LEVEL_QUESTION_ID = 'PA-f83cf9';
	const BRADEN_RISK_LEVEL_TEXT = 'INDICATE THE BRADEN RISK LEVEL PRESENTED: TYPE: LIST - MULTISELECT: N';
	const BRADEN_TOTAL_SCORE_QUESTION_ID = 'PA-fa9e30';
	const BRADEN_TOTAL_SCORE_TEXT =
		'TOTAL SCORE (PATIENTS WITH A TOTAL SCORE OF 12 OR LESS ARE CONSIDERED TO BE AT HIGH RISK OF DEVELOPING PRESSURE ULCERS): TYPE: NUMERIC - MULTISELECT: N';
	if (!answers || !configuration) {
		return {
			answers: [
				generateAnswer(
					BRADEN_TOTAL_SCORE_QUESTION_ID,
					BRADEN_TOTAL_SCORE_TEXT,
					null,
					AssessmentQuestionType.FreeFormNumber,
				),
				generateAnswer(
					BRADEN_RISK_LEVEL_QUESTION_ID,
					BRADEN_RISK_LEVEL_TEXT,
					null,
					AssessmentQuestionType.SelectOne,
				),
			],
		};
	}

	const answeredBradenRiskQuestions = getAnsweredAssessmentQuestionsByEnum(answers, BradenRiskAssessmentQuestions);
	const totalScore = answeredBradenRiskQuestions.reduce(
		(acc, item) => acc + getDataFileChoiceScore(withCheckedResponse(item), configuration),
		0,
	);
	const bradenRiskLevelText = getBradenRiskLevelText(totalScore);
	const pa1049FollowUpQuestionIds = getPA1049FollowUpQuestionIds(totalScore, configuration);

	return {
		answers: [
			generateAnswer(
				BRADEN_TOTAL_SCORE_QUESTION_ID,
				BRADEN_TOTAL_SCORE_TEXT,
				totalScore,
				AssessmentQuestionType.FreeFormNumber,
			),
			generateAnswer(
				BRADEN_RISK_LEVEL_QUESTION_ID,
				BRADEN_RISK_LEVEL_TEXT,
				bradenRiskLevelText,
				AssessmentQuestionType.SelectOne,
			),
		],
		followups: pa1049FollowUpQuestionIds,
	};
}

export function getNutritionalAssessment(
	answers: AssessmentAnswer[] | null,
	configuration: Configuration | null,
): CalculatedQuestionResponse {
	const nutritionalLabel = 'TOTAL NUTRITION ASSESSMENT SCORE: TYPE: NUMERIC - MULTISELECT: N';
	const riskLabel = 'BASED ON THE SCORE, THE NUTRITIONAL RISK LEVEL IS:  TYPE: TEXT - MULTISELECT: N';
	if (!answers || !configuration) {
		return {
			answers: [
				generateAnswer(hardCodedIds.cust14, nutritionalLabel, null, AssessmentQuestionType.FreeForm),
				generateAnswer(hardCodedIds.cust15, riskLabel, null, AssessmentQuestionType.SelectOne),
			],
		};
	}

	const nutritionalAssessmentQuestionData = getNutritionalAssessmentQuestionData(
		answers.map(withCheckedResponse),
		NUTRITIONAL_ASSESSMENT_QUESTION_DATA_OASIS_NUMBER,
	);

	const { nutritionalAssessmentScore, nutritionalRiskLevelText } = getNutritionalAssessmentScore(
		nutritionalAssessmentQuestionData?.checkedResponse.choice as unknown as string[] | undefined,
		configuration,
	);
	return {
		answers: [
			generateAnswer(
				hardCodedIds.cust14,
				nutritionalLabel,
				nutritionalAssessmentScore,
				AssessmentQuestionType.FreeForm,
			),
			generateAnswer(hardCodedIds.cust15, riskLabel, nutritionalRiskLevelText, AssessmentQuestionType.SelectOne),
		],
	};
}

export function getMAHCRiskAssessmentAnswers(
	answers: AssessmentAnswer[] | null,
	configuration: Configuration | null,
): CalculatedQuestionResponse {
	const mahcLabel =
		"ACCORDING TO THE MAHC 10 FALL RISK ASSESSMENT, THIS PATIENT'S SCORE IS: TYPE: NUMERIC - MULTISELECT: N";
	const riskLabel = 'BASED ON THE SCORE, THE PATIENT IS: TYPE: TEXT - MULTISELECT: N';
	if (!answers || !configuration) {
		return {
			answers: [
				generateAnswer(hardCodedIds.cust16, mahcLabel, null, AssessmentQuestionType.FreeForm),
				generateAnswer(hardCodedIds.cust17, riskLabel, null, AssessmentQuestionType.SelectOne),
			],
		};
	}

	const answeredMAHCRiskQuestions = getAnsweredAssessmentQuestionsByEnum(answers, MAHCRiskAssessmentQuestions);
	const totalScore = answeredMAHCRiskQuestions.reduce(
		(acc, item) => acc + getDataFileChoiceScore(withCheckedResponse(item), configuration),
		0,
	);
	const MAHCRiskLevelText = getMAHCRiskLevelText(totalScore);

	return {
		answers: [
			generateAnswer(hardCodedIds.cust16, mahcLabel, totalScore, AssessmentQuestionType.FreeForm),
			generateAnswer(hardCodedIds.cust17, riskLabel, MAHCRiskLevelText, AssessmentQuestionType.SelectOne),
		],
	};
}

export function getMoodInterviewAnswers(
	answers: AssessmentAnswer[] | null,
	configuration: Configuration | null,
): CalculatedQuestionResponse {
	if (!answers || !configuration) {
		return { answers: [generateAnswer('D0160', 'Total Severity Score:', null, AssessmentQuestionType.FreeForm)] };
	}

	const answeredQuestions = getAnsweredAssessmentQuestionsByEnum(answers, MoodInterviewQuestionsEnum);

	const totalScore = answeredQuestions
		.map((item) => withCheckedResponse(item))
		.reduce((acc, item) => acc + getDataFileChoiceScore(item, configuration), 0);

	const unansweredQuestionsLength = Object.values(MoodInterviewQuestionsEnum).length - answeredQuestions.length;

	return {
		answers: [
			generateAnswer(
				'D0160',
				'Total Severity Score:',
				unansweredQuestionsLength >= 3 ? 99 : totalScore,
				AssessmentQuestionType.FreeFormNumber,
			),
		],
	};
}

export function getFormattedHeight(answers: AssessmentAnswer[] | null): CalculatedQuestionResponse {
	const item = answers?.find((item) => item.assessmentNumber === HEIGHT_QUESTION_ID);

	if (!item?.checkedResponse) {
		return {
			answers: [
				generateAnswer(
					hardCodedIds.cust19,
					'Patient Height',
					'No height data available',
					AssessmentQuestionType.FreeForm,
				),
			],
		};
	}
	const height = withCheckedResponse(item);

	const value = parseInt(height?.checkedResponse.choice ?? '');

	return {
		answers: [
			generateAnswer(
				hardCodedIds.cust19,
				'Patient Height',
				`${Math.floor(value / 12)}ft ${value % 12}in`,
				AssessmentQuestionType.FreeForm,
			),
		],
	};
}

export function moodQuestionsBasedAssessmentAnswers(
	answers: AssessmentAnswer[] | null,
): RpaAssessmentAnswerWithQuestionText[] {
	const response = generateAnswer(
		'PA-ec76c0',
		'DID THE PATIENT RESPOND WITH A SYMPTOM PRESENCE OF "NOT ASSESSED/NO INFORMATION" OR A SYMPTOM FREQUENCY OF "7 - 11 DAYS" OR "12 - 14 DAYS"?',
		'NO - END PHQ INTERVIEW',
		AssessmentQuestionType.SelectOne,
	);

	const D0150A1 = answers?.find((item) => item.assessmentNumber === 'D0150A1');
	if (D0150A1 && withCheckedResponse(D0150A1).checkedResponse.choice === 'NOT ASSESSED/NO INFORMATION') {
		return [response];
	}

	const D0150B1 = answers?.find((item) => item.assessmentNumber === 'D0150B1');
	if (D0150B1 && withCheckedResponse(D0150B1).checkedResponse.choice === 'NOT ASSESSED/NO INFORMATION') {
		return [response];
	}

	const D0150A2 = answers?.find((item) => item.assessmentNumber === 'D0150A2');
	const a2AnswerText = (D0150A2 ? withCheckedResponse(D0150A2).checkedResponse.choice : '').toLowerCase();
	if (a2AnswerText.includes('7 - 11 days') || a2AnswerText.includes('12 - 14 days')) {
		return [response];
	}

	const D0150B2 = answers?.find((item) => item.assessmentNumber === 'D0150B2');
	const b2AnswerText = (D0150B2 ? withCheckedResponse(D0150B2).checkedResponse.choice : '').toLowerCase();
	if (b2AnswerText.includes('7 - 11 days') || b2AnswerText.includes('12 - 14 days')) {
		return [response];
	}
	return [{ ...response, checkedResponse: { choice: 'YES - CONTINUE TO PHQ9 INTERVIEW' } }];
}

export function weightInKg(answers: AssessmentAnswer[] | null): RpaAssessmentAnswerWithQuestionText[] {
	const POUND_TO_KG_MULTIPLIER = 0.453592;
	const WEIGHT_POUND_QUESTION_ID = 'AC1045';

	const assessment = answers?.find((item) => item.assessmentNumber === WEIGHT_POUND_QUESTION_ID);

	const response = generateAnswer(
		`${WEIGHT_POUND_QUESTION_ID}-1`,
		"What is the patient's measured weight, in kilogram?",
		null,
		AssessmentQuestionType.FreeFormNumber,
		AssessmentAnswerIntegrationStatus.Completed,
	);
	if (!assessment?.checkedResponse) {
		return [response];
	}
	if (typeof assessment.checkedResponse === 'object' && 'choice' in assessment.checkedResponse) {
		const weightInPound = +(assessment.checkedResponse.choice as string);

		return [
			{
				...response,
				checkedResponse: {
					choice: +(weightInPound * POUND_TO_KG_MULTIPLIER).toFixed(2),
				},
			},
		];
	}
	return [response];
}

export function autogeneratedCalculatedFields(
	answers: AssessmentAnswer[] | null,
): RpaAssessmentAnswerWithQuestionText[] {
	return [
		...moodQuestionsBasedAssessmentAnswers(answers),
		...weightInKg(answers),
		generateAnswer('M0080', 'Discipline of Person Completing Assignment', '1-RN', AssessmentQuestionType.FreeForm),
		generateAnswer(
			'M0100',
			'(OBQI)(M0100) THIS ASSESSMENT IS CURRENTLY BEING COMPLETED FOR THE FOLLOWING REASON:',
			'1 - Start of Care - FURTHER VISITS PLANNED',
			AssessmentQuestionType.FreeForm,
		),
		generateAnswer('M0110', 'Episode Timing', '1 - Early', AssessmentQuestionType.FreeForm),
	];
}

function withCheckedResponse(answer: AssessmentAnswer) {
	return {
		...answer,
		checkedResponse: {
			choice:
				answer.checkedResponse &&
				typeof answer.checkedResponse === 'object' &&
				'choice' in answer.checkedResponse
					? (answer.checkedResponse?.choice as string)
					: '',
		},
	};
}
