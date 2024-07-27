export enum InterviewState {
	VISIT_DATE_AND_TIME = 'VISIT_DATE_AND_TIME',
	DISTANCE_AND_MINUTES = 'DISTANCE_AND_MINUTES',
	PHOTO_UPLOAD_WOUNDS = 'PHOTO_UPLOAD_WOUNDS',
	PHOTO_UPLOAD_MEDICATION = 'PHOTO_UPLOAD_MEDICATION',
	PHOTO_UPLOAD_DOCUMENTATION = 'PHOTO_UPLOAD_DOCUMENTATION',
	SELECT_ALL_IMAGES_OF = 'SELECT_ALL_IMAGES_OF',
	AREAS_TO_REPORT_ON = 'AREAS_TO_REPORT_ON',
	INITIAL_DICTATION_CHOICE = 'INITIAL_DICTATION_CHOICE',
	RESUME_DICTATION_CHOICE = 'RESUME_DICTATION_CHOICE',
	MAIN_INTERVIEW = 'MAIN_INTERVIEW',
	WITHIN_NORMAL_LIMITS = 'WITHIN_NORMAL_LIMITS',
	REVIEW_PROMPT = 'REVIEW_PROMPT',
	REVIEW = 'REVIEW',
	REVIEW_REDO_PROMPT = 'REVIEW_REDO_PROMPT',
	SUCCESS = 'SUCCESS',
}

export enum SliderQuestions {
	MINUTES_DRIVING = 'minutesSpentDriving',
	MINUTES_WITH_PATIENT = 'minutesSpentWithPatient',
	DISTANCE = 'distanceTraveled',
}

export const sliderQuestions = [
	{
		id: SliderQuestions.MINUTES_WITH_PATIENT,
		question: 'About how many minutes did you spend with the patient?',
		min: 45,
		max: 120,
		default: 60,
		nextQuestionParam: { currentQuestion: SliderQuestions.MINUTES_DRIVING },
		prevQuestionParam: { interviewState: InterviewState.VISIT_DATE_AND_TIME },
	},
	{
		id: SliderQuestions.MINUTES_DRIVING,
		question: "About how many minutes did you spend driving to and from the patient's home?",
		min: 5,
		max: 120,
		default: 60,
		nextQuestionParam: { currentQuestion: SliderQuestions.DISTANCE },
		prevQuestionParam: { currentQuestion: SliderQuestions.MINUTES_WITH_PATIENT },
	},
	{
		id: SliderQuestions.DISTANCE,
		question: 'About how many miles (roundtrip) did you travel to see the patient?',
		min: 5,
		max: 200,
		default: 50,
		nextQuestionParam: {
			interviewState: InterviewState.PHOTO_UPLOAD_MEDICATION,
			currentQuestion: InterviewState.PHOTO_UPLOAD_MEDICATION,
		},
		prevQuestionParam: { currentQuestion: SliderQuestions.MINUTES_DRIVING },
	},
];
