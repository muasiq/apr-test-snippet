import { useRouter } from 'next/router';
import { useMemo } from 'react';
import {
	NurseInterviewGroups,
	NurseInterviewPhysicalAssessmentThemes,
	ShortLabels,
	interview,
	woundInterviewItem,
} from '../../../../../assessments/nurse-interview/questions';
import { useShallowRouterQuery } from '../../../../../common/hooks/useShallowRouterQuery';
import { PatientWithJoins } from '../../../../../server/api/routers/patient/patient.types';
import { InterviewState } from '../common/interviewState';
import { getPreviousNurseInterviewQuestion, nextQuestionLookup } from '../common/utils/mainInterviewUtil';
import { AnswerQuestion } from './AnswerQuestion';
import { WoundNumber } from './WoundNumber';

export function MainInterview({ patientData }: { patientData: PatientWithJoins }) {
	const router = useRouter();
	const { push } = useShallowRouterQuery();

	const {
		questionShortLabel,
		totalWoundNumber,
		woundNumberSelect,
		preventBack,
		physicalAssessmentThemes,
		currentWoundNumber,
		isInReview,
	} = router.query as {
		questionShortLabel?: string;
		totalWoundNumber?: string;
		woundNumberSelect?: string;
		preventBack?: string;
		physicalAssessmentThemes?: NurseInterviewPhysicalAssessmentThemes[];
		currentWoundNumber: string;
		isInReview?: string;
	};

	const filteredInterview = useMemo(
		() =>
			interview.filter((question) => {
				return (
					(preventBack !== 'true' && question.group === NurseInterviewGroups.Baseline) ||
					(physicalAssessmentThemes ?? []).includes(question.theme as NurseInterviewPhysicalAssessmentThemes)
				);
			}),
		[physicalAssessmentThemes, preventBack],
	);

	const currentQuestion = filteredInterview.find((question) => question.shortLabel === questionShortLabel);
	const nextQuestion = nextQuestionLookup(filteredInterview, questionShortLabel as ShortLabels);
	const isFinalQuestion = !nextQuestion;

	const interviewFlowHandleBack = () => {
		if (isInReview === 'true') {
			return void push({ interviewState: InterviewState.REVIEW_REDO_PROMPT });
		}

		const previousQuestion = getPreviousNurseInterviewQuestion(filteredInterview, questionShortLabel);
		if (questionShortLabel === 'Wounds') {
			if (currentWoundNumber === '1') {
				if (woundNumberSelect !== 'true') {
					void push({ woundNumberSelect: 'true' });
					return;
				}
			} else {
				void push({ currentWoundNumber: Number(currentWoundNumber) - 1 });
				return;
			}
		}

		if (previousQuestion) {
			void push({ questionShortLabel: previousQuestion.shortLabel, woundNumberSelect: 'false' });
		} else {
			if (preventBack !== 'true') {
				void push({ interviewState: InterviewState.AREAS_TO_REPORT_ON });
			}
		}
	};

	const interviewFlowHandleNext = () => {
		if (isInReview === 'true') {
			return void push({ interviewState: InterviewState.REVIEW_PROMPT, isInReview: undefined });
		}

		if (isFinalQuestion && !(questionShortLabel === 'Wounds' && totalWoundNumber !== currentWoundNumber)) {
			return void push({
				interviewState: InterviewState.WITHIN_NORMAL_LIMITS,
			});
		}

		if (questionShortLabel === 'Wounds' && totalWoundNumber !== currentWoundNumber) {
			return void push({ currentWoundNumber: Number(currentWoundNumber) + 1 });
		}

		const nextQuestion = nextQuestionLookup(filteredInterview, currentQuestion?.shortLabel);
		return void push({ questionShortLabel: nextQuestion?.shortLabel });
	};

	if (
		(questionShortLabel === woundInterviewItem(1).shortLabel && !totalWoundNumber) ||
		woundNumberSelect === 'true'
	) {
		return <WoundNumber onBack={interviewFlowHandleBack} />;
	}

	return (
		<AnswerQuestion
			key={questionShortLabel}
			patientData={patientData}
			onBack={interviewFlowHandleBack}
			onNext={interviewFlowHandleNext}
			filteredInterview={filteredInterview}
		/>
	);
}
