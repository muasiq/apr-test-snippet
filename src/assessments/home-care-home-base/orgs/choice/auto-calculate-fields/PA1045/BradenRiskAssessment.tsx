import { Alert, Box, Stack } from '@mui/material';
import { useRouter } from 'next/router';
import theme from '~/styles/theme';
import { SchemaAssessmentAnswer } from '../../../../../../common/types/AssessmentSuggestionAndChoice';
import { AssessmentQuestionTypeSwitch } from '../../../../../../features/screens/Field/PatientDetail/components/Assessment/AssessmentQuestionTypeSwitch';
import { AutoCalculateInput } from '../../../../../../features/ui/oasis/AutoCalculateInput';
import {
	AutoCalculateFieldResolver,
	getAnsweredAssessmentQuestionsByEnum,
	getDataFileChoiceScore,
	getUnansweredQuestions,
} from '../../../../../util/autoCalculateFieldsUtil';
import { lookupQuestion } from '../../../../../util/lookupQuestionUtil';
import {
	BradenRiskAssessmentQuestions,
	getBradenRiskLevelText,
	getPA1049FollowUpQuestionIds,
} from './bradenRiskAssessmentUtil';

const label =
	'TOTAL SCORE (PATIENTS WITH A TOTAL SCORE OF 12 OR LESS ARE CONSIDERED TO BE AT HIGH RISK OF DEVELOPING PRESSURE ULCERS):';
const riskLabel = 'INDICATE THE BRADEN RISK LEVEL PRESENTED:';

function getBrandenRiskValue({ assessmentData, configuration }: AutoCalculateFieldResolver) {
	const answeredBradenRiskQuestions = getAnsweredAssessmentQuestionsByEnum(
		assessmentData,
		BradenRiskAssessmentQuestions,
	);
	const score = answeredBradenRiskQuestions.reduce(
		(acc, item) => acc + getDataFileChoiceScore(item, configuration),
		0,
	);
	const unansweredQuestions = getUnansweredQuestions(answeredBradenRiskQuestions, BradenRiskAssessmentQuestions);

	return {
		score,
		riskLevelText: getBradenRiskLevelText(score),
		unansweredQuestions,
		isComplete: unansweredQuestions.length === 0,
	};
}

export function getSerializedValue(props: AutoCalculateFieldResolver) {
	const { score, riskLevelText, isComplete } = getBrandenRiskValue(props);

	if (!isComplete) return undefined;

	return {
		children: [
			{ label, value: score },
			{ label: riskLabel, value: riskLevelText },
		],
		followups: getPA1049FollowUpQuestionIds(score, props.configuration),
	};
}

export function Input(props: AutoCalculateFieldResolver) {
	const { assessmentData, print, readOnly, configuration, additionalDropdownConfigurationInput } = props;
	const router = useRouter();

	const { score, riskLevelText, unansweredQuestions, isComplete } = getBrandenRiskValue(props);
	const { patientId } = router.query as { patientId: string; editSection?: string };
	const displayPA1049FollowUpQuestions = riskLevelText?.toLowerCase() === 'high risk';
	const allAnswers = (assessmentData ?? []) as unknown as SchemaAssessmentAnswer[];
	const pa1049FollowUpQuestionIds = getPA1049FollowUpQuestionIds(score, props.configuration);

	if (!configuration) return null;

	return (
		<>
			{isComplete ? (
				<Stack spacing={3}>
					<AutoCalculateInput question={label} score={score} />
					<AutoCalculateInput question={riskLabel} score={riskLevelText} />
					{displayPA1049FollowUpQuestions &&
						pa1049FollowUpQuestionIds?.map((questionId) => (
							<Box key={questionId} borderLeft={`2px solid ${theme.palette.secondary.main}`} pl={2}>
								<AssessmentQuestionTypeSwitch
									configuration={configuration}
									additionalDropdownConfigurationInput={additionalDropdownConfigurationInput}
									allAnswers={allAnswers}
									question={lookupQuestion(questionId, configuration)}
									patientId={Number(patientId)}
									readOnly={readOnly}
									isSpawn={true}
									print={print}
								/>
							</Box>
						))}
				</Stack>
			) : (
				<Alert severity="warning" icon={false}>
					Braden Risk Assessment Score Incomplete. Please finish answering {unansweredQuestions.join(', ')}{' '}
				</Alert>
			)}
		</>
	);
}
