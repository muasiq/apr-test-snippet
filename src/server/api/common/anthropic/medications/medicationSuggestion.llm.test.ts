import { expect, it } from '@jest/globals';
import {
	ConfigurationType,
	NurseInterviewQuestionItem,
	PatientArtifact,
	PatientArtifactTag,
	PatientStatus,
} from '@prisma/client';
import { PatientWithAssessmentContext } from '~/server/api/routers/patient/patient.types';
import { medicationsSuggestion } from '.';
import { prisma } from '../../../../prisma';
import { Models } from '../claude';
import { GenerateSuggestionParams } from '../generateSuggestion';

jest.mock('../../../routers/auditLog/auditLog.service');
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('../../fdb', () => ({ __esModule: true, ...jest.requireActual('../../fdb') }));

function createPatient({
	artifacts,
	interviewQuestions,
}: {
	artifacts: { tagName: PatientArtifact['tagName']; text: string }[];
	interviewQuestions: Partial<NurseInterviewQuestionItem>[];
}) {
	return {
		id: 1,
		configurationType: ConfigurationType.HomeCareHomeBase,
		PatientArtifacts: artifacts.map((artifact) => ({
			tagName: artifact.tagName,
			patientDocumentArtifact: { documentRawText: artifact.text },
		})),
		NurseInterview: {
			NurseInterviewThemeSummaries: [{ QuestionItems: interviewQuestions }],
		},
	} as unknown as PatientWithAssessmentContext;
}

describe('medicationSuggestion', () => {
	it('should generate medication suggestions from ocr and interview notes', async () => {
		const patientToUse = await prisma.patient.findFirstOrThrow({
			where: {
				status: PatientStatus.WithQA,
				configurationType: ConfigurationType.HomeCareHomeBase,
				PatientArtifacts: { some: { tagName: PatientArtifactTag.Medication } },
			},
			include: {
				NurseInterview: { include: { NurseInterviewThemeSummaries: { include: { QuestionItems: true } } } },
				InterviewQuestion: true,
				PatientArtifacts: { include: { patientDocumentArtifact: { include: { paragraphs: true } } } },
			},
		});
		const response = await medicationsSuggestion({
			patient: patientToUse,
			model: Models.SONNET_V2,
		} as GenerateSuggestionParams);

		expect(
			response.choice.medications.find((m) => {
				return m.name?.toLowerCase().trim().includes('losartan');
			}),
		).toStrictEqual({
			name: 'losartan 100 mg tablet',
			strength: '100 mg',
			endDate: '',
			status: 'Longstanding',
			frequency: 'Daily',
			fdb: {
				type: 'dispensableDrug',
				name: 'losartan 100 mg tablet',
				id: '286047',
				availableDoseUnits: ['tablet', 'mg', 'Per instructions'],
			},
			instructions: '',
			route: 'oral',
			alternativeRoute: 'By mouth',
			reason: 'HTN',
			understanding: ['Purpose', 'Direction for Use', 'Side Effects / Interactions'],
			additionalDescriptors: ['None of These'],
			startDate: expect.any(Date),
			configurationType: 'HomeCareHomeBase',
			doseAmount: 1,
			doseUnit: 'tablet',
		});
	}, 60000);

	it('should generate medication suggestions from ocr', async () => {
		// jest.spyOn(fdb, 'resolveDispensableDrug').mockResolvedValue(undefined);

		const patient = createPatient({
			artifacts: [
				{
					tagName: PatientArtifactTag.Medication,
					text: 'MEDICATION PROFILE\n35\n35\nDATE N,C,LS\nDRUG\nDOSE, FREQUENCY, ROUTE D/C DATE\nINITIALS\n1/27/2024 • Aspirin 325mg EC tak Hab Bymouth\n2xaday x 42 \ndaup\nColace 100mg Capsule I capsule By\nmouth 2xaday\n• meloxicam 15mg tab Hat Bymouth. I\nZofran 4mg tab Hats Bymour daily\nQ le hours as needed\n• Biotin tab Hat Bymouth daily\nNP Thyroid 90mg tab Hab By mouth\nin Am\nProtoniX 40mgtab HabBy Mouthin\n• Vi+D3 25mcg Cup (1000ut)\nAm\nCapBy mouth daily in Am\nClinician\u0027s Signature\nInitial Date\nClinician\u0027s Signature\nInitial Date\nClinician\u0027s Signature\nInitial Date\nClinician\u0027s Signature\nInitial Date\nClinician\u0027s Signature\nInitial Date\nClinician\u0027s Signature\nInitial Date\nClinician\u0027s Signature\nInitial Date\nClinician\u0027s Signature\nInitial Date\nDURACE\n',
				},
			],
			interviewQuestions: [
				{
					// should extract Betadine
					question: 'Describe the interventions needed by the patient.',
					LLMSummarizedText: [
						'There were no procedures or tests ordered at this time. Skilled nurse completed dressing change while in the home. Dressing change consisted of skilled nursing, incision line, over staples with Betadine, covered all staples.',
						'Patient has 30 staples to the left knee. Skilled nurse painted incision line with Betadine, covered with sterile gauze and secured with transparent dressing. Patient voiced no additional pain or discomfort during dressing change.',
						'Skilled nursing instructed son on how to change dressing as needed when additional providers are not in home.',
					],
				},
				{
					// should extract oxygen
					question: "Describe the patient's respiratory health.",
					LLMSummarizedText: [
						"Patient's lung sounds are diminished to bilateral bases, crackles throughout. Patient denies shortness of breath at rest, but when patient ambulates five to 10 feet, patient becomes extremely short of breath, requiring patient to sit and rest one to three minutes for recovery.",
						'Patient is oxygen dependent, oxygen is set at 2 to 3 L. Patient also has a portable easy pulse POC and O2 tanks for backup.',
					],
				},
			],
		});

		const response = await medicationsSuggestion({
			patient,
			model: Models.HAIKU,
		} as GenerateSuggestionParams);

		const medications = response.choice.medications;

		[
			{ name: 'aspirin 325 mg tablet' },
			{ name: 'Colace 100 mg capsule' },
			{ name: 'meloxicam 15 mg tablet' },
			{ name: 'ondansetron HCl 4 mg tablet' },
			{ name: 'biotin 5 mg tablet' },
			{ name: 'NP Thyroid 90 mg tablet' },
			{ name: 'Protonix 40 mg tablet,delayed release' },
			{ name: 'Vitamin D3 25 mcg (1,000 unit) capsule' },
			{ name: 'Betadine Swabsticks 10 %' },
			{ name: 'OXYGEN' },
		].forEach((val) => {
			expect(medications).toEqual(expect.arrayContaining([expect.objectContaining(val)]));
		});
	}, 60000);
});
