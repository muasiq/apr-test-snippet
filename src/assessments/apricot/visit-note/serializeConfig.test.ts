import { expect } from '@jest/globals';
import { get } from 'lodash';
import { getLocalConfiguration } from '~/assessments/configurations';
import { AssessmentQuestionSources, Group } from '~/assessments/types';
import { SchemaAssessmentAnswer } from '~/common/types/AssessmentSuggestionAndChoice';
import { PatientWithJoins } from '~/server/api/routers/patient/patient.types';
import { DataRendererOptions } from '../data-renderers/options';
import { serialize } from './serializeConfig';

const MOCK_CONFIG: Group[] = [
	{
		heading: 'group1',
		subHeadings: [
			{
				heading: 'subheading1',
				subGroups: [
					{
						heading: 'subgroup1',
						questions: [
							{ patientDataResolver: DataRendererOptions.NAME },
							{ patientDataResolver: DataRendererOptions.DATE_OF_BIRTH },
							{ id: 'MQ29KAPBEQ', source: AssessmentQuestionSources.SOCStandardAssessment },
						],
					},
				],
			},
		],
		subGroups: [],
	},
	{
		heading: 'group2',
		subGroups: [
			{
				heading: 'subgroup2',
				questions: [{ id: 'A1005', source: AssessmentQuestionSources.Oasis }],
			},
		],
	},
];

const patientData = {
	id: 1,
	firstName: 'John',
	lastName: 'Smith',
	dateOfBirth: new Date('01/01/1970'),
} as unknown as PatientWithJoins;

const answers = [
	{
		assessmentNumber: 'A1005',
		checkedResponse: { choice: ['No, not of Hispanic, Latino/a, or Spanish origin'] },
		generatedResponse: { choice: [], explanation: '' },
		generatedResponseAccepted: false,
	},
	{
		assessmentNumber: 'MQ29KAPBEQ',
		checkedResponse: { choice: 'English' },
		generatedResponse: {
			choice: 'English',
			explanation:
				'The documents state "Patient\'s primary English language", which confirms that English is the patient\'s primary language.',
		},
		generatedResponseAccepted: true,
	},
] as unknown as SchemaAssessmentAnswer[];

const configuration = getLocalConfiguration('Accentra');

describe('serialize form configuration', () => {
	it('serialize', () => {
		const serialized = serialize(MOCK_CONFIG, { patientData, configuration, answers });
		expect(serialized).toEqual([
			{
				label: 'group1',
				children: [
					{
						label: 'subheading1',
						children: [
							{
								label: 'subgroup1',
								children: [
									{
										label: 'Patient Name',
										value: 'John Smith',
									},
									{
										label: 'Patient Date of Birth',
										value: 'January 1, 1970',
									},
									{
										label: "Indicate the patient's primary spoken language.",
										value: 'English',
									},
								],
							},
						],
					},
				],
			},
			{
				label: 'group2',
				children: [
					{
						label: 'subgroup2',
						children: [
							{
								label: '(A1005) Ethnicity: Is the patient of Hispanic, Latino/a, or Spanish origin?',
								value: 'No, not of Hispanic, Latino/a, or Spanish origin',
							},
						],
					},
				],
			},
		]);
	});

	it('serialize with explanation notes', () => {
		const serialized = serialize(
			MOCK_CONFIG,
			{ patientData, configuration, answers },
			{ includeExplanations: true },
		);

		const question = get(serialized, '[0].children[0].children[0].children[2]');
		expect(question).toEqual({
			label: "Indicate the patient's primary spoken language.",
			value: 'English',
			note: 'SOURCE: The documents state "Patient\'s primary English language", which confirms that English is the patient\'s primary language.',
		});
	});
});
