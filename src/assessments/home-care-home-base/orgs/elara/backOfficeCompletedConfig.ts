import { CustomAssessmentNumber } from '../../../apricot/custom';
import { DataRendererOptions } from '../../../apricot/data-renderers/options';
import { WOUND_HEADING } from '../../../apricot/util';
import { NurseInterviewPhysicalAssessmentThemes } from '../../../nurse-interview/questions';
import { AutoCalculateOptions } from '../../../oasis/auto-calculate-fields/options';
import { PreReqOptions } from '../../../oasis/prerequisites/PreReqOptions';
import { AssessmentQuestionSources, Group } from '../../../types';

export const backOfficeCompletedConfig: Group[] = [
	{
		heading: 'Visit Note',
		subGroups: [],
		subHeadings: [
			{
				heading: 'Basic Information',
				subGroups: [
					{
						heading: 'Patient Details',
						questions: [
							{ patientDataResolver: DataRendererOptions.NAME },
							{ patientDataResolver: DataRendererOptions.GENDER },
							{ patientDataResolver: DataRendererOptions.DATE_OF_BIRTH },
							{ patientDataResolver: DataRendererOptions.SOCIAL_SECURITY_NUMBER },
						],
					},
					{
						heading: 'Patient Contact',
						questions: [
							{ patientDataResolver: DataRendererOptions.PATIENT_PHONE_NUMBER },
							{ patientDataResolver: DataRendererOptions.PATIENT_ADDRESS },
						],
					},
					{
						heading: 'Visit Details',
						questions: [
							{ patientDataResolver: DataRendererOptions.SOC_VISIT_DATE },
							{ patientDataResolver: DataRendererOptions.SOC_VISIT_START_TIME },
							{ patientDataResolver: DataRendererOptions.SOC_VISIT_END_TIME },
							{ patientDataResolver: DataRendererOptions.TIME_IN_HOME },
							{ patientDataResolver: DataRendererOptions.MILEAGE },
							{ patientDataResolver: DataRendererOptions.DRIVE_START_TIME },
							{ patientDataResolver: DataRendererOptions.DRIVE_END_TIME },
							{ patientDataResolver: DataRendererOptions.DRIVE_TIME },
							{ patientDataResolver: DataRendererOptions.PATIENT_CASE_MANAGER },
							{ patientDataResolver: DataRendererOptions.BRANCH },
						],
					},
				],
			},
			{
				heading: 'Contacts',
				subGroups: [
					{
						heading: 'Emergency Contacts',
						questions: [{ patientDataResolver: DataRendererOptions.PATIENT_EMERGENCY_CONTACTS }],
					},
					{
						heading: 'Associated Providers',
						questions: [{ patientDataResolver: DataRendererOptions.PATIENT_ASSOCIATED_PHYSICIANS }],
					},
					{
						heading: 'Referral Source',
						questions: [{ patientDataResolver: DataRendererOptions.PATIENT_REFERRAL_SOURCE }],
					},
				],
			},
			{
				heading: 'Narrative Note',
				subGroups: [
					{
						heading: 'Start of Care Narrative Note',
						rollupForRpaApi: {
							id: 'start_of_care_narrative_note',
							text: 'Start of Care Narrative Note',
						},
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
				heading: 'Patient Background',
				subGroups: [
					{
						heading: 'Demographics',
						questions: [
							{
								id: 'A1005',
								source: AssessmentQuestionSources.Oasis,
								artifactContext: ['ReferralDocument'],
							}, //ethnicity
							{
								id: 'A1010',
								source: AssessmentQuestionSources.Oasis,
								artifactContext: ['ReferralDocument'],
							}, //race
							{
								id: 'MQ29KAPBEQ',
								source: AssessmentQuestionSources.SOCStandardAssessment,
								artifactContext: ['ReferralDocument'],
							}, //language
							{
								id: 'A1110B',
								source: AssessmentQuestionSources.Oasis,
								artifactContext: ['ReferralDocument'],
							}, //interpreter
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
							{
								id: 'B1300',
								source: AssessmentQuestionSources.Oasis,
								artifactContext: ['ReferralDocument'],
							}, //health literacy
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
						heading: 'Measurement Time',
						questions: [
							{
								patientDataResolver: DataRendererOptions.VITAL_SIGNS_MEASUREMENT_TIME,
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
								id: 'M1000',
								source: AssessmentQuestionSources.Oasis,
								artifactContext: ['ReferralDocument'],
							}, //recent hospitalization
							{
								id: 'PA-73f37a',
								source: AssessmentQuestionSources.PhysicalAssessment,
								artifactContext: ['ReferralDocument'],
							}, //patient discharged from inpatient
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
							{
								id: 'O0110_A',
								source: AssessmentQuestionSources.Oasis,
								artifactContext: ['ReferralDocument'],
							}, //special treatments
							{
								id: 'PA-36d8ab',
								source: AssessmentQuestionSources.PhysicalAssessment,
								artifactContext: ['ReferralDocument'],
							}, //telehealth exclusions
						],
					},
					{
						heading: 'Vaccination Record',
						questions: [
							{ id: CustomAssessmentNumber.VACCINATIONS, source: AssessmentQuestionSources.Custom },
						],
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
						questions: [
							{ id: CustomAssessmentNumber.PROCEDURES, source: AssessmentQuestionSources.Custom },
						],
					},
					{
						heading: 'Comorbitities',
						questions: [
							{
								id: 'M1028',
								source: AssessmentQuestionSources.Oasis,
								artifactContext: ['ReferralDocument'],
							}, //active diagnoses
							{
								id: 'M1033',
								source: AssessmentQuestionSources.Oasis,
								artifactContext: ['ReferralDocument'],
							}, //hospitalization risk
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
						],
					},
					{
						heading: 'Medication Notes',
						questions: [
							{
								id: 'N0415_1',
								source: AssessmentQuestionSources.Oasis,
								artifactContext: ['ReferralDocument'],
							}, //high risk drugs
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
								}, //wound orders?
							],
						},
					},
				],
			},
			{
				heading: 'Head and Neck',
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
							{
								id: 'K0520_1',
								source: AssessmentQuestionSources.Oasis,
								artifactContext: ['ReferralDocument'],
							}, //nutritional approaches
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
							{
								id: 'M1600',
								source: AssessmentQuestionSources.Oasis,
								artifactContext: ['ReferralDocument'],
							}, //recent UTI
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
							{
								id: 'GG0110',
								source: AssessmentQuestionSources.Oasis,
								artifactContext: ['ReferralDocument'],
							},
							{
								id: 'GG0100B',
								source: AssessmentQuestionSources.Oasis,
								artifactContext: ['ReferralDocument'],
							},
							{
								id: 'GG0100C',
								source: AssessmentQuestionSources.Oasis,
								artifactContext: ['ReferralDocument'],
							},
						],
					},
					{
						heading: 'Mobility in Bed or Chair',
						questions: [
							{
								id: 'GG0170A1',
								source: AssessmentQuestionSources.Oasis,
								artifactContext: ['ReferralDocument'],
							},
							{ id: 'GG0170A2', source: AssessmentQuestionSources.Oasis },
							{
								id: 'GG0170B1',
								source: AssessmentQuestionSources.Oasis,
								artifactContext: ['ReferralDocument'],
							},
							{ id: 'GG0170B2', source: AssessmentQuestionSources.Oasis },
							{
								id: 'GG0170C1',
								source: AssessmentQuestionSources.Oasis,
								artifactContext: ['ReferralDocument'],
							},
							{ id: 'GG0170C2', source: AssessmentQuestionSources.Oasis },
							{
								id: 'GG0170D1',
								source: AssessmentQuestionSources.Oasis,
								artifactContext: ['ReferralDocument'],
							},
							{ id: 'GG0170D2', source: AssessmentQuestionSources.Oasis },
						],
					},
					{
						heading: 'Walking, Stooping, and Rolling',
						questions: [
							{
								id: 'M1860',
								source: AssessmentQuestionSources.Oasis,
								artifactContext: ['ReferralDocument'],
							},
							{
								id: 'GG0170I1',
								source: AssessmentQuestionSources.Oasis,
								artifactContext: ['ReferralDocument'],
							},
							{ id: 'GG0170I2', source: AssessmentQuestionSources.Oasis },
							{ id: 'GG0170J2', source: AssessmentQuestionSources.Oasis },
							{ id: 'GG0170K2', source: AssessmentQuestionSources.Oasis },
							{ id: 'GG0170L2', source: AssessmentQuestionSources.Oasis },
							{
								id: 'GG0170P1',
								source: AssessmentQuestionSources.Oasis,
								artifactContext: ['ReferralDocument'],
							},
							{ id: 'GG0170P2', source: AssessmentQuestionSources.Oasis },
							{
								id: 'GG0170Q1',
								source: AssessmentQuestionSources.Oasis,
								artifactContext: ['ReferralDocument'],
							},
						],
					},
					{
						heading: 'Stairs',
						questions: [
							{
								id: 'GG0170M1',
								source: AssessmentQuestionSources.Oasis,
								artifactContext: ['ReferralDocument'],
							},
							{ id: 'GG0170M2', source: AssessmentQuestionSources.Oasis },
							{ id: 'GG0170N2', source: AssessmentQuestionSources.Oasis },
							{ id: 'GG0170O2', source: AssessmentQuestionSources.Oasis },
						],
					},
					{
						heading: 'Transfers',
						questions: [
							{
								id: 'M1850',
								source: AssessmentQuestionSources.Oasis,
								artifactContext: ['ReferralDocument'],
							},
							{
								id: 'GG0170E1',
								source: AssessmentQuestionSources.Oasis,
								artifactContext: ['ReferralDocument'],
							},
							{ id: 'GG0170E2', source: AssessmentQuestionSources.Oasis },
							{ id: 'M1840', source: AssessmentQuestionSources.Oasis },
							{
								id: 'GG0170F1',
								source: AssessmentQuestionSources.Oasis,
								artifactContext: ['ReferralDocument'],
							},
							{ id: 'GG0170F2', source: AssessmentQuestionSources.Oasis },
							{
								id: 'GG0170G1',
								source: AssessmentQuestionSources.Oasis,
								artifactContext: ['ReferralDocument'],
							},
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
							{
								id: 'GG0100A',
								source: AssessmentQuestionSources.Oasis,
								artifactContext: ['ReferralDocument'],
							}, //prior self-care
							{
								id: 'GG0100D',
								source: AssessmentQuestionSources.Oasis,
								artifactContext: ['ReferralDocument'],
							}, //prior cognitive function
						],
					},
					{
						heading: 'Grooming',
						questions: [
							{
								id: 'M1800',
								source: AssessmentQuestionSources.Oasis,
								artifactContext: ['ReferralDocument'],
							},
							{
								id: 'GG0130B1',
								source: AssessmentQuestionSources.Oasis,
								artifactContext: ['ReferralDocument'],
							},
							{ id: 'GG0130B2', source: AssessmentQuestionSources.Oasis },
						],
					},
					{
						heading: 'Bathing',
						questions: [
							{
								id: 'M1830',
								source: AssessmentQuestionSources.Oasis,
								artifactContext: ['ReferralDocument'],
							},
							{
								id: 'GG0130E1',
								source: AssessmentQuestionSources.Oasis,
								artifactContext: ['ReferralDocument'],
							},
							{ id: 'GG0130E2', source: AssessmentQuestionSources.Oasis },
						],
					},
					{
						heading: 'Toileting',
						questions: [
							{
								id: 'M1845',
								source: AssessmentQuestionSources.Oasis,
								artifactContext: ['ReferralDocument'],
							},
							{
								id: 'GG0130C1',
								source: AssessmentQuestionSources.Oasis,
								artifactContext: ['ReferralDocument'],
							},
							{ id: 'GG0130C2', source: AssessmentQuestionSources.Oasis },
						],
					},
					{
						heading: 'Dressing Upper Body',
						questions: [
							{
								id: 'M1810',
								source: AssessmentQuestionSources.Oasis,
								artifactContext: ['ReferralDocument'],
							},
							{
								id: 'GG0130F1',
								source: AssessmentQuestionSources.Oasis,
								artifactContext: ['ReferralDocument'],
							},
							{ id: 'GG0130F2', source: AssessmentQuestionSources.Oasis },
						],
					},
					{
						heading: 'Dressing Lower Body',
						questions: [
							{
								id: 'M1820',
								source: AssessmentQuestionSources.Oasis,
								artifactContext: ['ReferralDocument'],
							},
							{
								id: 'GG0130G1',
								source: AssessmentQuestionSources.Oasis,
								artifactContext: ['ReferralDocument'],
							},
							{ id: 'GG0130G2', source: AssessmentQuestionSources.Oasis },
							{
								id: 'GG0130H1',
								source: AssessmentQuestionSources.Oasis,
								artifactContext: ['ReferralDocument'],
							},
							{ id: 'GG0130H2', source: AssessmentQuestionSources.Oasis },
						],
					},
				],
			},
			{
				heading: 'Additional Documentation',
				subGroups: [
					{
						heading: 'Patient Goals',
						questions: [
							{ id: 'MQ39OZ1RFJ', source: AssessmentQuestionSources.SOCStandardAssessment }, //patient stated goal
							{
								id: 'SSA200',
								source: AssessmentQuestionSources.SOCStandardAssessment,
								artifactContext: ['ReferralDocument'],
							}, //comments on patient stated goal
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
						],
					},
					{
						heading: 'Recommendations & Conferencing',
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
							{ id: 'PA-3226f8a', source: AssessmentQuestionSources.PhysicalAssessment }, //care coordination
							{ id: 'PA-ae381e', source: AssessmentQuestionSources.PhysicalAssessment }, //care coordination
						],
					},
					{
						heading: 'Payor Source & Eligibility',
						questions: [{ patientDataResolver: DataRendererOptions.PATIENT_PAYOR_DETAILS }],
					},
				],
			},
		],
		//Include attestation statement at the end of the PDF note.
	},
	{
		heading: 'Pointcare',
		subGroups: [
			{
				heading: 'Notes: Add SOC Narrative',
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
			{
				heading: 'Visit Actions: Demographics, Directions',
				questions: [
					{
						id: 'SSA100',
						source: AssessmentQuestionSources.SOCStandardAssessment,
					}, //driving directions
				],
			},
			{
				heading: 'Visit Actions: Demographics, Face to Face',
				questions: [
					{
						id: 'MQ3K8EDC1D',
						source: AssessmentQuestionSources.SOCStandardAssessment,
					}, //face to face comments
				],
			},
			{
				heading: 'Visit Actions: Physical Assessment, Client Demographics',
				questions: [
					{
						note: 'Select "Start of Care" as the response for M0100.',
					},
				],
			},
			{
				heading: 'Visit Actions: Physical Assessment, Environmental',
				questions: [
					{ id: 'M1100', source: AssessmentQuestionSources.Oasis }, //living situation (who in home?)
				],
			},
			{
				heading: 'Visit Actions: Physical Assessment, Health History',
				questions: [
					{ id: 'B1300', source: AssessmentQuestionSources.Oasis, artifactContext: ['ReferralDocument'] }, //hospitalization risk
					{ id: 'PA-7075db', source: AssessmentQuestionSources.PhysicalAssessment }, //risk for ED
					{ id: 'A1250', source: AssessmentQuestionSources.Oasis, artifactContext: ['ReferralDocument'] }, //hospitalization risk
					{ id: 'PA-73f37a', source: AssessmentQuestionSources.PhysicalAssessment }, //discharged last 14 days
					{ id: 'M1000', source: AssessmentQuestionSources.Oasis, artifactContext: ['ReferralDocument'] }, //inpatient discharge
					{ id: 'M1033', source: AssessmentQuestionSources.Oasis, artifactContext: ['ReferralDocument'] }, //hospitalization risk
				],
			},
			{
				heading: 'Visit Actions: Physical Assessment, Falls',
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
				heading: 'Visit Actions: Physical Assessment, Integumentary',
				questions: [
					{
						note: 'Select "Yes" as the response for "Was integumentary assessed?".',
					},
				],
			},
			{
				heading: 'Visit Actions: Physical Assessment, Braden Risk Assessment Scale',
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
				heading: 'Visit Actions: Physical Assessment, Cognitive/Behavioral',
				questions: [
					{ id: 'M1700', source: AssessmentQuestionSources.Oasis }, //cognitive functioning
					{ id: 'M1710', source: AssessmentQuestionSources.Oasis }, //when confused
					{ id: 'M1740', source: AssessmentQuestionSources.Oasis }, //when anxious
					{ id: 'M1745', source: AssessmentQuestionSources.Oasis }, //cognitive, behavioral, and psychiactric symptoms
				],
			},
			{
				heading: 'Visit Actions: Physical Assessment, Care Management',
				questions: [
					{ id: 'M2102F', source: AssessmentQuestionSources.Oasis }, //CG availability
				],
			},
			{
				heading: 'Visit Actions: Physical Assessment, Medications',
				questions: [
					{ id: 'M2020', source: AssessmentQuestionSources.Oasis }, //CG availability
				],
			},
			{
				heading: 'Visit Actions: Patient Goals',
				questions: [
					{ id: 'MQ39OZ1RFJ', source: AssessmentQuestionSources.SOCStandardAssessment }, //patient stated goal
					{
						id: 'SSA200',
						source: AssessmentQuestionSources.SOCStandardAssessment,
						artifactContext: ['ReferralDocument'],
					}, //comments on patient stated goal
				],
			},
			{
				heading: 'Visit Actions: Diagnoses',
				questions: [{ id: CustomAssessmentNumber.DIAGNOSES, source: AssessmentQuestionSources.Custom }],
			},
			{
				heading: 'Visit Actions: Procedures',
				questions: [{ id: CustomAssessmentNumber.PROCEDURES, source: AssessmentQuestionSources.Custom }],
			},
			{
				heading: 'Visit Actions: Vital Signs & Measures',
				questions: [
					{
						id: CustomAssessmentNumber.VITAL_SIGN_PARAMETERS,
						source: AssessmentQuestionSources.Custom,
					},
					{ patientDataResolver: DataRendererOptions.VITAL_SIGNS_MEASUREMENT_TIME },
					//temp
					{ id: 'AC1049', source: AssessmentQuestionSources.SOCStandardAssessment },
					//pulse
					{ id: 'AC1059E', source: AssessmentQuestionSources.SOCStandardAssessment },
					//respirations
					{ id: 'AC1069E', source: AssessmentQuestionSources.SOCStandardAssessment },
					//blood pressure
					{ id: 'AC1079E', source: AssessmentQuestionSources.SOCStandardAssessment },
					//height
					{ id: 'AC1041', source: AssessmentQuestionSources.SOCStandardAssessment },
					{ autoCalculateFieldResolver: AutoCalculateOptions.PATIENT_FORMATTED_HEIGHT },
					//weight
					{ id: 'AC1044', source: AssessmentQuestionSources.SOCStandardAssessment },
					{ id: 'AC1140', source: AssessmentQuestionSources.ApricotCore }, //ankle circ
					{ id: 'AC1110', source: AssessmentQuestionSources.ApricotCore }, //blood sugar
					{ id: 'AC1150', source: AssessmentQuestionSources.ApricotCore }, //calf circ
					{ id: 'AC1160', source: AssessmentQuestionSources.ApricotCore }, //girth
					{ id: 'AC1170', source: AssessmentQuestionSources.ApricotCore }, //head circ
					{ id: 'AC1180', source: AssessmentQuestionSources.ApricotCore }, //instep circ
					{ id: 'AC1120', source: AssessmentQuestionSources.ApricotCore }, //INR level
					{ id: 'AC1090E', source: AssessmentQuestionSources.SOCStandardAssessment }, //ox sat
					{ id: 'AC1100', source: AssessmentQuestionSources.ApricotCore }, //pain
					{ id: 'AC1130', source: AssessmentQuestionSources.ApricotCore }, //prothrombin time
					{ id: 'AC1190', source: AssessmentQuestionSources.ApricotCore }, //thigh circ
				],
			},
			{
				heading: 'Visit Actions: Client Meds',
				questions: [
					{ id: CustomAssessmentNumber.MEDICATIONS, source: AssessmentQuestionSources.Custom },
					{ id: 'SSA500', source: AssessmentQuestionSources.SOCStandardAssessment },
				],
			},
			{
				heading: 'Visit Actions: Plan of Care Supplies/DME, Order Supplies, & Supplies Delivered', //would like to have one header (with all included questions) per wound
				questions: [
					{ id: CustomAssessmentNumber.SUPPLY_LIST, source: AssessmentQuestionSources.Custom },
					{ id: 'SSA300', source: AssessmentQuestionSources.SOCStandardAssessment }, //supply requisition comment
				],
			},
			{
				heading: 'Visit Actions: Integumentary Command Center, Wounds', //would like to have one header (with all included questions) per wound
				questions: [
					{
						note: 'Before opening the ICC, you will need to click into Pathways and check the first box available.',
					},
				],
			},
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
						}, //wound orders?
					],
				},
			},
			{
				heading: 'Vist Actions: Aide Care Plan',
				questions: [{ id: 'ACP01', source: AssessmentQuestionSources.SOCStandardAssessment }],
			},
		],
	},
	{
		heading: 'Calendar',
		subGroups: [
			{
				heading: 'Scheduling',
				questions: [
					{
						id: CustomAssessmentNumber.SKILLED_NURSING_VISIT_FREQUENCIES,
						source: AssessmentQuestionSources.Custom,
					},
					{ id: CustomAssessmentNumber.ADDITIONAL_EVALUATION, source: AssessmentQuestionSources.Custom },
					{
						id: CustomAssessmentNumber.HOME_HEALTH_AIDE_VISIT_FREQUENCIES,
						source: AssessmentQuestionSources.Custom,
					},
				],
			},
		],
	},
	{
		heading: 'OASIS',
		subGroups: [
			{
				heading: 'Section A',
				questions: [
					{ patientDataResolver: DataRendererOptions.PATIENT_PAYOR_DETAILS },
					{ patientDataResolver: DataRendererOptions.PHYSICIAN_ORDERED_SOC_DATE },
					{ patientDataResolver: DataRendererOptions.REFERRAL_DATE },
					{ id: 'M1000', source: AssessmentQuestionSources.Oasis }, //recent hospitalization
					{ id: 'A1005', source: AssessmentQuestionSources.Oasis }, //ethnicity
					{ id: 'A1010', source: AssessmentQuestionSources.Oasis }, //race
					{ id: 'MQ29KAPBEQ', source: AssessmentQuestionSources.SOCStandardAssessment }, //language
					{ id: 'A1110B', source: AssessmentQuestionSources.Oasis }, //interpreter
					{ id: 'A1250', source: AssessmentQuestionSources.Oasis }, //transportation
				],
			},
			{
				heading: 'Section B',
				questions: [
					{ id: 'B0200', source: AssessmentQuestionSources.Oasis }, //hearing
					{ id: 'B1000', source: AssessmentQuestionSources.Oasis }, //vision
					{ id: 'B1300', source: AssessmentQuestionSources.Oasis, artifactContext: ['ReferralDocument'] }, //health literacy
				],
			},
			{
				heading: 'Section C',
				questions: [
					//BIMS
					{ id: 'C0100', source: AssessmentQuestionSources.Oasis }, // BIMS: Should BIMS be conducted?
					{ id: 'C1310A', source: AssessmentQuestionSources.Oasis }, //acute onset mental status change
					{ id: 'C1310B', source: AssessmentQuestionSources.Oasis }, //inattention
					{ id: 'C1310C', source: AssessmentQuestionSources.Oasis }, //disorganized thinking
					{ id: 'C1310D', source: AssessmentQuestionSources.Oasis }, //altered level of consiousness
					{ id: 'M1700', source: AssessmentQuestionSources.Oasis }, //cognitive functioning
					{ id: 'M1710', source: AssessmentQuestionSources.Oasis }, //when confused
					{ id: 'M1720', source: AssessmentQuestionSources.Oasis }, //when anxious
				],
			},
			{
				heading: 'Section D',
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
			{
				heading: 'Section E',
				questions: [
					{ id: 'M1740', source: AssessmentQuestionSources.Oasis }, //cognitive, behavioral, and psychiactric symptoms
					{ id: 'M1745', source: AssessmentQuestionSources.Oasis }, //frequency of disruptive behavior
				],
			},
			{
				heading: 'Section F',
				questions: [
					{ id: 'M1033', source: AssessmentQuestionSources.Oasis }, //hospitalization risk
					{ id: 'M1100', source: AssessmentQuestionSources.Oasis }, //living situation (who in home?)
					{ id: 'M2102F', source: AssessmentQuestionSources.Oasis }, //caregivers
				],
			},
			{
				heading: 'Section G',
				questions: [
					{ id: 'M1800', source: AssessmentQuestionSources.Oasis }, //grooming current
					{ id: 'M1810', source: AssessmentQuestionSources.Oasis },
					{ id: 'M1820', source: AssessmentQuestionSources.Oasis },
					{ id: 'M1830', source: AssessmentQuestionSources.Oasis },
					{ id: 'M1840', source: AssessmentQuestionSources.Oasis },
					{ id: 'M1845', source: AssessmentQuestionSources.Oasis },
					{ id: 'M1850', source: AssessmentQuestionSources.Oasis },
					{ id: 'M1860', source: AssessmentQuestionSources.Oasis },
				],
			},
			{
				heading: 'Section GG - Part 1 (GG0100 and GG0110',
				questions: [
					{ id: 'GG0100A', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0100B', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0100C', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0100D', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0110', source: AssessmentQuestionSources.Oasis },
				],
			},
			{
				heading: 'Section GG - Part 2 (GG0130)',
				questions: [
					{ id: 'GG0130A1', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0130A2', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0130B1', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0130B2', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0130C1', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0130C2', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0130E1', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0130E2', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0130F1', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0130F2', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0130G1', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0130G2', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0130H1', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0130H2', source: AssessmentQuestionSources.Oasis },
				],
			},
			{
				heading: 'Section GG - Part 3 (GG0170)',
				questions: [
					{ id: 'GG0170A1', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0170A2', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0170B1', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0170B2', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0170C1', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0170C2', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0170D1', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0170D2', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0170E1', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0170E2', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0170F1', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0170F2', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0170G1', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0170G2', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0170I1', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0170I2', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0170J2', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0170K2', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0170L2', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0170M1', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0170M2', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0170N2', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0170O2', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0170P1', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0170P2', source: AssessmentQuestionSources.Oasis },
					{ id: 'GG0170Q1', source: AssessmentQuestionSources.Oasis },
				],
			},
			{
				heading: 'Section H',
				questions: [
					{ id: 'M1600', source: AssessmentQuestionSources.Oasis },
					{ id: 'M1610', source: AssessmentQuestionSources.Oasis },
					{ id: 'M1620', source: AssessmentQuestionSources.Oasis },
					{ id: 'M1630', source: AssessmentQuestionSources.Oasis },
				],
			},
			{
				heading: 'Section I',
				questions: [
					{ id: 'M1028', source: AssessmentQuestionSources.Oasis },
					{ id: CustomAssessmentNumber.DIAGNOSES, source: AssessmentQuestionSources.Custom },
				],
			},
			{
				heading: 'Section J',
				questions: [
					{ id: 'M1033', source: AssessmentQuestionSources.Oasis },
					{ id: 'J0510', source: AssessmentQuestionSources.Oasis },
					{ id: 'M1400', source: AssessmentQuestionSources.Oasis },
				],
			},
			{
				heading: 'Section K',
				questions: [
					{ id: 'AC1041', source: AssessmentQuestionSources.SOCStandardAssessment }, //M1060A
					{ id: 'AC1044', source: AssessmentQuestionSources.SOCStandardAssessment }, //M1060B
					{ id: 'K0520_1', source: AssessmentQuestionSources.Oasis }, //nutritional approaches
					{ id: 'M1870', source: AssessmentQuestionSources.Oasis },
				],
			},
			{
				heading: 'Section M',
				questions: [
					{ id: 'M1306', source: AssessmentQuestionSources.Oasis }, //does patient have at least 1 unhealed pressure ulcer?
					{ id: 'M1322', source: AssessmentQuestionSources.Oasis }, //number of stage 1 pressure ulcers
					{ id: 'M1324', source: AssessmentQuestionSources.Oasis }, //stage of most problematic ulcer
					{ id: 'M1330', source: AssessmentQuestionSources.Oasis }, //stasis ulcer?
					{ id: 'M1340', source: AssessmentQuestionSources.Oasis }, //surgical wound?
				],
			},
			{
				heading: 'Section N',
				questions: [
					{ id: 'N0415_1', source: AssessmentQuestionSources.Oasis }, //high risk drugs
					{ id: 'M2001', source: AssessmentQuestionSources.Oasis }, //med issues?
				],
			},
			{
				heading: 'Section O',
				questions: [
					{ id: 'O0110_A', source: AssessmentQuestionSources.Oasis }, //special treatments
					{
						id: 'PA-4cab6a',
						source: AssessmentQuestionSources.PhysicalAssessment,
						artifactContext: ['ReferralDocument'],
					}, //case mix group
					{ id: 'M2200', source: AssessmentQuestionSources.Oasis }, //number of therapy visits
				],
			},
		],
	},
	{
		heading: 'Problem Statements/Care Plan',
		subGroups: [
			{
				heading: 'Clinical Pathways',
				questions: [{ id: CustomAssessmentNumber.PLAN_BUILDER, source: AssessmentQuestionSources.Custom }],
				//TODO: Add clinical pathways nested question
			},
		],
	},
	{
		heading: '485 Orders',
		subGroups: [
			{
				heading: 'General Info',
				questions: [
					{
						id: 'MQ373KM2QO',
						source: AssessmentQuestionSources.SOCStandardAssessment,
					}, //verbal order
					{ id: 'MQ40VR12CX', source: AssessmentQuestionSources.SOCStandardAssessment }, //prognosis
					{ id: 'MQ4SUJUFHC', source: AssessmentQuestionSources.SOCStandardAssessment }, //safety measures
					{ id: 'MQW1R0HXDT', source: AssessmentQuestionSources.SOCStandardAssessment }, //nutritional requirements
					{ id: 'MQ3SC8IMK8', source: AssessmentQuestionSources.SOCStandardAssessment }, //rehab potential
					{ id: 'MQ4A3NARW5', source: AssessmentQuestionSources.SOCStandardAssessment }, //discharge plans
				],
			},
			{
				heading: 'Patient Goals',
				questions: [
					{ id: 'MQ39OZ1RFJ', source: AssessmentQuestionSources.SOCStandardAssessment }, //patient stated goal
					{
						id: 'SSA200',
						source: AssessmentQuestionSources.SOCStandardAssessment,
						artifactContext: ['ReferralDocument'],
					}, //comments on patient stated goal
				],
			},
			{
				heading: 'Order Text & Goal Text',
				questions: [{ id: CustomAssessmentNumber.PLAN_BUILDER, source: AssessmentQuestionSources.Custom }],
			},
			{
				heading: 'Allergies',
				questions: [
					{ id: 'MQ67LVO5CK', source: AssessmentQuestionSources.SOCStandardAssessment }, //allergies}
				],
			},
			{
				heading: 'Functional Limitations',
				questions: [
					{ id: 'MQ3P1FRR0X', source: AssessmentQuestionSources.SOCStandardAssessment }, //functional limitations
				],
			},
			{
				heading: 'Activities Permitted',
				questions: [
					{ id: 'MQ78P5E6B3', source: AssessmentQuestionSources.SOCStandardAssessment }, //activities permitted
				],
			},
			{
				heading: 'Mental Statuses',
				questions: [
					{ id: 'MQ5D7I3783', source: AssessmentQuestionSources.SOCStandardAssessment }, //mental status
				],
			},
			{
				heading: 'Cognitive Assessment',
				questions: [
					{ id: 'M1700', source: AssessmentQuestionSources.Oasis }, //cognitive functioning
					{ id: 'M1710', source: AssessmentQuestionSources.Oasis }, //when confused
					{ id: 'M1740', source: AssessmentQuestionSources.Oasis }, //cognitive, behavioral, and psychiactric symptoms
					{ id: 'M1745', source: AssessmentQuestionSources.Oasis }, //when anxious
				],
			},
			{
				heading: 'Psychosocial Assessment',
				questions: [
					{ id: 'M1100', source: AssessmentQuestionSources.Oasis }, //living situation
				],
			},
			{
				heading: 'Hospital Readmission Risk',
				questions: [
					{ id: 'M1033', source: AssessmentQuestionSources.Oasis }, //hospitalization risk
				],
			},
			{
				heading: 'Medications',
				questions: [
					{ id: CustomAssessmentNumber.MEDICATIONS, source: AssessmentQuestionSources.Custom },
					{ id: 'SSA500', source: AssessmentQuestionSources.SOCStandardAssessment },
				],
			},
			{
				heading: 'Supplies',
				questions: [{ id: CustomAssessmentNumber.SUPPLY_LIST, source: AssessmentQuestionSources.Custom }],
			},
			{
				heading: 'Diagnoses',
				questions: [{ id: CustomAssessmentNumber.DIAGNOSES, source: AssessmentQuestionSources.Custom }],
			},
			{
				heading: 'Edit/View Calendar',
				questions: [
					{
						id: CustomAssessmentNumber.SKILLED_NURSING_VISIT_FREQUENCIES,
						source: AssessmentQuestionSources.Custom,
					},
					{ id: CustomAssessmentNumber.ADDITIONAL_EVALUATION, source: AssessmentQuestionSources.Custom },
					{
						id: CustomAssessmentNumber.HOME_HEALTH_AIDE_VISIT_FREQUENCIES,
						source: AssessmentQuestionSources.Custom,
					},
				],
			},
			{
				heading: 'Eligibility Documentation',
				questions: [
					{
						id: 'PA-bb14d8',
						source: AssessmentQuestionSources.PhysicalAssessment,
						artifactContext: ['ReferralDocument'],
					}, //homebound?
				],
			},
		],
	},
	{
		heading: 'Clinical Input: Patient Profile',
		subGroups: [
			{
				heading: 'Demographics',
				questions: [
					{ patientDataResolver: DataRendererOptions.GENDER },
					{ patientDataResolver: DataRendererOptions.DATE_OF_BIRTH },
					{ patientDataResolver: DataRendererOptions.SOCIAL_SECURITY_NUMBER },
					{ id: 'A1010', source: AssessmentQuestionSources.Oasis }, //race
					{
						id: 'SSA102',
						source: AssessmentQuestionSources.SOCStandardAssessment,
						artifactContext: ['ReferralDocument'],
					}, // martial status for pt profile
					{ id: 'PA-329f77', source: AssessmentQuestionSources.PhysicalAssessment }, //religion
					{ id: 'M1100', source: AssessmentQuestionSources.Oasis }, //living situation (who in home?)
					{ patientDataResolver: DataRendererOptions.PATIENT_ADDRESS },
					{ patientDataResolver: DataRendererOptions.PATIENT_PHONE_NUMBER },
					{ patientDataResolver: DataRendererOptions.PATIENT_EMERGENCY_CONTACTS },
				],
			},
			{
				heading: 'Referral Source',
				questions: [{ patientDataResolver: DataRendererOptions.PATIENT_REFERRAL_SOURCE }],
			},
			{
				heading: 'Payor Source',
				questions: [{ patientDataResolver: DataRendererOptions.PATIENT_PAYOR_DETAILS }],
			},
			{
				heading: 'Physicians',
				questions: [
					{
						patientDataResolver: DataRendererOptions.PATIENT_ASSOCIATED_PHYSICIANS,
					},
				],
			},
			{
				heading: 'Diagnoses',
				questions: [{ id: CustomAssessmentNumber.DIAGNOSES, source: AssessmentQuestionSources.Custom }],
			},
			{
				heading: 'Procedures',
				questions: [{ id: CustomAssessmentNumber.PROCEDURES, source: AssessmentQuestionSources.Custom }],
			},
			{
				heading: 'Related Facilities',
				questions: [{ id: CustomAssessmentNumber.FACILITIES, source: AssessmentQuestionSources.Custom }],
			},
			{
				heading: 'Clinical',
				questions: [
					{ id: 'MQ1A0QOITD', source: AssessmentQuestionSources.SOCStandardAssessment }, //evacuation location
					{ id: 'MQ3TSYPAFT', source: AssessmentQuestionSources.SOCStandardAssessment }, //acuity status
					{ id: 'MQH1Q9GDCL', source: AssessmentQuestionSources.SOCStandardAssessment }, //disaster status
					{
						id: 'MQ373KM2QO',
						source: AssessmentQuestionSources.SOCStandardAssessment,
					}, //verbal order
					{ id: 'AC1041', source: AssessmentQuestionSources.ApricotCore }, //height
					{ id: 'AC1044', source: AssessmentQuestionSources.ApricotCore }, //weight
					{ note: 'Click into "Medical Release Codes" and choose the only option available.' },
					{ id: 'MQ67LVO5CK', source: AssessmentQuestionSources.SOCStandardAssessment }, //allergies}
					{
						patientDataResolver: DataRendererOptions.PATIENT_CASE_MANAGER,
					},
					{ id: CustomAssessmentNumber.VACCINATIONS, source: AssessmentQuestionSources.Custom },
					{
						id: CustomAssessmentNumber.ADVANCE_DIRECTIVES,
						source: AssessmentQuestionSources.Custom,
					},
				],
			},
		],
	},
	{
		heading: 'Clinical Input: Visit Notes',
		subGroups: [
			{
				heading: 'Edit Visit Date',
				questions: [{ patientDataResolver: DataRendererOptions.SOC_VISIT_DATE }],
			},
			{
				heading: 'Edit Visit Mileage',
				questions: [{ patientDataResolver: DataRendererOptions.MILEAGE }],
			},
			{
				heading: 'Edit Visit Times',
				questions: [
					{ patientDataResolver: DataRendererOptions.SOC_VISIT_DATE },
					{ patientDataResolver: DataRendererOptions.DRIVE_START_TIME },
					{ patientDataResolver: DataRendererOptions.DRIVE_END_TIME },
					{ patientDataResolver: DataRendererOptions.SOC_VISIT_START_TIME },
					{ patientDataResolver: DataRendererOptions.SOC_VISIT_END_TIME },
				],
			},
			{
				heading: 'Edit Worker on Visit',
				questions: [
					{ patientDataResolver: DataRendererOptions.PATIENT_CASE_MANAGER },
					{
						note: 'When asked to Add Reason for Editing Worker on Visit, enter this text: NEW ASSIGNEE IS THE CLINICIAN WHO CONDUCTED THE START OF CARE VISIT; PREVIOUS ASSIGNEE ENTERED INFORMATION PREPARED AND APPROVED BY THE CLINICIAN ON BEHALF OF THE CLINICIAN.',
					},
				],
			},
		],
	},
];