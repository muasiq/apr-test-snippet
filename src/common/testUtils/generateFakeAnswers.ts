import { faker } from '@faker-js/faker';
import { nextTuesday, subWeeks } from 'date-fns';
import { CustomAssessmentNumber } from '~/assessments/apricot/custom';
import { Configuration, getLocalConfiguration } from '~/assessments/configurations';
import { AssessmentQuestionSources, AssessmentQuestionType } from '~/assessments/types';
import { questionsThatDoNotHaveConfirmedAnswers } from '~/assessments/util/assessmentStateUtils';
import { lookupQuestion } from '~/assessments/util/lookupQuestionUtil';
import { MedicationDescriptorType } from '~/common/constants/medication';
import {
	Diagnosis,
	onsetOrExacerbationOptions,
	symptomControlRatingOptions,
} from '~/features/screens/Field/PatientDetail/components/Assessment/QuestionTypes/AssessmentDiagnosisForm/assessmentDiagnosisForm.utils';
import {
	AdditionalEvaluationInput,
	AssessmentCheckInput,
	AssessmentVitalSignParams,
	HomeHealthAideVisitFrequencySchema,
	MedicationSchema,
	SkilledNursingVisitFrequencySchema,
} from '~/server/api/routers/assessment/assessment.inputs';
import { PatientWithJoinsInclude } from '~/server/api/routers/patient/patient.types';
import {
	PathwaysNestingItem,
	PathwaysNestingItemResponse,
} from '~/server/api/routers/patient/v1/custom-form-responses/careplan';
import { prisma } from '~/server/prisma';

export async function unicornButton(checkedById: string, patientId: number, updatedCount = 0) {
	const patient = await prisma.patient.findUniqueOrThrow({
		where: { id: patientId },
		include: PatientWithJoinsInclude,
	});
	const configuration = getLocalConfiguration(patient?.Organization.name);
	const answers = await prisma.assessmentAnswer.findMany({ where: { patientId } });

	const questionsThatNeedAnswer = questionsThatDoNotHaveConfirmedAnswers({ configuration, patient, answers });
	const generateAll = questionsThatNeedAnswer.flatMap((q) => {
		const answersToAdd = generateAnswerForQuestion(q, configuration, patient.id) ?? [];
		return answersToAdd.map(async (a) => {
			const { patientId, assessmentNumber, checkedResponse } = a;
			const result = await prisma.assessmentAnswer.upsert({
				where: {
					patientId_assessmentNumber: {
						patientId,
						assessmentNumber,
					},
				},
				create: {
					patientId,
					assessmentNumber,
					generatedResponseAccepted: true,
					checkedResponse,
					checkedById,
				},
				update: {
					generatedResponseAccepted: true,
					checkedResponse,
					checkedById,
					deleted: false,
				},
			});
			return result;
		});
	});
	await Promise.all(generateAll);
	const newQuestionsThatNeedAnswer = questionsThatDoNotHaveConfirmedAnswers({ configuration, patient, answers });
	if (newQuestionsThatNeedAnswer.length) {
		return unicornButton(checkedById, patientId, updatedCount + generateAll.length);
	} else {
		return { updatedCount: updatedCount || generateAll.length };
	}
}

export function generateAnswerForQuestion(
	assessmentNumber: string,
	configuration: Configuration,
	patientId: number,
	answers: AssessmentCheckInput[] = [],
): AssessmentCheckInput[] | undefined {
	const jsonItem = lookupQuestion(assessmentNumber, configuration);

	if (jsonItem.source === AssessmentQuestionSources.Custom) {
		const handler = customQuestionHandlers[assessmentNumber as CustomAssessmentNumber];
		if (handler) {
			const answer = handler(assessmentNumber, patientId);
			return [...answers, answer];
		} else {
			console.log('no handler for custom question', jsonItem);
		}
	}

	const choiceText: string =
		jsonItem.responses?.length &&
		[AssessmentQuestionType.SelectOne, AssessmentQuestionType.SelectAllThatApply].includes(jsonItem.mappedType)
			? jsonItem.responses[1]?.text ?? jsonItem.responses[0]?.text ?? ''
			: 'Mocked choice text';
	const resolvedChoice =
		jsonItem.mappedType === AssessmentQuestionType.SelectAllThatApply ? [choiceText] : choiceText;

	if (jsonItem.responses?.length) {
		jsonItem.responses[0]!.followup?.forEach((followUpId) => {
			generateAnswerForQuestion(followUpId, configuration, patientId, answers);
		});
	}
	const checkedResponse = { choice: resolvedChoice } as AssessmentCheckInput['checkedResponse'];

	const currentAnswer: AssessmentCheckInput = createAnswer(assessmentNumber, patientId, checkedResponse);

	answers.push(currentAnswer);
	return answers;
}

const createAnswer = (
	assessmentNumber: string,
	patientId: number,
	checkedResponse: AssessmentCheckInput['checkedResponse'],
): AssessmentCheckInput => ({
	checkedResponse,
	assessmentNumber,
	patientId,
	skipGeneratedGuess: true,
});

const testDate = new Date(2024, 4, 27);

export const testSkilledNursingVisitFrequency: SkilledNursingVisitFrequencySchema = {
	startDate: subWeeks(testDate, 2),
	endDate: testDate,
	frequency: 'Weekly',
	daysOfWeek: ['Tuesday'],
	serviceCode: ['test'],
	numberOfWeeks: 2,
};

export const expectedSkilledNursingVisitFrequencyResponse = {
	dates: [
		{
			Services: [{ Code: 'test', Discipline: 'Skilled Nurse' }],
			Date: nextTuesday(subWeeks(testDate, 2)).toISOString(),
		},
		{
			Services: [{ Code: 'test', Discipline: 'Skilled Nurse' }],
			Date: nextTuesday(subWeeks(testDate, 1)).toISOString(),
		},
	],
	RN02Date: new Date(2024, 4, 23).toISOString(),
};

export const testHomeHealthAideVisitFrequency: HomeHealthAideVisitFrequencySchema = {
	startDate: subWeeks(testDate, 2),
	endDate: testDate,
	frequency: 'Weekly',
	daysOfWeek: ['Tuesday'],
	numberOfWeeks: 2,
};

export const expectedHomeHealthAideVisitFrequencyResponse = {
	dates: [
		{
			Services: [{ Code: 'HH11', Discipline: 'Home Health Aide' }],
			Date: nextTuesday(subWeeks(testDate, 2)).toISOString(),
		},
		{
			Services: [{ Code: 'HH11', Discipline: 'Home Health Aide' }],
			Date: nextTuesday(subWeeks(testDate, 1)).toISOString(),
		},
	],
	RN02Date: new Date(2024, 4, 23).toISOString(),
};

export const testAddonEvaluationCheckedResponse: AdditionalEvaluationInput = {
	serviceCode: 'TEST',
	date: testDate.toISOString(),
};

export const expectedAddonEvaluationResponse = {
	dates: [{ Date: testDate.toISOString(), Services: [{ Code: 'TEST', Discipline: null }] }],
	RN02Date: null,
};

export const testMedicationCheckedResponse: MedicationSchema = {
	name: 'Duloxetine',
	strength: '20mg',
	route: 'Oral',
	reason: 'pain management',
	status: 'Longstanding',
	endDate: '2023-12-14T05:00:00.000Z',
	doseAmount: 33,
	doseUnit: 'mg/1',
	frequency: '2',
	startDate: '2023-05-14T05:00:00.000Z',
	instructions: '1 tab po qid PC & HS',
	understanding: ['Purpose'],
	classification: 'C2',
	configurationType: 'HomeCareHomeBase',
	additionalDescriptors: [MedicationDescriptorType.NONE],
};
export const expectedMedicationRpaResponse = {
	Listed: 'False',
	MedicationName: 'Duloxetine',
	MedicationStrength: '20mg',
	StartDate: '2023-05-14T05:00:00.000Z',
	EndDate: '2023-12-14T05:00:00.000Z',
	DoseAmount: 33,
	DoseUnit: 'mg/1',
	Route: 'Oral',
	AlternateRoute: null,
	Frequency: '2',
	Reason: 'pain management',
	Status: 'Longstanding',
	MedicationUnderstanding: ['Purpose'],
	MedicationUnderstandingNotes: null,
	AdditionalMedicationDescriptors: ['None of These'],
	Instructions: '1 tab po qid PC & HS',
	PRN: 'No',
};

export const sampleConfig = getLocalConfiguration('Accentra');

export const testPathwaysNesting: PathwaysNestingItem[] = [
	{
		text: 'ALTERED GASTROINTESTINAL SYSTEM (8212)',
		children: [
			{ text: 'NO' },
			{
				text: 'YES',
				children: [
					{
						text: 'NEED FOR SN FOR OBSERVATION, ASSESSMENT, AND TEACHING RELATED TO GASTROINTESTINAL DISEASE (1105125)',
						children: [{ text: 'NO' }, { text: 'YES' }],
					},
					{
						text: 'NEED FOR SKILLED PROCEDURE RELATED TO GASTROINTESTINAL SYSTEM (1105174)',
						children: [
							{ text: 'NO' },
							{
								children: [
									{
										text: 'NEED FOR COLOSTOMY/ILEOSTOMY TEACHING/CARE (1105126)',
										children: [{ text: 'NO' }, { text: 'YES' }],
									},
									{
										text: 'NEED FOR GASTROSTOMY/JEJUNOSTOMY TEACHING (1105127)',
										children: [{ text: 'NO' }, { text: 'YES' }],
									},
									{
										text: 'NEED FOR GASTROSTOMY/JEJUNOSTOMY FEEDING/CARE (1105128)',
										children: [{ text: 'NO' }, { text: 'YES' }],
									},
									{
										text: 'NEED FOR IMPACTION REMOVAL (1105129)',
										children: [{ text: 'NO' }, { text: 'YES' }],
									},
									{
										text: 'NEED FOR ENEMA (1105130)',
										children: [{ text: 'NO' }, { text: 'YES' }],
									},
								],
								text: 'YES',
							},
						],
					},
				],
			},
		],
	},
];
export const testPathwaysNestingResponse: PathwaysNestingItemResponse[] = [
	{
		text: 'ALTERED GASTROINTESTINAL SYSTEM',
		children: [
			{ text: 'NO' },
			{
				text: 'YES',
				children: [
					{
						text: 'NEED FOR SN FOR OBSERVATION, ASSESSMENT, AND TEACHING RELATED TO GASTROINTESTINAL DISEASE (TC=A275 )',
						children: [{ text: 'NO' }, { text: 'YES' }],
						response: 'NO',
					},
					{
						text: 'NEED FOR SKILLED PROCEDURE RELATED TO GASTROINTESTINAL SYSTEM',
						children: [
							{ text: 'NO' },
							{
								text: 'YES',
								children: [
									{
										text: 'NEED FOR COLOSTOMY/ILEOSTOMY TEACHING/CARE (TC=A285 )',
										details: [
											{ text: 'Treatment Code', response: 'A285' },
											{ text: 'Order', response: 'intervention details' },
											{ text: 'Goal', response: 'goal details' },
										],
										children: [{ text: 'NO' }, { text: 'YES' }],
										response: 'YES',
									},
									{
										text: 'NEED FOR GASTROSTOMY/JEJUNOSTOMY TEACHING (TC=A295 )',
										children: [{ text: 'NO' }, { text: 'YES' }],
										response: 'NO',
									},
									{
										text: 'NEED FOR GASTROSTOMY/JEJUNOSTOMY FEEDING/CARE (TC=A305 )',
										children: [{ text: 'NO' }, { text: 'YES' }],
										response: 'NO',
									},
									{
										text: 'NEED FOR IMPACTION REMOVAL (TC=A315A )',
										children: [{ text: 'NO' }, { text: 'YES' }],
										response: 'NO',
									},
									{
										text: 'NEED FOR ENEMA (TC=A325 )',
										children: [{ text: 'NO' }, { text: 'YES' }],
										response: 'NO',
									},
								],
							},
						],
						response: 'YES',
					},
				],
			},
		],
		response: 'YES',
	},
];

const customQuestionHandlers: {
	[key in CustomAssessmentNumber]?: (assessmentNumber: string, patientId: number) => AssessmentCheckInput;
} = {
	plan_builder_custom: (assessmentNumber, patientId) =>
		createAnswer(assessmentNumber, patientId, {
			choice: {
				areas: [
					{
						category: 'Default (0000000)',
						problems: [
							{
								name: 'SN EVALUATION PERFORMED.  ADDITIONAL VISITS TO BE PROVIDED. (1104908)',
								goalDetails: faker.company.buzzPhrase(),
								interventionDetails: faker.company.buzzPhrase(),
							},
						],
					},
				],
			},
		}),
	vaccinations_custom: (assessmentNumber, patientId) =>
		createAnswer(assessmentNumber, patientId, { choice: { vaccines: [] } }),
	medications_custom: (assessmentNumber, patientId) =>
		createAnswer(assessmentNumber, patientId, { choice: { medications: [] } }),
	med_admin_custom: (assessmentNumber, patientId) =>
		createAnswer(assessmentNumber, patientId, { choice: { med_administer_records: [] } }),
	addon_evaluation_custom: (assessmentNumber, patientId) =>
		createAnswer(assessmentNumber, patientId, { choice: { addonEvaluations: [] } }),
	home_health_aide_visit_frequencies_custom: (assessmentNumber, patientId) =>
		createAnswer(assessmentNumber, patientId, { choice: { homeHealthAideVisitFrequencies: [] } }),
	diagnoses_custom: (assessmentNumber, patientId) => {
		const symptomControlRating = symptomControlRatingOptions[0]!;
		const onsetOrExacerbation = onsetOrExacerbationOptions[0]!;
		const diagnosis: Diagnosis = {
			dateOfOnsetOrExacerbation: new Date('2021-01-01'),
			diagnosisCode: '12345',
			diagnosisDescription: 'This is a diagnosis description',
			onsetOrExacerbation,
			symptomControlRating,
		};
		return createAnswer(assessmentNumber, patientId, { choice: { diagnoses: [diagnosis] } });
	},
	skilled_nursing_visit_frequencies_custom: (assessmentNumber, patientId) =>
		createAnswer(assessmentNumber, patientId, {
			choice: { skilledNursingVisitFrequencies: [testSkilledNursingVisitFrequency] },
		}),
	advance_directives_custom: (assessmentNumber, patientId) =>
		createAnswer(assessmentNumber, patientId, { choice: { advanceDirectives: [] } }),
	supply_list_custom: (assessmentNumber, patientId) =>
		createAnswer(assessmentNumber, patientId, { choice: { supplies: [] } }),
	procedures_custom: (assessmentNumber, patientId) =>
		createAnswer(assessmentNumber, patientId, { choice: { procedures: [] } }),
	facilities_custom: (assessmentNumber, patientId) =>
		createAnswer(assessmentNumber, patientId, { choice: { facilities: [] } }),
	vital_sign_parameters_custom: (assessmentNumber, patientId) =>
		createAnswer(assessmentNumber, patientId, { choice: { vitalSignParameters: {} } } as AssessmentVitalSignParams),
};
