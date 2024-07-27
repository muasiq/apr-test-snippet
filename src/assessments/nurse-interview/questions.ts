/* eslint-disable @typescript-eslint/naming-convention */
export enum NurseInterviewGroups {
	Baseline = 'Baseline',
	PhysicalAssessment = 'Physical Assessment',
}

export enum NurseInterviewBaselineThemes {
	SOCVisit = 'SOC Visit',
	LivingSituation = 'Living Situation',
	HistoryAndFunctional = 'History and Functional',
	MedicationsAndPlanOfCare = 'Medications and Plan of Care',
}

export enum NurseInterviewPhysicalAssessmentThemes {
	Wounds = 'Wounds',
	Skin = 'Skin',
	IVAccess = 'IV Access',
	Pain = 'Pain',
	MentalCognitiveAndPsychosocial = 'Mental, Cognitive, and Psychosocial',
	EndocrineImmuneAndBlood = 'Endocrine, Immune, and Blood',
	CardiacAndRespiratory = 'Cardiac and Respiratory',
	HeadNeckVisionAndHearing = 'Head, Neck, Vision, and Hearing',
	Musculoskeletal = 'Musculoskeletal System',
	Nutrition = 'Nutrition',
	Elimination = 'Elimination',
	UrinaryCatheters = 'Urinary Catheter',
	Ostomies = 'Ostomies',
}

export enum ShortLabels {
	VisitDetails = 'VisitDetails',
	Vitals = 'Vitals',
	LivingSituation = 'LivingSituation',
	OutsideHomeHealthCare = 'OutsideHomeHealthCare',
	HealthHistory = 'HealthHistory',
	FunctionalHistory = 'FunctionalHistory',
	PatientMobility = 'PatientMobility',
	Wounds = 'Wounds',
	PressureUlcers = 'PressureUlcers',
	DailyLiving = 'DailyLiving',
	MedicationManagement = 'MedicationManagement',
	ActiveDiagnosis = 'ActiveDiagnosis',
	CarePlan = 'CarePlan',
	InterventionsNeeded = 'InterventionsNeeded',
	DischargeGoal = 'DischargeGoal',
	SkinCondition = 'SkinCondition',
	IVAccessDetails = 'IVAccessDetails',
	PainDescription = 'PainDescription',
	MemoryAssessment = 'MemoryAssessment',
	CognitiveAbilities = 'CognitiveAbilities',
	PsychologicalState = 'PsychologicalState',
	ImmuneBloodHealth = 'ImmuneBloodHealth',
	EndocrineSystemEvaluation = 'EndocrineSystemEvaluation',
	CardiovascularHealth = 'CardiovascularHealth',
	RespiratoryHealth = 'RespiratoryHealth',
	SightAndHearing = 'SightAndHearing',
	NoseThroatSinuses = 'NoseThroatSinuses',
	OstomyDetails = 'OstomyDetails',
	UrinaryCatheterManagement = 'UrinaryCatheterManagement',
	GastrointestinalAssessment = 'GastrointestinalAssessment',
	GenitourinarySystem = 'GenitourinarySystem',
	NutritionalStatus = 'NutritionalStatus',
	MusculoskeletalHealth = 'MusculoskeletalHealth',
	HeadNeckExamination = 'HeadNeckExamination',
}

export const physicalAssessmentThemes = Object.values(NurseInterviewPhysicalAssessmentThemes);

export const allThemes: AllThemes[] = [...Object.values(NurseInterviewBaselineThemes), ...physicalAssessmentThemes];

export const lookupQuestionByShortLabel = (shortLabel: ShortLabels) => {
	return interview.find((question) => question.shortLabel === shortLabel);
};

export function lookupQuestionByText(text: string) {
	return interview.find((question) => question.question === text);
}

export function allQuestionsForTheme(theme: AllThemes) {
	return interview.filter((question) => question.theme === theme);
}

export type AllThemes = NurseInterviewBaselineThemes | NurseInterviewPhysicalAssessmentThemes;

export type NurseInterviewQuestion = {
	group: NurseInterviewGroups;
	theme: NurseInterviewBaselineThemes | NurseInterviewPhysicalAssessmentThemes;
	shortLabel: ShortLabels;
	question: string;
	helperText: string[];
	defaultResponse?: string;
	multiShortLabel?: string;
};
export type NurseInterview = NurseInterviewQuestion[];

export const woundInterviewItem = (n: number) => {
	const shortLabel = ShortLabels.Wounds;
	const question = `Describe wound #${n}`;
	const helperText = [
		'Indicate the wound location, type, closure type, and stage.',
		'Highlight wound measurements, including shape, dimensions, and edge characteristics.',
		'Give a detailed description of the wound characteristics, including granulation, epithelialization, slough, eschar, undermining, tunneling, and condition of surrounding tissue.',
		'Describe any exudate, odor, necrotic tissue, or signs of infection observed.',
		"Provide details about any care or teaching provided related to this wound and the patient's response.",
	];
	const defaultResponse = 'No wounds present.';
	return {
		question,
		helperText,
		shortLabel,
		defaultResponse,
		group: NurseInterviewGroups.PhysicalAssessment,
		theme: NurseInterviewPhysicalAssessmentThemes.Wounds,
		multiShortLabel: `${shortLabel}${n}`,
	};
};

export const interview: NurseInterview = [
	{
		group: NurseInterviewGroups.Baseline,
		theme: NurseInterviewBaselineThemes.SOCVisit,
		shortLabel: ShortLabels.VisitDetails,
		question: 'Share details about your recent patient visit.',
		helperText: [
			'Include information about what time you arrived, who was there, how you identified the patient, and safety precautions used during the visit.',
			'Give a detailed description of the care and education you provided while you were there.',
			'Describe any demographic details learned about the patient (e.g. race, ethnicity, religion, martial status, preferred language)',
			"Indicate the date and time of any contact made with the patient's physician before or after the visit and describe what was communicated/discussed.",
		],
	},
	{
		group: NurseInterviewGroups.Baseline,
		theme: NurseInterviewBaselineThemes.SOCVisit,
		shortLabel: ShortLabels.Vitals,
		question: "Describe the patient's vital signs.",
		helperText: [
			'Highlight the measurements you took and the results.',
			'Describe whether the typical parameters for any vital signs need to be adjusted.',
		],
	},
	{
		group: NurseInterviewGroups.Baseline,
		theme: NurseInterviewBaselineThemes.LivingSituation,
		shortLabel: ShortLabels.LivingSituation,
		question: "Describe the patient's living situation.",
		helperText: [
			'Describe any other people living in the home.',
			'Describe the layout of the home and any obstacles related to mobility.',
			'Identify any hazards you saw or any places where safety/assistive equipment was lacking. ',
		],
	},
	{
		group: NurseInterviewGroups.Baseline,
		theme: NurseInterviewBaselineThemes.LivingSituation,
		shortLabel: ShortLabels.OutsideHomeHealthCare,
		question: 'Does the patient receive any care, services or assistance outside of home health care?',
		helperText: [
			"Include information about the patient's primary caregiver, their availability, and their willingness/ability to provide care.",
			'Describe any other community services or assistance the patient receives and who provides it.',
		],
	},
	{
		group: NurseInterviewGroups.Baseline,
		theme: NurseInterviewBaselineThemes.HistoryAndFunctional,
		shortLabel: ShortLabels.HealthHistory,
		question: "Describe the patient's health history.",
		helperText: [
			'Describe any recent hospitalizations or inpatient care, including causes and timeframes.',
			'Identify any recent or upcoming face-to-face visits with a physician.',
			'Describe any significant weight changes over the past six months.',
			'Identify any vaccinations received.',
		],
	},
	{
		group: NurseInterviewGroups.Baseline,
		theme: NurseInterviewBaselineThemes.HistoryAndFunctional,
		shortLabel: ShortLabels.FunctionalHistory,
		question: "Describe the patient's functional history.",
		helperText: [
			"Give a detailed description of the patient's mobility and ability to handle activities of daily living prior to the current illness",
			'Describe any history of falls, including the timeframe and reason for any falls.',
		],
	},
	{
		group: NurseInterviewGroups.Baseline,
		theme: NurseInterviewBaselineThemes.HistoryAndFunctional,
		shortLabel: ShortLabels.PatientMobility,
		question: "Describe the patient's mobility and ability to safely move around or leave their home.",
		helperText: [
			"Provide specific details about the patient's ability to move and ambulate safely, including any assistive devices that they use.",
			'Identify any goals the patient has for improving mobility.',
			'Indicate whether the patient has transportation to leave the home.',
		],
	},
	{
		group: NurseInterviewGroups.Baseline,
		theme: NurseInterviewBaselineThemes.HistoryAndFunctional,
		shortLabel: ShortLabels.PressureUlcers,
		question: "Describe the patient's risk for pressure ulcers.",
		helperText: [
			'Indicate whether the patient is confined to a bed or chair.',
			'Describe any moisture exposure.',
			"Describe the patient's ability to voice discomfort.",
			'Provide details about any interventions they might need in these areas.',
		],
	},
	{
		group: NurseInterviewGroups.Baseline,
		theme: NurseInterviewBaselineThemes.HistoryAndFunctional,
		shortLabel: ShortLabels.DailyLiving,
		question: "Describe the patient's ability to safely handle activities of daily living.",
		helperText: [
			"Provide specific details about the patient's current ability to safely bathe and dress themselves.",
			"Describe the patient's ability to safely manage toileting and eating.",
			"Indicate, in detail, the patient's goals for improvement in all of these areas.",
		],
	},
	{
		group: NurseInterviewGroups.Baseline,
		theme: NurseInterviewBaselineThemes.MedicationsAndPlanOfCare,
		shortLabel: ShortLabels.MedicationManagement,
		question: "Describe the patient's ability to prepare and take their medications reliably and safely.",
		helperText: [
			'Provide details about any medication issues that were noted and any precautions the patient should take with medications',
			'Indicate if the patient has allergies.',
			'Describe any education you provided about medications.',
		],
	},
	{
		group: NurseInterviewGroups.Baseline,
		theme: NurseInterviewBaselineThemes.MedicationsAndPlanOfCare,
		shortLabel: ShortLabels.ActiveDiagnosis,
		question: "Describe the patient's active diagnoses",
		helperText: [
			'Describe any chronic or acute conditions for which the patient requires education or care.',
			'Indicate when each condition began (or became worse) and how well each condition is currently managed.',
		],
	},
	{
		group: NurseInterviewGroups.Baseline,
		theme: NurseInterviewBaselineThemes.MedicationsAndPlanOfCare,
		shortLabel: ShortLabels.CarePlan,
		question: 'Describe your plan of care for this patient.',
		helperText: [
			'Indicate any additional disciplines needed.',
			'Describe how often the patient should receive visits.',
			'Describe any supplies, devices, or durable materials needed.',
		],
	},
	{
		group: NurseInterviewGroups.Baseline,
		theme: NurseInterviewBaselineThemes.MedicationsAndPlanOfCare,
		shortLabel: ShortLabels.InterventionsNeeded,
		question: 'Describe the interventions needed by the patient.',
		helperText: [
			'Provide details about procedures, tests, or wound care that should be performed.',
			'Provide details any education that should be provided.',
			"Describe anything else that a skilled nurse should do while in the patient's home.",
		],
	},
	{
		group: NurseInterviewGroups.Baseline,
		theme: NurseInterviewBaselineThemes.MedicationsAndPlanOfCare,
		shortLabel: ShortLabels.DischargeGoal,
		question: 'Describe the goals and discharge plan for this patient.',
		helperText: [
			"Indicate the patient's stated goal for themselves.",
			'Describe your goals for the patient upon discharge',
			'Include your assessment of prognosis and rehab potential, as well as your discharge plan for the patient.',
		],
	},
	woundInterviewItem(1),
	{
		group: NurseInterviewGroups.PhysicalAssessment,
		theme: NurseInterviewPhysicalAssessmentThemes.Skin,
		shortLabel: ShortLabels.SkinCondition,
		question: "Describe the patient's skin.",
		helperText: ['Include information about any bruising, itching, rashes, discoloration, or nail abnormalities.'],
		defaultResponse: 'Clean, dry, and intact.',
	},
	{
		group: NurseInterviewGroups.PhysicalAssessment,
		theme: NurseInterviewPhysicalAssessmentThemes.IVAccess,
		shortLabel: ShortLabels.IVAccessDetails,
		question: "Describe the patient's IV(s)?",
		helperText: [
			'Indicate the type of IV access and substances delivered.',
			'The condition of the IV access site, when the IV was inserted and when it was last changed.',
			'Provide lumen details and any problems associated with patency.',
			"Describe who's responsible for managing the IV and the dressing type and condition",
			'Provide details about any care or teaching provided related to the IV.',
		],
		defaultResponse: 'No IVs present.',
	},
	{
		group: NurseInterviewGroups.PhysicalAssessment,
		theme: NurseInterviewPhysicalAssessmentThemes.Pain,
		shortLabel: ShortLabels.PainDescription,
		question: "Describe the patient's pain.",
		helperText: [
			'Describe where the patient feels pain, how intense it is, and if anything helps alleviate it.',
			"Indicate whether pain interferes with the patient's sleep or daily activities.",
			"Provide your objective evaluation of the patient's pain.",
		],
		defaultResponse: 'No pain reported or observed.',
	},
	{
		group: NurseInterviewGroups.PhysicalAssessment,
		theme: NurseInterviewPhysicalAssessmentThemes.MentalCognitiveAndPsychosocial,
		shortLabel: ShortLabels.MemoryAssessment,
		question: "Describe the patient's memory and your neurologic findings.",
		helperText: [
			"Describe the patient's BIMS results",
			'Address any memory deficits, either observed or reported.',
			'Describe any abnormal sleep patterns.',
		],
		defaultResponse: 'Within normal limits',
	},
	{
		group: NurseInterviewGroups.PhysicalAssessment,
		theme: NurseInterviewPhysicalAssessmentThemes.MentalCognitiveAndPsychosocial,
		shortLabel: ShortLabels.CognitiveAbilities,
		question: "Describe the patient's cognitive abilities.",
		helperText: [
			"Include information about impairments that affect the patient's daily life, such as inability to make decisions or follow directions.",
			'Describe any assistance they need in these areas. ',
		],
		defaultResponse: 'Within normal limits',
	},
	{
		group: NurseInterviewGroups.PhysicalAssessment,
		theme: NurseInterviewPhysicalAssessmentThemes.MentalCognitiveAndPsychosocial,
		shortLabel: ShortLabels.PsychologicalState,
		question: "Describe the patient's psychological and mental state.",
		helperText: [
			'Include information about any irritability, anxiety, lethargy, or loneliness.',
			'Provide details about any depression symptoms.',
			'Address the type, severity, and frequency of any symptoms described.',
		],
		defaultResponse: 'Within normal limits',
	},
	{
		group: NurseInterviewGroups.PhysicalAssessment,
		theme: NurseInterviewPhysicalAssessmentThemes.EndocrineImmuneAndBlood,
		shortLabel: ShortLabels.ImmuneBloodHealth,
		question: "Describe the patient's immune system and blood health.",
		helperText: [
			'Include information about immunodeficiencies or signs of infection.',
			'Describe any unusual bleeding or bruising',
			'Indicate whether the patient has received transfusions or dialysis.',
		],
		defaultResponse: 'Within normal limits',
	},
	{
		group: NurseInterviewGroups.PhysicalAssessment,
		theme: NurseInterviewPhysicalAssessmentThemes.EndocrineImmuneAndBlood,
		shortLabel: ShortLabels.EndocrineSystemEvaluation,
		question: "Describe the patient's endocrine system.",
		helperText: [
			'If the patient has diabetes, describe any steps they take to manage it, how much assistance they require and from whom, and their typical blood sugar readings. ',
			'Make note of any thyroid issues, if applicable.',
		],
		defaultResponse: 'Within normal limits',
	},
	{
		group: NurseInterviewGroups.PhysicalAssessment,
		theme: NurseInterviewPhysicalAssessmentThemes.CardiacAndRespiratory,
		shortLabel: ShortLabels.CardiovascularHealth,
		question: "Describe the patient's cardiovascular health.",
		helperText: [
			'Include information about any conditions or concerns, such as edema, and if the patient uses corrective or assistive devices.',
		],
		defaultResponse: 'Within normal limits',
	},
	{
		group: NurseInterviewGroups.PhysicalAssessment,
		theme: NurseInterviewPhysicalAssessmentThemes.CardiacAndRespiratory,
		shortLabel: ShortLabels.RespiratoryHealth,
		question: "Describe the patient's respiratory health.",
		helperText: [
			'Include any abnormal findings and describe corrective or assistive devices the patient uses, such as supplemental oxygen.',
		],
		defaultResponse: 'Within normal limits',
	},
	{
		group: NurseInterviewGroups.PhysicalAssessment,
		theme: NurseInterviewPhysicalAssessmentThemes.HeadNeckVisionAndHearing,
		shortLabel: ShortLabels.SightAndHearing,
		question: "Describe the patients's sight and hearing.",
		helperText: [
			'Include information about any abnormal findings, their location, severity, and frequency.',
			'Describe any corrective/assistive devices the patient uses or needs.',
		],
		defaultResponse: 'Within normal limits',
	},
	{
		group: NurseInterviewGroups.PhysicalAssessment,
		theme: NurseInterviewPhysicalAssessmentThemes.HeadNeckVisionAndHearing,
		shortLabel: ShortLabels.NoseThroatSinuses,
		question: "Describe the patient's nose, mouth, throat, and sinuses.",
		helperText: [
			'Include information about any abnormal findings, their location, severity, and frequency.',
			'Describe any corrective/assistive devices the patient uses or needs.',
		],
		defaultResponse: 'Within normal limits',
	},
	{
		group: NurseInterviewGroups.PhysicalAssessment,
		theme: NurseInterviewPhysicalAssessmentThemes.HeadNeckVisionAndHearing,
		shortLabel: ShortLabels.HeadNeckExamination,
		question: "Describe the patient's scalp, face, and neck",
		helperText: [
			'Include information about any abnormal findings, their location, severity, and frequency.',
			'Describe any corrective/assistive devices the patient uses or needs.',
		],
		defaultResponse: 'Within normal limits',
	},
	{
		group: NurseInterviewGroups.PhysicalAssessment,
		theme: NurseInterviewPhysicalAssessmentThemes.Musculoskeletal,
		shortLabel: ShortLabels.MusculoskeletalHealth,
		question: "Describe the patient's bones, joints, and muscles.",
		helperText: ['Include information about the type and location of any issues or amputations.'],
		defaultResponse: 'Within normal limits',
	},
	{
		group: NurseInterviewGroups.PhysicalAssessment,
		theme: NurseInterviewPhysicalAssessmentThemes.Nutrition,
		shortLabel: ShortLabels.NutritionalStatus,
		question: "Describe the patient's nutritional health and hydration status",
		helperText: [
			'Include information about dietary restrictions, special diets, or special feeding procedures.',
			"Describe the patient's ability to remain properly hydrated. ",
			'Address any habits or limitations that might affect adequate nutrition or hydration.',
		],
		defaultResponse: 'Within normal limits',
	},
	{
		group: NurseInterviewGroups.PhysicalAssessment,
		theme: NurseInterviewPhysicalAssessmentThemes.Elimination,
		shortLabel: ShortLabels.GenitourinarySystem,
		question: "Describe the patient's genitourinary system.",
		helperText: [
			'Include details about current/recent UTIs',
			'Describe any urinary incontinence issues, including frequency, how the patient manages these issues, and any related hygiene concerns.',
		],
		defaultResponse: 'Within normal limits',
	},
	{
		group: NurseInterviewGroups.PhysicalAssessment,
		theme: NurseInterviewPhysicalAssessmentThemes.Elimination,
		shortLabel: ShortLabels.GastrointestinalAssessment,
		question: "Describe the patient's gastrointestinal system.",
		helperText: [
			'Include information about abnormal findings, such as irregular bowel movements, vomiting, or ulcers.',
			'If the patient has bowel incontinence issues, include information about how frequently they have issues, how they manage them, and if there are any related hygiene concerns.',
		],
		defaultResponse: 'Within normal limits',
	},
	{
		group: NurseInterviewGroups.PhysicalAssessment,
		theme: NurseInterviewPhysicalAssessmentThemes.UrinaryCatheters,
		shortLabel: ShortLabels.UrinaryCatheterManagement,
		question: "Describe the patient's urinary catheter.",
		helperText: [
			"Describe how often it's changed, the urine color and volume",
			"Describe the bag's condition and any problems you saw",
			"Indicate the date it was last changed, who's responsible for changes, and any education you provided.",
		],
		defaultResponse: 'No urinary catheters present.',
	},
	{
		group: NurseInterviewGroups.PhysicalAssessment,
		theme: NurseInterviewPhysicalAssessmentThemes.Ostomies,
		shortLabel: ShortLabels.OstomyDetails,
		question: "Describe the patient's ostomy(s).",
		helperText: [
			'Include information about the type, its location, and whether it was related to an inpatient stay.',
		],
		defaultResponse: 'No ostomy present.',
	},
];
