import { useRouter } from 'next/router';
import { api } from '~/common/utils/api';
import { Pages } from '../../../../../common/utils/showNavBars';
import { PatientWithJoins, PatientWithJoinsInclude } from '../../../../../server/api/routers/patient/patient.types';
import { PatientDrawer } from '../../PatientDetail/PatientDrawer';
import { InterviewState } from '../common/interviewState';
import { AreasToReportOn } from './AreasToReportOn';
import { DictationChoice } from './DictationChoice';
import { DistanceAndMinutes } from './DistanceAndMinutes';
import { MainInterview } from './MainInterview';
import { ResumeDictationChoice } from './ResumeDictationChoice';
import { Review } from './Review';
import { ReviewPrompt } from './ReviewPrompt';
import { ReviewRedoPrompt } from './ReviewRedoPrompt';
import { Success } from './Success';
import { UploadMedicationPrompt } from './UploadMedication/UploadMedicationPrompt';
import { UploadPrompt } from './UploadPrompt';
import { VisitDateAndTime } from './VisitDateAndTime';
import { WithinNormalLimits } from './WithinNormalLimits';

export const InterviewFlow = () => {
	const router = useRouter();
	const { interviewOpen, patientId, interviewState } = router.query as {
		interviewOpen: string;
		patientId: string;
		interviewState: InterviewState;
	};

	const { data: patientData } = api.patient.getById.useQuery(
		{
			id: Number(patientId),
			includes: PatientWithJoinsInclude,
		},
		{ enabled: Boolean(patientId) },
	);

	const onCloseDrawer = async () => {
		await router.push({
			pathname: `/field/patient/${patientId}`,
			query: {
				...(router.query.interviewState === InterviewState.REVIEW_REDO_PROMPT && {
					interviewOpen: 'true',
					interviewState: InterviewState.REVIEW,
				}),
			},
		});
	};

	function goHome() {
		void router.push(Pages.FIELD_SCHEDULE);
	}

	const renderSwitch = (patientData: PatientWithJoins) => {
		switch (interviewState) {
			case InterviewState.VISIT_DATE_AND_TIME:
				return <VisitDateAndTime patientData={patientData} />;
			case InterviewState.PHOTO_UPLOAD_MEDICATION:
				return <UploadMedicationPrompt patientData={patientData} />;
			case InterviewState.DISTANCE_AND_MINUTES:
				return <DistanceAndMinutes patientData={patientData} />;
			case InterviewState.PHOTO_UPLOAD_DOCUMENTATION:
			case InterviewState.PHOTO_UPLOAD_WOUNDS:
				return <UploadPrompt />;
			case InterviewState.AREAS_TO_REPORT_ON:
				return <AreasToReportOn patientData={patientData} />;
			case InterviewState.INITIAL_DICTATION_CHOICE:
				return <DictationChoice patientData={patientData} />;
			case InterviewState.RESUME_DICTATION_CHOICE:
				return <ResumeDictationChoice patientData={patientData} />;
			case InterviewState.MAIN_INTERVIEW:
				return <MainInterview patientData={patientData} />;
			case InterviewState.WITHIN_NORMAL_LIMITS:
				return <WithinNormalLimits patientData={patientData} />;
			case InterviewState.REVIEW_PROMPT:
				return <ReviewPrompt />;
			case InterviewState.REVIEW:
				return <Review fullHeight />;
			case InterviewState.REVIEW_REDO_PROMPT:
				return <ReviewRedoPrompt />;
			case InterviewState.SUCCESS:
				return <Success onDone={goHome} />;
			default:
				return;
		}
	};

	return (
		<PatientDrawer
			open={interviewOpen === 'true'}
			onClose={onCloseDrawer}
			patientName={`${patientData?.firstName} ${patientData?.lastName}`}
		>
			{patientData && renderSwitch(patientData)}
		</PatientDrawer>
	);
};
