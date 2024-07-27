import { Box, Button, Container, Typography } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { isNurseInterviewPending } from '~/common/utils/patientStatusUtils';
import { Pages } from '~/common/utils/showNavBars';
import { trpc } from '~/common/utils/trpc';
import { useMixpanel } from '~/features/ui/layouts/Mixpanel/useMixpanel';
import { FULL_HEIGHT_MINUS_NAVBAR } from '~/features/ui/layouts/TopNav';
import { LoadingSpinner } from '~/features/ui/loading/LoadingSpinner';
import {
	NurseInterviewBaselineThemes,
	NurseInterviewPhysicalAssessmentThemes,
	allThemes,
} from '../../../../../assessments/nurse-interview/questions';
import { useAlert } from '../../../../../common/hooks/useAlert';
import { api } from '../../../../../common/utils/api';
import { ChangedAnswerData } from '../../../../../server/api/routers/interviewQuestion/interviewQuestion.inputs';
import { PatientWithReviewContext } from '../../../../../server/api/routers/patient/patient.types';
import { If } from '../../../../ui/util/If';
import { isBaselineInterviewTheme, shouldRefetchInterviewQuestionData } from '../common/utils/reviewPageUtil';
import { ThemeSummaryAccordion } from './ReviewPage/ThemeSummaryAccordion';

export type AccordionQuestionError = {
	question: string;
	theme: string;
	errorMessage: string;
};

export const Review = ({ fullHeight }: { fullHeight?: boolean }): JSX.Element => {
	const mixpanel = useMixpanel();
	const alert = useAlert();
	const router = useRouter();
	const { data: sessionData } = useSession();
	const [accordionQuestionError, setAccordionQuestionError] = useState<AccordionQuestionError[]>([]);
	const patientId = Number(router.query.patientId);

	const trpcUtils = trpc.useUtils();

	const patientQuery = api.patient.getById.useQuery(
		{
			id: patientId,
			includes: {
				NurseInterview: { include: { NurseInterviewThemeSummaries: { include: { QuestionItems: true } } } },
				InterviewQuestion: true,
			},
		},
		{
			enabled: !!router.query.patientId,
			refetchInterval: (data) =>
				shouldRefetchInterviewQuestionData(data as PatientWithReviewContext) ? 2000 : false,
		},
	);
	const patientData = patientQuery.data;

	const isField = router.asPath.startsWith('/field');

	const sendToQADisabled = patientQuery.isLoading || !patientData || accordionQuestionError.length > 0;
	const canEdit =
		sessionData?.user.id === patientData?.SOCVisitCaseManagerId &&
		!!patientData &&
		isNurseInterviewPending(patientData.status);

	const handleReviewEdits = (
		themeName: NurseInterviewPhysicalAssessmentThemes | NurseInterviewBaselineThemes,
		questionId: number | null,
		humanConfirmedSummarizedText: string,
		questionText: string,
	) => {
		const newChangedAnswer: ChangedAnswerData = {
			themeName,
			questionId,
			humanConfirmedSummarizedText,
			questionText,
		};
		void updateThemeSummaryMutation.mutate({
			patientId: Number(router.query.patientId),
			changedAnswerData: newChangedAnswer,
		});
	};

	const submitForQAMutation = api.interviewQuestion.submitForQA.useMutation({
		onSuccess: () => {
			mixpanel?.track('Submit Patient For QA');
			alert.addSuccessAlert({ message: 'On it! Drafting documentation now...' });
			void router.push(Pages.FIELD_SCHEDULE);
		},
		onError: (error) => {
			alert.addErrorAlert({ message: 'Error sending to QA!' });
			console.error('error sending to QA', error);
		},
	});

	const updateThemeSummaryMutation = api.interviewQuestion.updateNurseInterviewSummary.useMutation({
		onSuccess: () => {
			alert.addSuccessAlert({ message: 'Edits Saved!' });
			void trpcUtils.patient.getById.invalidate({ id: patientId });
		},
		onError: (error) => {
			alert.addErrorAlert({ message: 'Error saving!' });
			console.error('error saving', error);
		},
	});

	const handleSendToQAClick = () => {
		void submitForQAMutation.mutate({
			patientId: Number(router.query.patientId),
		});
	};

	const getCanRedoThemeInterview = (themeName: string) => {
		if (isBaselineInterviewTheme(themeName)) return true;

		return !!patientData?.NurseInterview?.selectedThemesToReportOn.includes(themeName);
	};

	if (!patientData) return <LoadingSpinner />;
	return (
		<Box display={'flex'} height={fullHeight ? FULL_HEIGHT_MINUS_NAVBAR : undefined} flexDirection={'column'}>
			<Box flexGrow={1} overflow={'auto'}>
				<If condition={isField}>
					<Box mt={5} mb={4}>
						<Typography variant="h4" textAlign={'center'}>
							Almost done!
							<br />
							Let&apos;s review.
						</Typography>
					</Box>
				</If>
				<Container>
					<Box sx={{ px: 1, pt: 1, mb: 10 }}>
						{allThemes.map((themeName, index) => (
							<ThemeSummaryAccordion
								key={index}
								themeName={themeName}
								patientData={patientData as PatientWithReviewContext}
								isLoading={patientQuery.isLoading}
								handleSummaryChange={handleReviewEdits}
								accordionQuestionError={accordionQuestionError}
								setAccordionQuestionError={setAccordionQuestionError}
								canRedoThemeInterview={getCanRedoThemeInterview(themeName)}
								canEdit={canEdit}
							/>
						))}
						<If condition={isField}>
							<Button
								data-cy="soc-interview-send-to-qa-button"
								disabled={sendToQADisabled}
								variant="contained"
								fullWidth
								onClick={handleSendToQAClick}
								sx={{ py: 1, mt: 3, mb: 3 }}
							>
								Draft Final Documentation
							</Button>
						</If>
					</Box>
				</Container>
			</Box>
		</Box>
	);
};
