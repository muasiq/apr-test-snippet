import { expect, it } from '@jest/globals';
import { AssessmentAnswer, Gender } from '@prisma/client';
import { ChoiceConfig } from '~/assessments/home-care-home-base/orgs/choice';
import { generateWoundMappedResponse } from './rpa-wound-utils';

describe('Map Apricot Wound Questions to HCHB', () => {
	it('Should map Wound questions to hchb', () => {
		const sampleAnswers: Partial<AssessmentAnswer>[] = [
			{
				assessmentNumber: 'MQ6BB554AY-#3',
				checkedResponse: null,
			},
			{
				assessmentNumber: 'MQ6BB554AY-#1',
				checkedResponse: { choice: 'Head/Neck' },
			},
			{
				assessmentNumber: 'MQ6BB554AY-#2',
				checkedResponse: { choice: 'Head/Neck' },
			},
			{
				assessmentNumber: 'W1001-#1',
				checkedResponse: { choice: 'Cranial, Upper, Left, Posterior' },
			},
			{
				assessmentNumber: 'W1001-#2',
				checkedResponse: { choice: 'Neck, Left, Anterior' },
			},
			{
				assessmentNumber: 'MQ6BB554AY-#4',
				checkedResponse: null,
			},
		];
		const generatedMap = generateWoundMappedResponse(
			sampleAnswers as AssessmentAnswer[],
			ChoiceConfig,
			Gender.Female,
		);

		expect(generatedMap.relevantWoundAssessmentNumbers).toEqual(sampleAnswers.map((a) => a.assessmentNumber));

		expect(generatedMap.woundMappedResponses).toEqual([
			{
				assessmentNumber: 'hchb_wound_view-#1',
				questionText: 'Wound View 1',
				mappedType: 'SelectOne',
				checkedResponse: { choice: 'Female Posterior' },
				integrationMessage: null,
				integrationStatus: 'Pending',
			},
			{
				assessmentNumber: 'hchb_wound_region-#1',
				questionText: 'Wound Region 1',
				mappedType: 'SelectOne',
				checkedResponse: { choice: 'Head/Neck' },
				integrationMessage: null,
				integrationStatus: 'Pending',
			},
			{
				assessmentNumber: 'hchb_wound_location-#1',
				questionText: 'Wound Location 1',
				mappedType: 'SelectOne',
				checkedResponse: { choice: 'Upper Cranial, Left' },
				integrationMessage: null,
				integrationStatus: 'Pending',
			},
			{
				assessmentNumber: 'hchb_wound_region_coordinates-#1',
				questionText: 'Wound Region Coordinates',
				mappedType: 'EmbeddedObject',
				checkedResponse: { choice: { x: 457, y: 229 } },
				integrationMessage: null,
				integrationStatus: 'Pending',
			},
			{
				assessmentNumber: 'hchb_wound_location_coordinates-#1',
				questionText: 'Wound Location Coordinates',
				mappedType: 'EmbeddedObject',
				checkedResponse: { choice: { x: 332, y: 247 } },
				integrationMessage: null,
				integrationStatus: 'Pending',
			},
			{
				assessmentNumber: 'hchb_wound_view-#2',
				questionText: 'Wound View 2',
				mappedType: 'SelectOne',
				checkedResponse: { choice: 'Female Anterior' },
				integrationMessage: null,
				integrationStatus: 'Pending',
			},
			{
				assessmentNumber: 'hchb_wound_region-#2',
				questionText: 'Wound Region 2',
				mappedType: 'SelectOne',
				checkedResponse: { choice: 'Head/Neck' },
				integrationMessage: null,
				integrationStatus: 'Pending',
			},
			{
				assessmentNumber: 'hchb_wound_location-#2',
				questionText: 'Wound Location 2',
				mappedType: 'SelectOne',
				checkedResponse: { choice: 'Neck, Left' },
				integrationMessage: null,
				integrationStatus: 'Pending',
			},
			{
				assessmentNumber: 'hchb_wound_region_coordinates-#2',
				questionText: 'Wound Region Coordinates',
				mappedType: 'EmbeddedObject',
				checkedResponse: { choice: { x: 457, y: 235 } },
				integrationMessage: null,
				integrationStatus: 'Pending',
			},
			{
				assessmentNumber: 'hchb_wound_location_coordinates-#2',
				questionText: 'Wound Location Coordinates',
				mappedType: 'EmbeddedObject',
				checkedResponse: { choice: { x: 560, y: 930 } },
				integrationMessage: null,
				integrationStatus: 'Pending',
			},
		]);
	});
});
