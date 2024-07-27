/* eslint-disable @typescript-eslint/naming-convention */
import { CustomAssessmentNumber } from '../../../apricot/custom';
import { WOUND_HEADING, woundInterviewContext } from '../../../apricot/util';
import { NurseInterviewPhysicalAssessmentThemes } from '../../../nurse-interview/questions';
import { AutoCalculateOptions } from '../../../oasis/auto-calculate-fields/options';
import { PreReqOptions } from '../../../oasis/prerequisites/PreReqOptions';
import { AssessmentQuestionSources, Group } from '../../../types';

export const qaConfig: Group[] = [
	{
		heading: 'Patient Information',
		subGroups: [
			{
				heading: 'Demographics',
				questions: [
					{ id: 'A1005', source: AssessmentQuestionSources.Oasis, artifactContext: ['ReferralDocument'] }, //ethnicity
					{ id: 'A1010', source: AssessmentQuestionSources.Oasis, artifactContext: ['ReferralDocument'] }, //race
					{
						id: 'MQ29KAPBEQ',
						source: AssessmentQuestionSources.SOCStandardAssessment,
						artifactContext: ['ReferralDocument'],
					}, //language
					{ id: 'A1110B', source: AssessmentQuestionSources.Oasis, artifactContext: ['ReferralDocument'] }, //interpreter
					{
						id: 'PA-710511',
						source: AssessmentQuestionSources.PhysicalAssessment,
						artifactContext: ['ReferralDocument'],
					}, //marital
					{
						id: 'SSA102',
						source: AssessmentQuestionSources.SOCStandardAssessment,
						artifactContext: ['ReferralDocument'],
					}, // martial status for pt profile
					{
						id: 'PA-329f77',
						source: AssessmentQuestionSources.PhysicalAssessment,
						artifactContext: ['ReferralDocument'],
					}, //religion
					{
						id: 'PA-a2cb51',
						source: AssessmentQuestionSources.PhysicalAssessment,
						artifactContext: ['ReferralDocument'],
					}, //veteran status
					{
						id: 'PA-b3ba9f',
						source: AssessmentQuestionSources.PhysicalAssessment,
						artifactContext: ['ReferralDocument'],
					}, //strengths
					{
						id: 'PA-158940',
						source: AssessmentQuestionSources.PhysicalAssessment,
						artifactContext: ['ReferralDocument'],
					}, //financial factors
					{ id: 'B1300', source: AssessmentQuestionSources.Oasis, artifactContext: ['ReferralDocument'] }, //health literacy
				],
			},
			{
				heading: 'Living Situation',
				questions: [
					{ id: 'M1100', source: AssessmentQuestionSources.Oasis }, //living situation (who in home?)
					{ id: 'PA-809bd9', source: AssessmentQuestionSources.PhysicalAssessment }, //safety risk assessment
					{ id: 'PA-bd2f2c', source: AssessmentQuestionSources.PhysicalAssessment }, //safety hazards
					{ id: 'SSA100', source: AssessmentQuestionSources.PhysicalAssessment }, //driving directions
				],
			},
			{
				heading: 'Caregivers and Assistance',
				questions: [
					{ id: 'M2102F', source: AssessmentQuestionSources.Oasis }, //caregivers
					{ id: 'PA-7a7fc5', source: AssessmentQuestionSources.PhysicalAssessment }, //personal care services
					{
						id: 'PA-9a0579',
						source: AssessmentQuestionSources.PhysicalAssessment,
						artifactContext: ['ReferralDocument'],
					}, //other assistance
					{
						id: 'PA-185bff',
						source: AssessmentQuestionSources.PhysicalAssessment,
						artifactContext: ['ReferralDocument'],
					}, //referral needed?
				],
			},
			{
				heading: 'Homebound Status',
				questions: [
					{ id: 'A1250', source: AssessmentQuestionSources.Oasis }, //transportation
					{
						id: 'PA-bb14d8',
						source: AssessmentQuestionSources.PhysicalAssessment,
						artifactContext: ['ReferralDocument'],
					}, //homebound?
				],
			},
			{
				heading: 'Related Facilities',
				questions: [
					{
						id: CustomAssessmentNumber.FACILITIES,
						source: AssessmentQuestionSources.Custom,
					},
				],
			},
			{
				heading: 'Advance Directives',
				questions: [
					{
						id: CustomAssessmentNumber.ADVANCE_DIRECTIVES,
						source: AssessmentQuestionSources.Custom,
					},
				],
			},
		],
	},
	{
		heading: 'Vitals and Measures',
		subGroups: [
			{
				heading: 'Physician Notification Parameters',
				questions: [
					{
						id: CustomAssessmentNumber.VITAL_SIGN_PARAMETERS,
						source: AssessmentQuestionSources.Custom,
					},
				],
			},
			{
				heading: 'Height',
				questions: [
					{ id: 'AC1041', source: AssessmentQuestionSources.ApricotCore }, //height
				],
			},
			{
				heading: 'Weight',
				questions: [
					{ id: 'AC1044', source: AssessmentQuestionSources.ApricotCore }, //weight
				],
			},
			{
				heading: 'Pulse',
				questions: [{ id: 'AC1059E', source: AssessmentQuestionSources.ApricotCore }],
			},
			{
				heading: 'Blood Pressure',
				questions: [{ id: 'AC1079E', source: AssessmentQuestionSources.ApricotCore }],
			},
			{
				heading: 'Respirations',
				questions: [{ id: 'AC1069E', source: AssessmentQuestionSources.ApricotCore }],
			},
			{
				heading: 'Oxygen Saturation',
				questions: [{ id: 'AC1090E', source: AssessmentQuestionSources.ApricotCore }],
			},
			{
				heading: 'Temperature',
				questions: [{ id: 'AC1049', source: AssessmentQuestionSources.ApricotCore }],
			},
			{
				heading: 'Pain',
				questions: [{ id: 'AC1100', source: AssessmentQuestionSources.ApricotCore }],
			},
			{
				heading: 'Other Vitals and Measurements',
				questions: [
					{ id: 'AC1110', source: AssessmentQuestionSources.ApricotCore }, //blood sugar
					{ id: 'AC1120', source: AssessmentQuestionSources.ApricotCore }, //INR level
					{ id: 'AC1130', source: AssessmentQuestionSources.ApricotCore }, //prothrombin time
					{ id: 'AC1140', source: AssessmentQuestionSources.ApricotCore }, //ankle circ
					{ id: 'AC1150', source: AssessmentQuestionSources.ApricotCore }, //calf circ
					{ id: 'AC1160', source: AssessmentQuestionSources.ApricotCore }, //girth
					{ id: 'AC1170', source: AssessmentQuestionSources.ApricotCore }, //head circ
					{ id: 'AC1180', source: AssessmentQuestionSources.ApricotCore }, //instep circ
					{ id: 'AC1190', source: AssessmentQuestionSources.ApricotCore }, //thigh circ
				],
			},
		],
	},
	{
		heading: 'Health History',
		subGroups: [
			{
				heading: 'Recent Health History',
				questions: [
					{
						id: 'PA-73f37a',
						source: AssessmentQuestionSources.PhysicalAssessment,
						artifactContext: ['ReferralDocument'],
					}, //patient discharged from inpatient
					{ id: 'M1000', source: AssessmentQuestionSources.Oasis, artifactContext: ['ReferralDocument'] }, //recent hospitalization
					{
						id: 'PA-f2a5bc',
						source: AssessmentQuestionSources.PhysicalAssessment,
						artifactContext: ['ReferralDocument'],
					}, //home health recently?
					{
						id: 'PA-56b19d',
						source: AssessmentQuestionSources.PhysicalAssessment,
						artifactContext: ['ReferralDocument'],
					}, //outpatient therapy?
					{
						id: 'MQ3K8EDC1D',
						source: AssessmentQuestionSources.SOCStandardAssessment,
						artifactContext: ['ReferralDocument'],
					}, //face to face comments
				],
			},
			{
				heading: 'Significant Health History',
				questions: [
					{ id: 'O0110_A', source: AssessmentQuestionSources.Oasis, artifactContext: ['ReferralDocument'] }, //special treatments
					{
						id: 'PA-36d8ab',
						source: AssessmentQuestionSources.PhysicalAssessment,
						artifactContext: ['ReferralDocument'],
					}, //telehealth exclusions
				],
			},
			{
				heading: 'Vaccination Record',
				questions: [{ id: CustomAssessmentNumber.VACCINATIONS, source: AssessmentQuestionSources.Custom }],
			},
			{
				heading: 'Allergies',
				questions: [
					{
						id: 'MQ67LVO5CK',
						source: AssessmentQuestionSources.SOCStandardAssessment,
						artifactContext: ['ReferralDocument'],
					}, //allergies
				],
			},
		],
	},
	{
		heading: 'Active Diagnoses',
		subGroups: [
			{
				heading: 'Diagnoses',
				questions: [
					{ id: CustomAssessmentNumber.DIAGNOSES, source: AssessmentQuestionSources.Custom },
					{
						id: 'PA-2ccac4',
						source: AssessmentQuestionSources.PhysicalAssessment,
						artifactContext: ['ReferralDocument'],
					}, //primary diagnosis
					{
						id: 'PA-e2d583',
						source: AssessmentQuestionSources.PhysicalAssessment,
						artifactContext: ['ReferralDocument'],
					}, //conditions to include in POC
				],
			},
			{
				heading: 'Procedures',
				questions: [{ id: CustomAssessmentNumber.PROCEDURES, source: AssessmentQuestionSources.Custom }],
			},
			{
				heading: 'Comorbitities',
				questions: [
					{ id: 'M1028', source: AssessmentQuestionSources.Oasis, artifactContext: ['ReferralDocument'] }, //active diagnoses
					{ id: 'M1033', source: AssessmentQuestionSources.Oasis, artifactContext: ['ReferralDocument'] }, //hospitalization risk
					{
						id: 'PA-7075db',
						source: AssessmentQuestionSources.PhysicalAssessment,
						artifactContext: ['ReferralDocument'],
					}, //risk for ED use
				],
			},
		],
	},
	{
		heading: 'Medications',
		subGroups: [
			{
				heading: 'Medication List',

				questions: [
					{ id: CustomAssessmentNumber.MEDICATIONS, source: AssessmentQuestionSources.Custom },
					{ id: 'SSA500', source: AssessmentQuestionSources.SOCStandardAssessment },
				],
			},
			{
				heading: 'Medication Notes',
				questions: [
					{ id: 'N0415_1', source: AssessmentQuestionSources.Oasis, artifactContext: ['ReferralDocument'] }, //high risk drugs
					{ id: 'M2001', source: AssessmentQuestionSources.Oasis }, //med issues?
				],
			},
		],
	},
	{
		heading: 'Pain',
		subGroups: [
			{
				heading: 'Pain Assessment',
				questions: [
					{ id: 'PA-d58f74', source: AssessmentQuestionSources.PhysicalAssessment }, //pain?
					{ id: 'J0510', source: AssessmentQuestionSources.Oasis }, //effect on sleep
				],
			},
		],
	},
	{
		heading: 'Skin',
		subGroups: [
			{
				heading: 'Skin Assessment',
				questions: [
					{ id: 'PA-e08cb7', source: AssessmentQuestionSources.PhysicalAssessment }, //skin assessment
					{
						id: 'PA-c87a6a',
						source: AssessmentQuestionSources.PhysicalAssessment,
						artifactContext: ['ReferralDocument'],
					}, //IV access
				],
			},
			{
				heading: 'Pressure Ulcer Risk (Braden Risk Assessment)',
				questions: [
					{ id: 'PA-3c342a', source: AssessmentQuestionSources.PhysicalAssessment }, //sensory perception
					{ id: 'PA-8d5572', source: AssessmentQuestionSources.PhysicalAssessment }, //moisture
					{ id: 'PA-603f9e', source: AssessmentQuestionSources.PhysicalAssessment }, //physical activity
					{ id: 'PA-f30be6', source: AssessmentQuestionSources.PhysicalAssessment }, //control body position
					{ id: 'PA-806a93', source: AssessmentQuestionSources.PhysicalAssessment }, //nutrition
					{ id: 'PA-dfa675', source: AssessmentQuestionSources.PhysicalAssessment }, //friction and shear
					{ autoCalculateFieldResolver: AutoCalculateOptions.BRADEN_RISK_ASSESSMENT }, //risk level (number)
				],
			},
			{
				heading: 'Pressure Ulcers Overview',
				questions: [
					{ id: 'M1322', source: AssessmentQuestionSources.Oasis }, //number of stage 1pressure ulcers
					{ id: 'M1306', source: AssessmentQuestionSources.Oasis }, //does patient have at least 1 unhealed pressure ulcer?
					{ id: 'M1324', source: AssessmentQuestionSources.Oasis }, //stage of most problematic ulcer
				],
			},
			{
				heading: 'Stasis Ulcers Overview',
				questions: [
					{ id: 'M1330', source: AssessmentQuestionSources.Oasis }, //stasis ulcer?
				],
			},
			{
				heading: 'Surgical Wound Overview',
				questions: [
					{ id: 'M1340', source: AssessmentQuestionSources.Oasis }, //surgical wound?
				],
			},
		],
	},
	{
		heading: WOUND_HEADING,
		subGroups: [
			{
				questions: [],
				heading: 'Wound',
				multiple: {
					repeatTimesFieldResolver: 'NurseInterview.totalWounds',
					theme: NurseInterviewPhysicalAssessmentThemes.Wounds,
					questions: [
						{
							id: 'SSA01',
							source: AssessmentQuestionSources.SOCStandardAssessment,
							interviewContext: woundInterviewContext,
						}, //wound orders?
					],
				},
			},
		],
	},
	{
		heading: 'Head, Neck, Vision, and Hearing',
		subGroups: [
			{
				heading: 'Eyes and Vision',
				questions: [
					{ id: 'B1000', source: AssessmentQuestionSources.Oasis }, //vision
					{ id: 'PA-73ec57', source: AssessmentQuestionSources.PhysicalAssessment }, //corrective lenses
				],
			},
			{
				heading: 'Ears and Hearing',
				questions: [
					{ id: 'B0200', source: AssessmentQuestionSources.Oasis }, // hearing
				],
			},
		],
	},
	{
		heading: 'Cardiovascular and Respiratory',
		subGroups: [
			{
				heading: 'Cardiovascular System',
				questions: [
					{ id: 'PA-180690', source: AssessmentQuestionSources.PhysicalAssessment }, //cardio assessed?
				],
			},
			{
				heading: 'Respiratory System',
				questions: [
					{ id: 'PA-71b83a', source: AssessmentQuestionSources.PhysicalAssessment }, //respiratory assessment
					{ id: 'M1400', source: AssessmentQuestionSources.Oasis }, //when dyspneic
					{ id: 'PA-376bd7', source: AssessmentQuestionSources.PhysicalAssessment }, //activities affecting breathing
				],
			},
		],
	},
	{
		heading: 'Immune System',
		subGroups: [
			{
				heading: 'Infection Symptoms',
				questions: [
					{
						id: 'PA-35f8af',
						source: AssessmentQuestionSources.PhysicalAssessment,
						artifactContext: ['ReferralDocument'],
					}, //infection
				],
			},
		],
	},
	{
		heading: 'Endocrine and Hematopoietic Systems',
		subGroups: [
			{
				heading: 'Endocrine and Hematopoietic Systems',
				questions: [
					{
						id: 'PA-77eb23',
						source: AssessmentQuestionSources.PhysicalAssessment,
						artifactContext: ['ReferralDocument'],
					}, //diabetes?
				],
			},
		],
	},
	{
		heading: 'Cognitive, Mental, and Emotional',
		subGroups: [
			{
				heading: 'Neurologic Findings',
				questions: [
					{ id: 'PA-4ad7dc', source: AssessmentQuestionSources.PhysicalAssessment }, //neurologic findings
				],
			},
			{
				heading: 'Cognitive Patterns and Behavior',
				questions: [
					{ id: 'M1700', source: AssessmentQuestionSources.Oasis }, //cognitive functioning
					{ id: 'M1740', source: AssessmentQuestionSources.Oasis }, //cognitive, behavioral, and psychiactric symptoms
					{ id: 'M1745', source: AssessmentQuestionSources.Oasis }, //frequency of disruptive behavior
				],
			},
			{
				heading: 'Brief Interview for Mental Status',
				questions: [
					{ id: 'C0100', source: AssessmentQuestionSources.Oasis }, // BIMS: Should BIMS be conducted?
					{ autoCalculateFieldResolver: AutoCalculateOptions.BIMS_ASSESSMENT }, // BIMS: Summary Score (Depends on C0100 - Skip if No)
				],
			},
			{
				heading: 'Mental Status',
				questions: [
					{ id: 'MQ5D7I3783', source: AssessmentQuestionSources.SOCStandardAssessment }, //mental status
					{ id: 'C1310A', source: AssessmentQuestionSources.Oasis }, //acute onset mental status change
					{ id: 'C1310B', source: AssessmentQuestionSources.Oasis }, //inattention
					{ id: 'C1310C', source: AssessmentQuestionSources.Oasis }, //disorganized thinking
					{ id: 'C1310D', source: AssessmentQuestionSources.Oasis }, //altered level of consiousness
					{ id: 'M1710', source: AssessmentQuestionSources.Oasis }, //when confused
					{ id: 'M1720', source: AssessmentQuestionSources.Oasis }, //when anxious
				],
			},
			{
				heading: 'Mood',
				questions: [
					{ id: 'D0150A1', source: AssessmentQuestionSources.Oasis }, //mood interview
					{ id: 'D0150B1', source: AssessmentQuestionSources.Oasis },
					{
						id: 'D0150C1',
						source: AssessmentQuestionSources.Oasis,
						preRequisiteSatisfied: PreReqOptions.D0150,
					},
					{
						id: 'D0150D1',
						source: AssessmentQuestionSources.Oasis,
						preRequisiteSatisfied: PreReqOptions.D0150,
					},
					{
						id: 'D0150E1',
						source: AssessmentQuestionSources.Oasis,
						preRequisiteSatisfied: PreReqOptions.D0150,
					},
					{
						id: 'D0150F1',
						source: AssessmentQuestionSources.Oasis,
						preRequisiteSatisfied: PreReqOptions.D0150,
					},
					{
						id: 'D0150G1',
						source: AssessmentQuestionSources.Oasis,
						preRequisiteSatisfied: PreReqOptions.D0150,
					},
					{
						id: 'D0150H1',
						source: AssessmentQuestionSources.Oasis,
						preRequisiteSatisfied: PreReqOptions.D0150,
					},
					{
						id: 'D0150I1',
						source: AssessmentQuestionSources.Oasis,
						preRequisiteSatisfied: PreReqOptions.D0150,
					},
					{ autoCalculateFieldResolver: AutoCalculateOptions.MOOD_INTERVIEW }, // BIMS: Summary Score (Depends on C0100 - Skip if No)

					{ id: 'D0700', source: AssessmentQuestionSources.Oasis }, //feeling isolated
				],
			},
		],
	},
	{
		heading: 'Nutrition',
		subGroups: [
			{
				heading: 'Feeding and Eating',
				questions: [
					{ id: 'M1870', source: AssessmentQuestionSources.Oasis }, //eating
					{ id: 'GG0130A1', source: AssessmentQuestionSources.Oasis }, //eating current
					{ id: 'GG0130A2', source: AssessmentQuestionSources.Oasis }, //eating goal
					{ id: 'K0520_1', source: AssessmentQuestionSources.Oasis, artifactContext: ['ReferralDocument'] }, //nutritional approaches
					{
						id: 'MQW1R0HXDT',
						source: AssessmentQuestionSources.SOCStandardAssessment,
						artifactContext: ['ReferralDocument'],
					}, //nutritional requirements
				],
			},
			{
				heading: 'Nurtritional Risk Assessment',
				questions: [
					{ id: 'PA-4533f1', source: AssessmentQuestionSources.PhysicalAssessment }, //nutritional assessment
					{ autoCalculateFieldResolver: AutoCalculateOptions.NUTRITIONAL_ASSESSMENT }, //nutritional assessment score
				],
			},
		],
	},
	{
		heading: 'Elimination',
		subGroups: [
			{
				heading: 'Genitourinary System',
				questions: [
					{ id: 'PA-c080fc', source: AssessmentQuestionSources.PhysicalAssessment }, //genitourinary assessment
					{ id: 'M1600', source: AssessmentQuestionSources.Oasis, artifactContext: ['ReferralDocument'] }, //recent UTI
					{ id: 'M1610', source: AssessmentQuestionSources.Oasis }, //incontinence + catheter
				],
			},
			{
				heading: 'Gastrointesinal System',
				questions: [
					{ id: 'PA-d3f68a', source: AssessmentQuestionSources.PhysicalAssessment }, //GI system assessment
					{ id: 'PA-b450f2', source: AssessmentQuestionSources.PhysicalAssessment }, //last BM
					{ id: 'M1620', source: AssessmentQuestionSources.Oasis }, //bowel incontinence
					{ id: 'M1630', source: AssessmentQuestionSources.Oasis }, //ostomy
				],
			},
		],
	},
	{
		heading: 'Muscles, Bones, and Joints',
		subGroups: [
			{
				heading: 'Musculoskeletal Assessment',
				questions: [
					{
						id: 'PA-fa6fd6',
						source: AssessmentQuestionSources.PhysicalAssessment,
						artifactContext: ['ReferralDocument'],
					}, //MS assessment
				],
			},
		],
	},
	{
		heading: 'Mobility',
		subGroups: [
			{
				heading: 'Fall Risk',
				questions: [
					{ id: 'PA-31c271', source: AssessmentQuestionSources.PhysicalAssessment }, //TUG assessment
					{
						id: 'AC2000',
						source: AssessmentQuestionSources.ApricotCore,
						artifactContext: ['ReferralDocument'],
					}, //fall risk assessment
					{
						id: 'AC2001',
						source: AssessmentQuestionSources.ApricotCore,
						artifactContext: ['ReferralDocument'],
					}, //fall risk assessment
					{
						id: 'AC2002',
						source: AssessmentQuestionSources.ApricotCore,
						artifactContext: ['ReferralDocument'],
					}, //fall risk assessment
					{
						id: 'AC2003',
						source: AssessmentQuestionSources.ApricotCore,
						artifactContext: ['ReferralDocument'],
					}, //fall risk assessment
					{
						id: 'AC2004',
						source: AssessmentQuestionSources.ApricotCore,
						artifactContext: ['ReferralDocument'],
					}, //fall risk assessment
					{ id: 'AC2005', source: AssessmentQuestionSources.ApricotCore }, //fall risk assessment
					{ id: 'AC2006', source: AssessmentQuestionSources.ApricotCore }, //fall risk assessment
					{
						id: 'AC2007',
						source: AssessmentQuestionSources.ApricotCore,
						artifactContext: ['ReferralDocument'],
					}, //fall risk assessment
					{ id: 'AC2008', source: AssessmentQuestionSources.ApricotCore }, //fall risk assessment
					{
						id: 'AC2009',
						source: AssessmentQuestionSources.ApricotCore,
						artifactContext: ['ReferralDocument'],
					}, //fall risk assessment
					{ autoCalculateFieldResolver: AutoCalculateOptions.MAHC_RISK_ASSESSMENT },
				],
			},
			{
				heading: 'Prior Mobility',
				questions: [
					{ id: 'GG0110', source: AssessmentQuestionSources.Oasis, artifactContext: ['ReferralDocument'] },
					{ id: 'GG0100B', source: AssessmentQuestionSources.Oasis, artifactContext: ['ReferralDocument'] },
					{ id: 'GG0100C', source: AssessmentQuestionSources.Oasis, artifactContext: ['ReferralDocument'] },
				],
			},
			{
				heading: 'Mobility in Bed or Chair',
				questions: [
					{ id: 'GG0170A1', source: AssessmentQuestionSources.Oasis, artifactContext: ['ReferralDocument'] },
					{ id: 'GG0170A2', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0170B1', source: AssessmentQuestionSources.Oasis, artifactContext: ['ReferralDocument'] },
					{ id: 'GG0170B2', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0170C1', source: AssessmentQuestionSources.Oasis, artifactContext: ['ReferralDocument'] },
					{ id: 'GG0170C2', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0170D1', source: AssessmentQuestionSources.Oasis, artifactContext: ['ReferralDocument'] },
					{ id: 'GG0170D2', source: AssessmentQuestionSources.Oasis },
				],
			},
			{
				heading: 'Walking, Stooping, and Rolling',
				questions: [
					{ id: 'M1860', source: AssessmentQuestionSources.Oasis, artifactContext: ['ReferralDocument'] },
					{ id: 'GG0170I1', source: AssessmentQuestionSources.Oasis, artifactContext: ['ReferralDocument'] },
					{ id: 'GG0170I2', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0170J2', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0170K2', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0170L2', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0170P1', source: AssessmentQuestionSources.Oasis, artifactContext: ['ReferralDocument'] },
					{ id: 'GG0170P2', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0170Q1', source: AssessmentQuestionSources.Oasis, artifactContext: ['ReferralDocument'] },
				],
			},
			{
				heading: 'Stairs',
				questions: [
					{ id: 'GG0170M1', source: AssessmentQuestionSources.Oasis, artifactContext: ['ReferralDocument'] },
					{ id: 'GG0170M2', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0170N2', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0170O2', source: AssessmentQuestionSources.Oasis },
				],
			},
			{
				heading: 'Transfers',
				questions: [
					{ id: 'M1850', source: AssessmentQuestionSources.Oasis, artifactContext: ['ReferralDocument'] },
					{ id: 'GG0170E1', source: AssessmentQuestionSources.Oasis, artifactContext: ['ReferralDocument'] },
					{ id: 'GG0170E2', source: AssessmentQuestionSources.Oasis },
					{ id: 'M1840', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0170F1', source: AssessmentQuestionSources.Oasis, artifactContext: ['ReferralDocument'] },
					{ id: 'GG0170F2', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0170G1', source: AssessmentQuestionSources.Oasis, artifactContext: ['ReferralDocument'] },
					{ id: 'GG0170G2', source: AssessmentQuestionSources.Oasis },
				],
			},
		],
	},
	{
		heading: 'Activities of Daily Living',
		subGroups: [
			{
				heading: 'Prior Self Care Abilities',
				questions: [
					{ id: 'GG0100A', source: AssessmentQuestionSources.Oasis, artifactContext: ['ReferralDocument'] }, //prior self-care
					{ id: 'GG0100D', source: AssessmentQuestionSources.Oasis, artifactContext: ['ReferralDocument'] }, //prior cognitive function
				],
			},
			{
				heading: 'Grooming',
				questions: [
					{ id: 'M1800', source: AssessmentQuestionSources.Oasis, artifactContext: ['ReferralDocument'] },
					{ id: 'GG0130B1', source: AssessmentQuestionSources.Oasis, artifactContext: ['ReferralDocument'] },
					{ id: 'GG0130B2', source: AssessmentQuestionSources.Oasis },
				],
			},
			{
				heading: 'Bathing',
				questions: [
					{ id: 'M1830', source: AssessmentQuestionSources.Oasis, artifactContext: ['ReferralDocument'] },
					{ id: 'GG0130E1', source: AssessmentQuestionSources.Oasis, artifactContext: ['ReferralDocument'] },
					{ id: 'GG0130E2', source: AssessmentQuestionSources.Oasis },
				],
			},
			{
				heading: 'Toileting',
				questions: [
					{ id: 'M1845', source: AssessmentQuestionSources.Oasis, artifactContext: ['ReferralDocument'] },
					{ id: 'GG0130C1', source: AssessmentQuestionSources.Oasis, artifactContext: ['ReferralDocument'] },
					{ id: 'GG0130C2', source: AssessmentQuestionSources.Oasis },
				],
			},
			{
				heading: 'Dressing Upper Body',
				questions: [
					{ id: 'M1810', source: AssessmentQuestionSources.Oasis, artifactContext: ['ReferralDocument'] },
					{ id: 'GG0130F1', source: AssessmentQuestionSources.Oasis, artifactContext: ['ReferralDocument'] },
					{ id: 'GG0130F2', source: AssessmentQuestionSources.Oasis },
				],
			},
			{
				heading: 'Dressing Lower Body',
				questions: [
					{ id: 'M1820', source: AssessmentQuestionSources.Oasis, artifactContext: ['ReferralDocument'] },
					{ id: 'GG0130G1', source: AssessmentQuestionSources.Oasis, artifactContext: ['ReferralDocument'] },
					{ id: 'GG0130G2', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0130H1', source: AssessmentQuestionSources.Oasis, artifactContext: ['ReferralDocument'] },
					{ id: 'GG0130H2', source: AssessmentQuestionSources.Oasis },
				],
			},
		],
	},
	{
		heading: 'Plan of Care',
		subGroups: [
			{
				heading: 'Disciplines Needed and Visit Frequency',
				questions: [
					{
						id: CustomAssessmentNumber.SKILLED_NURSING_VISIT_FREQUENCIES,
						source: AssessmentQuestionSources.Custom,
					},
					{
						id: CustomAssessmentNumber.ADDITIONAL_EVALUATION,
						source: AssessmentQuestionSources.Custom,
					},
					{
						id: 'PA-4cab6a',
						source: AssessmentQuestionSources.PhysicalAssessment,
						artifactContext: ['ReferralDocument'],
					}, //case mix group
					{ id: 'M2200', source: AssessmentQuestionSources.Oasis }, //number of therapy visits
				],
			},
			{
				heading: 'Equipment and Supplies',
				questions: [
					{
						id: 'PA-6da0f6',
						source: AssessmentQuestionSources.PhysicalAssessment,
						artifactContext: ['ReferralDocument'],
					}, //DME for bathing
					{
						id: 'PA-aef6db',
						source: AssessmentQuestionSources.PhysicalAssessment,
						artifactContext: ['ReferralDocument'],
					}, //DME for toileting
					{
						id: 'PA-a7be6b',
						source: AssessmentQuestionSources.PhysicalAssessment,
						artifactContext: ['ReferralDocument'],
					}, //DME for transfer/ambulation
					{
						id: 'PA-af42c2a',
						source: AssessmentQuestionSources.PhysicalAssessment,
						artifactContext: ['ReferralDocument'],
					},
					{ id: CustomAssessmentNumber.SUPPLY_LIST, source: AssessmentQuestionSources.Custom },
					{ id: 'SSA300', source: AssessmentQuestionSources.SOCStandardAssessment }, //supply requisition comment
				],
			},
			{
				heading: 'Emergency Preparedness',
				questions: [
					{ id: 'MQ1A0QOITD', source: AssessmentQuestionSources.SOCStandardAssessment }, //evacuation location
					{ id: 'MQ3TSYPAFT', source: AssessmentQuestionSources.SOCStandardAssessment }, //acuity status
					{ id: 'MQH1Q9GDCL', source: AssessmentQuestionSources.SOCStandardAssessment }, //disaster status
				],
			},
			{
				heading: 'Restrictions and Precautions',
				questions: [
					{
						id: 'MQ3P1FRR0X',
						source: AssessmentQuestionSources.SOCStandardAssessment,
						artifactContext: ['ReferralDocument'],
					}, //functional limitations
					{
						id: 'MQ78P5E6B3',
						source: AssessmentQuestionSources.SOCStandardAssessment,
						artifactContext: ['ReferralDocument'],
					}, //activities permitted
					{ id: 'MQ4SUJUFHC', source: AssessmentQuestionSources.SOCStandardAssessment }, //safety measures
				],
			},
			{
				heading: 'Goals, Prognosis, and Discharge Planning',
				questions: [
					{ id: 'MQ39OZ1RFJ', source: AssessmentQuestionSources.SOCStandardAssessment }, //patient stated goal
					{
						id: 'SSA200',
						source: AssessmentQuestionSources.SOCStandardAssessment,
						artifactContext: ['ReferralDocument'],
					}, //comments on patient stated goal
					{ id: 'MQ3SC8IMK8', source: AssessmentQuestionSources.SOCStandardAssessment }, //rehab potential
					{ id: 'MQ40VR12CX', source: AssessmentQuestionSources.SOCStandardAssessment }, //prognosis
					{
						id: 'MQ4A3NARW5',
						source: AssessmentQuestionSources.SOCStandardAssessment,
						artifactContext: ['ReferralDocument'],
					}, //discharge plans
				],
			},
		],
	},
	{
		heading: 'Interventions and Goals',
		subGroups: [
			{
				heading: 'Clinical Pathways',
				questions: [{ id: CustomAssessmentNumber.PLAN_BUILDER, source: AssessmentQuestionSources.Custom }],
			},
			{
				heading: 'Aide Care Plan',
				questions: [
					{
						id: CustomAssessmentNumber.HOME_HEALTH_AIDE_VISIT_FREQUENCIES,
						source: AssessmentQuestionSources.Custom,
					},
					{ id: 'ACP01', source: AssessmentQuestionSources.SOCStandardAssessment },
				],
			},
			{
				heading: 'Specialty Programs',
				questions: [
					{
						id: 'PA-2b9cd8',
						source: AssessmentQuestionSources.PhysicalAssessment,
						artifactContext: ['ReferralDocument'],
					}, //skilled nursing programs
					{
						id: 'PA-19d8a2',
						source: AssessmentQuestionSources.PhysicalAssessment,
						artifactContext: ['ReferralDocument'],
					}, //mental health programs
				],
			},
			{
				heading: 'Teaching Provided This Visit',
				questions: [
					{ id: 'PSIG1000', source: AssessmentQuestionSources.SOCStandardAssessment }, //misc documentation
					{ id: 'PSIG2000', source: AssessmentQuestionSources.SOCStandardAssessment }, //emergency plan
					{ id: 'PSIG3000', source: AssessmentQuestionSources.SOCStandardAssessment }, //meds, diet, signs/symptoms
					{ id: 'PSIG4000', source: AssessmentQuestionSources.SOCStandardAssessment }, //safety & devices
					{ id: 'PSIG5000', source: AssessmentQuestionSources.SOCStandardAssessment }, //best practices for diabetes, depression, pain, pressure ulcer
					{ id: 'PA-d41c23', source: AssessmentQuestionSources.PhysicalAssessment }, //patient helped with POC
					{ id: 'PA-ab5d81', source: AssessmentQuestionSources.PhysicalAssessment }, //review POC with patient
				],
			},
			{
				heading: 'Care Provided This Visit',
				questions: [
					{ id: 'PSIG6000', source: AssessmentQuestionSources.SOCStandardAssessment }, //tests + procedures
					{ id: 'PA-40dd62', source: AssessmentQuestionSources.PhysicalAssessment }, //labs performed
				],
			},
		],
	},
	{
		heading: 'Start of Care Narrative',
		subGroups: [
			{
				heading: 'Narrative Paragraphs',
				questions: [
					{
						id: 'NAR01',
						source: AssessmentQuestionSources.SOCStandardAssessment,
						artifactContext: ['ReferralDocument'],
					}, //reason for homecare
					{
						id: 'NAR02',
						source: AssessmentQuestionSources.SOCStandardAssessment,
					}, //abnormal findings
					{
						id: 'NAR03',
						source: AssessmentQuestionSources.SOCStandardAssessment,
						artifactContext: ['ReferralDocument'],
					}, //care coordination
					{
						id: 'NAR04',
						source: AssessmentQuestionSources.SOCStandardAssessment,
					}, //skilled procedure
					{
						id: 'NAR05',
						source: AssessmentQuestionSources.SOCStandardAssessment,
						artifactContext: ['ReferralDocument'],
					}, //next physician appt
					{
						id: 'NAR06',
						source: AssessmentQuestionSources.SOCStandardAssessment,
						artifactContext: ['ReferralDocument'],
					}, //plan and followup
				],
			},
		],
	},
	{
		heading: 'Physician Orders and Conferencing',
		subGroups: [
			{
				heading: 'Verbal Order',
				questions: [
					{
						id: 'MQ373KM2QO',
						source: AssessmentQuestionSources.SOCStandardAssessment,
						artifactContext: ['ReferralDocument'],
					}, // verbal order recieved
				],
			},
			{
				heading: 'Other Conferencing',
				questions: [
					{ id: 'PA-3226f8a', source: AssessmentQuestionSources.PhysicalAssessment }, //care coordination
					{ id: 'PA-ae381e', source: AssessmentQuestionSources.PhysicalAssessment }, //care coordination
				],
			},
		],
	},
];
