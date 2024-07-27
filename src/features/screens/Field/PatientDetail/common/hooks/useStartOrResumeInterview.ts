import { NurseInterview } from '@prisma/client';
import { uniq } from 'lodash';
import { useRouter } from 'next/router';
import {
	NurseInterviewGroups,
	NurseInterviewPhysicalAssessmentThemes,
	interview,
} from '../../../../../../assessments/nurse-interview/questions';
import { PatientWithJoins } from '../../../../../../server/api/routers/patient/patient.types';
import { InterviewState, SliderQuestions } from '../../../InterviewQuestion/common/interviewState';
import {
	getThemedAnswersByPatientId,
	numberOfItemsInDbForPatient,
} from '../../../InterviewQuestion/components/SyncInterviewQuestions';
import {
	checkInterviewSetupDataExistence,
	checkInterviewSetupDataExistenceForThemesToReportOn,
	getInterviewSetupThemesToReportOn,
} from '../../../InterviewQuestion/components/SyncInterviewSetupQuestions';
import { checkInterviewUploadDataExistence } from '../../../InterviewQuestion/components/SyncInterviewUploadQuestions';

const PATHNAME = '/field/patient/[patientId]';

type NextStepQueryParams = {
	patientId: number;
	interviewState?: InterviewState;
	questionShortLabel?: string;
	physicalAssessmentThemes?: string[];
	currentQuestion?: SliderQuestions | string;
	dictate?: boolean;
};

export const useStartOrResumeInterview = () => {
	const router = useRouter();

	const startOrResumeInterview = async (patientData: PatientWithJoins, dictate?: boolean) => {
		const patientId = patientData.id;
		const nurseInterviewData = patientData.NurseInterview;

		if (!nurseInterviewData) {
			return await navigateToNextStep({
				patientId,
				interviewState: InterviewState.VISIT_DATE_AND_TIME,
			});
		}

		const incompleteDistanceAndMinuteQuestion = await getIncompleteDistanceAndMinutesQuestion(
			nurseInterviewData,
			patientData.id,
		);

		if (incompleteDistanceAndMinuteQuestion) {
			return await navigateToNextStep({
				patientId,
				interviewState: InterviewState.VISIT_DATE_AND_TIME,
			});
		}

		if (!nurseInterviewData) {
			throw new Error(
				'getIncompleteDistanceAndMinutesQuestion() should have properly rerouted if no nurse interview data was present',
			);
		}

		const incompleteUploadSectionQuestion = await getIncompleteUploadSectionQuestion(
			nurseInterviewData,
			patientData.id,
		);
		if (incompleteUploadSectionQuestion) {
			return await navigateToNextStep({
				interviewState: incompleteUploadSectionQuestion,
				patientId,
			});
		}

		const selectedThemesToReportOnComplete = await isSelectThemesToReportOnSectionComplete(
			nurseInterviewData,
			patientData.id,
		);
		if (!selectedThemesToReportOnComplete) {
			return await navigateToNextStep({
				interviewState: InterviewState.AREAS_TO_REPORT_ON,
				patientId,
			});
		}

		const patientHasStartedMainInterview = await checkIfPatientHasStartedMainInterview(patientData);
		if (!patientHasStartedMainInterview) {
			return await navigateToNextStep({
				patientId,
				interviewState: InterviewState.INITIAL_DICTATION_CHOICE,
			});
		}

		const unansweredBaselineShortLabel = await getUnansweredThemeQuestionShortLabel(
			patientData,
			NurseInterviewGroups.Baseline,
		);
		if (unansweredBaselineShortLabel) {
			return await navigateToNextStep({
				patientId,
				interviewState: InterviewState.MAIN_INTERVIEW,
				physicalAssessmentThemes: nurseInterviewData.selectedThemesToReportOn,
				dictate,
				...unansweredBaselineShortLabel,
			});
		}

		const unansweredPhysicalAssessmentShortLabel = await getUnansweredThemeQuestionShortLabel(
			patientData,
			NurseInterviewGroups.PhysicalAssessment,
			nurseInterviewData.selectedThemesToReportOn as NurseInterviewPhysicalAssessmentThemes[],
		);
		if (unansweredPhysicalAssessmentShortLabel) {
			return await navigateToNextStep({
				patientId,
				interviewState: InterviewState.MAIN_INTERVIEW,
				physicalAssessmentThemes: nurseInterviewData.selectedThemesToReportOn,
				dictate,
				...unansweredPhysicalAssessmentShortLabel,
			});
		}

		return await navigateToNextStep({
			patientId,
			interviewState: InterviewState.WITHIN_NORMAL_LIMITS,
			dictate,
		});
	};

	const getUnansweredThemeQuestionShortLabel = async (
		patientData: PatientWithJoins,
		questionGroup: NurseInterviewGroups,
		physicalAssessmentThemes?: NurseInterviewPhysicalAssessmentThemes[],
	) => {
		const questions = interview.filter(
			(item) =>
				item.group === questionGroup &&
				(questionGroup !== NurseInterviewGroups.PhysicalAssessment ||
					physicalAssessmentThemes?.includes(item.theme as NurseInterviewPhysicalAssessmentThemes)),
		);

		const indexedDBAnswers = await getThemedAnswersByPatientId(patientData.id, questionGroup);

		const isQuestionAnswered = (questionShortLabel: string) => {
			if (questionShortLabel === 'Wounds') {
				return true;
			} else {
				return (
					patientData.InterviewQuestion.some((q) => {
						return q.interviewQuestionShortLabel === questionShortLabel;
					}) ||
					indexedDBAnswers.some((answer) => {
						return answer.interviewQuestionShortLabel === questionShortLabel;
					})
				);
			}
		};

		const baseMatch = questions.find((question) => !isQuestionAnswered(question.shortLabel))?.shortLabel ?? null;

		if (
			questionGroup === NurseInterviewGroups.PhysicalAssessment &&
			physicalAssessmentThemes?.includes(NurseInterviewPhysicalAssessmentThemes.Wounds)
		) {
			const indexedDbData = await checkInterviewSetupDataExistence(patientData.id);
			const totalWounds = indexedDbData.totalWounds ?? patientData.NurseInterview?.totalWounds;
			const allSavedWoundAnswers = patientData.InterviewQuestion.filter((q) =>
				q.interviewQuestionShortLabel.includes('Wounds'),
			);
			const allIndexedWoundAnswers = indexedDBAnswers.filter((q) =>
				q.interviewQuestionShortLabel.includes('Wounds'),
			);
			const allWoundAnswers = uniq(
				[...allSavedWoundAnswers, ...allIndexedWoundAnswers].map((w) => w.interviewQuestionShortLabel),
			);
			const totalWoundsAnswered = allWoundAnswers.length;
			if (!totalWounds) {
				return { questionShortLabel: NurseInterviewPhysicalAssessmentThemes.Wounds };
			}
			if (totalWoundsAnswered !== totalWounds) {
				const currentWound = totalWoundsAnswered + 1;
				return {
					questionShortLabel: NurseInterviewPhysicalAssessmentThemes.Wounds,
					totalWoundNumber: totalWounds,
					currentWoundNumber: currentWound,
				};
			}
		}
		if (baseMatch) {
			return { questionShortLabel: baseMatch };
		}
		return null;
	};

	const getIncompleteDistanceAndMinutesQuestion = async (
		nurseInterviewData: NurseInterview | null,
		patientId: number,
	): Promise<string | null> => {
		const indexedDbData = await checkInterviewSetupDataExistence(patientId);

		if (!nurseInterviewData && !indexedDbData) {
			return SliderQuestions.MINUTES_WITH_PATIENT;
		}

		const interviewSteps = [
			{
				check: nurseInterviewData?.minutesSpentWithPatient ?? indexedDbData.minutesSpentWithPatient,
				question: SliderQuestions.MINUTES_WITH_PATIENT,
			},
			{
				check: nurseInterviewData?.minutesSpentDriving ?? indexedDbData.minutesSpentDriving,
				question: SliderQuestions.MINUTES_DRIVING,
			},
			{
				check: nurseInterviewData?.distanceTraveled ?? indexedDbData.distanceTraveled,
				question: SliderQuestions.DISTANCE,
			},
		];

		for (const step of interviewSteps) {
			if (!step.check) {
				return step.question;
			}
		}

		return null;
	};

	const getIncompleteUploadSectionQuestion = async (
		nurseInterviewData: NurseInterview,
		patientId: number,
	): Promise<InterviewState | null> => {
		const indexedDbData = await checkInterviewUploadDataExistence(patientId);

		const uploadQuestionSteps = [
			{
				check:
					!!nurseInterviewData.hasCompletedWoundPhotoUpload || !!indexedDbData.hasCompletedWoundPhotoUpload,
				question: InterviewState.PHOTO_UPLOAD_WOUNDS,
			},
			{
				check:
					!!nurseInterviewData.hasCompletedMedicationPhotoUpload ||
					!!indexedDbData.hasCompletedMedicationPhotoUpload,
				question: InterviewState.PHOTO_UPLOAD_MEDICATION,
			},
			{
				check: !!nurseInterviewData.hasCompletedDocumentsUpload || !!indexedDbData.hasCompletedDocumentsUpload,
				question: InterviewState.PHOTO_UPLOAD_DOCUMENTATION,
			},
		];

		for (const step of uploadQuestionSteps) {
			if (!step.check) {
				return step.question;
			}
		}

		return null;
	};

	const selectedThemesToReportOn = async (
		nurseInterviewData: NurseInterview | undefined | null,
		patientId: number,
	) => {
		const indexedDbData = await getInterviewSetupThemesToReportOn(patientId);
		return indexedDbData.selectedThemesToReportOn ?? nurseInterviewData?.selectedThemesToReportOn;
	};

	const isSelectThemesToReportOnSectionComplete = async (nurseInterviewData: NurseInterview, patientId: number) => {
		const indexedDbData = await checkInterviewSetupDataExistenceForThemesToReportOn(patientId);
		return !!nurseInterviewData.selectedThemesToReportOn.length || !!indexedDbData.selectedThemesToReportOn;
	};

	const checkIfPatientHasStartedMainInterview = async (patientData: PatientWithJoins) => {
		const numberOfAnswersInIndexedDB = await numberOfItemsInDbForPatient(patientData.id);
		return !!patientData.InterviewQuestion.length || !!numberOfAnswersInIndexedDB;
	};

	const navigateToNextStep = async (query: NextStepQueryParams) => {
		await router.push({
			pathname: PATHNAME,
			query: { interviewOpen: true, ...query },
		});
	};

	const checkForDictationChoiceAndThenStartOrResume = async (patientData: PatientWithJoins) => {
		const patientHasStartedThemeQuestions = patientData.InterviewQuestion.length;
		const patientHasIncompleteBaselineQuestions = await getUnansweredThemeQuestionShortLabel(
			patientData,
			NurseInterviewGroups.Baseline,
		);
		const patientHasIncompletePhysicalAssessmentQuestions = await getUnansweredThemeQuestionShortLabel(
			patientData,
			NurseInterviewGroups.PhysicalAssessment,
			patientData.NurseInterview?.selectedThemesToReportOn as NurseInterviewPhysicalAssessmentThemes[],
		);

		if (
			patientHasStartedThemeQuestions &&
			(patientHasIncompleteBaselineQuestions ?? patientHasIncompletePhysicalAssessmentQuestions)
		) {
			return router.push({
				pathname: '/field/patient/[patientId]',
				query: {
					patientId: patientData.id,
					interviewOpen: true,
					interviewState: InterviewState.RESUME_DICTATION_CHOICE,
				},
			});
		}

		return startOrResumeInterview(patientData);
	};

	return {
		startOrResumeInterview,
		getUnansweredThemeQuestionShortLabel,
		checkIfPatientHasStartedMainInterview,
		selectedThemesToReportOn,
		checkForDictationChoiceAndThenStartOrResume,
	};
};
