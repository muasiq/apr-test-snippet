import { Error } from '@mui/icons-material';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
import theme from '~/styles/theme';
import {
	NurseInterviewBaselineThemes,
	NurseInterviewPhysicalAssessmentThemes,
	NurseInterviewQuestion,
	interview,
} from '../../../../../../assessments/nurse-interview/questions';
import { useEffectOnce } from '../../../../../../common/hooks/useEffectOnce';
import { interviewResponseLookup } from '../../../../../../common/utils/interviewResponseLookup';
import { PatientWithReviewContext } from '../../../../../../server/api/routers/patient/patient.types';
import { If } from '../../../../../ui/util/If';
import {
	doesThemeSummaryAccordionItemHaveError,
	getNurseInterviewThemeWithSummariesByThemeName,
	isThemeStillLoadingSummaries,
} from '../../common/utils/reviewPageUtil';
import { AccordionQuestionError } from '../Review';
import { ThemeSummaryAccordionItem } from './ThemeSummaryAccordionItem';

type Props = {
	themeName: NurseInterviewBaselineThemes | NurseInterviewPhysicalAssessmentThemes;
	patientData: PatientWithReviewContext;
	isLoading: boolean;
	handleSummaryChange: (
		themeName: NurseInterviewBaselineThemes | NurseInterviewPhysicalAssessmentThemes,
		questionId: number | null,
		summary: string,
		questionText: string,
	) => void;
	accordionQuestionError: AccordionQuestionError[];
	setAccordionQuestionError: Dispatch<SetStateAction<AccordionQuestionError[]>>;
	canRedoThemeInterview: boolean;
	canEdit: boolean;
};

export const ThemeSummaryAccordion = ({
	isLoading,
	patientData,
	themeName,
	handleSummaryChange,
	accordionQuestionError,
	setAccordionQuestionError,
	canRedoThemeInterview,
	canEdit,
}: Props) => {
	const themeSummary = getNurseInterviewThemeWithSummariesByThemeName(themeName, patientData);
	const nurseInterviewThemeQuestions = interview.filter((item) => item.theme === themeName);

	const { isLoading: isLoadingThemeSummary, failedAudioTranscriptionQuestions } = isThemeStillLoadingSummaries(
		patientData,
		themeName,
	);

	useEffectOnce(() => {
		if (failedAudioTranscriptionQuestions.length > 0) {
			setAccordionQuestionError((prevQuestions) => [...prevQuestions, ...failedAudioTranscriptionQuestions]);
		}
	});

	const removeFailedAudioQuestion = (questionText: string) => {
		setAccordionQuestionError((prevQuestions) =>
			prevQuestions.filter((question) => question.question !== questionText),
		);
	};

	const addFailedAudioQuestion = (questionText: string) => {
		setAccordionQuestionError((prevQuestions) => [
			...prevQuestions,
			{
				theme: themeName,
				question: questionText,
				errorMessage: 'This question is required',
			},
		]);
	};

	return (
		<Box bgcolor={theme.palette.glass} border={'2px solid #FFF'} borderRadius={'8px'} p={2}>
			<Stack spacing={2} direction={'row'} alignItems={'center'} mb={3}>
				{(isLoading || isLoadingThemeSummary) && <CircularProgress size={20} />}
				{accordionQuestionError.find((q) => q.theme === themeName.toString()) &&
					(!isLoadingThemeSummary || !isLoading) && <Error color={'error'} />}
				<Typography variant="h5">{themeName}</Typography>
			</Stack>

			{isLoading || isLoadingThemeSummary ? (
				<Typography variant="body2">Loading data...</Typography>
			) : (
				<Stack spacing={3}>
					<If condition={!!themeSummary?.QuestionItems}>
						{themeSummary?.QuestionItems.map((question, index) => (
							<ThemeSummaryAccordionItem
								key={index}
								defaultValue={interviewResponseLookup(question, patientData)}
								question={question.question ?? 'No Question'}
								onChange={(e) => {
									handleSummaryChange(
										themeName,
										question.id ?? null,
										e.target.value,
										question.question,
									);
								}}
								hasError={doesThemeSummaryAccordionItemHaveError(
									accordionQuestionError,
									question as unknown as NurseInterviewQuestion,
								)}
								removeFailedAudioQuestion={removeFailedAudioQuestion}
								addFailedAudioQuestion={addFailedAudioQuestion}
								canEdit={canEdit}
								canRedo={canRedoThemeInterview}
							/>
						))}
					</If>
					<If condition={!themeSummary?.QuestionItems}>
						{nurseInterviewThemeQuestions.map((question, index) => (
							<ThemeSummaryAccordionItem
								key={index}
								defaultValue={question.defaultResponse ?? 'Within Normal Limits'}
								question={question.question ?? 'No Question'}
								onChange={(e) => {
									handleSummaryChange(themeName, null, e.target.value, question.question);
								}}
								hasError={doesThemeSummaryAccordionItemHaveError(accordionQuestionError, question)}
								removeFailedAudioQuestion={removeFailedAudioQuestion}
								addFailedAudioQuestion={addFailedAudioQuestion}
								canEdit={canEdit}
								canRedo={canRedoThemeInterview}
							/>
						))}
					</If>
				</Stack>
			)}
		</Box>
	);
};
