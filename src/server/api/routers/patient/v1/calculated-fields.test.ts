import { expect, it } from '@jest/globals';
import { AssessmentAnswer } from '@prisma/client';
import { getLocalConfiguration } from '~/assessments/configurations';
import { getMoodInterviewAnswers, moodQuestionsBasedAssessmentAnswers } from './calculated-fields';

describe('moodQuestionsBasedAssessmentAnswers', () => {
	it('should return negative result', () => {
		const sampleAssessmentAnswers: Array<Partial<AssessmentAnswer>> = [
			{
				assessmentNumber: 'D0150A1',
				checkedResponse: { choice: 'NOT ASSESSED/NO INFORMATION' },
			},
			{
				assessmentNumber: 'D0150A2',
				checkedResponse: { choice: '7 - 11 DAYS' },
			},
			{
				assessmentNumber: 'D0150B1',
				checkedResponse: { choice: 'NOT ASSESSED/NO INFORMATION' },
			},
			{
				assessmentNumber: 'D0150B2',
				checkedResponse: { choice: '12 - 14 DAYS' },
			},
		];
		sampleAssessmentAnswers.forEach((answer) => {
			const result = moodQuestionsBasedAssessmentAnswers([answer] as AssessmentAnswer[]);
			expect(result).toHaveLength(1);
			expect(result[0]?.assessmentNumber).toEqual('PA-ec76c0');
			expect(result[0]?.checkedResponse).toEqual({ choice: 'NO - END PHQ INTERVIEW' });
		});
	});
	it('should return affirmative result', () => {
		const sampleAssessmentAnswers: Array<Partial<AssessmentAnswer>> = [
			{
				assessmentNumber: 'D0150A1',
				checkedResponse: { choice: 'YES' },
			},
			{
				assessmentNumber: 'D0150A2',
				checkedResponse: { choice: 'YES' },
			},
		];
		const result = moodQuestionsBasedAssessmentAnswers(sampleAssessmentAnswers as AssessmentAnswer[]);
		expect(result).toHaveLength(1);
		expect(result[0]?.assessmentNumber).toEqual('PA-ec76c0');
		expect(result[0]?.checkedResponse).toEqual({ choice: 'YES - CONTINUE TO PHQ9 INTERVIEW' });
	});
});

describe('getMoodInterviewAnswers', () => {
	const configuration = getLocalConfiguration('Accentra');

	it('should return total score 99 (more than 3 unanswered questions)', () => {
		const sampleAssessmentAnswers: Array<Partial<AssessmentAnswer>> = [
			{
				assessmentNumber: 'D0150A2',
				checkedResponse: { choice: '2-6 days (several days)' },
			},
			{
				assessmentNumber: 'D0150B2',
				checkedResponse: { choice: '7-11 days (half or more of the days)' },
			},
			{
				assessmentNumber: 'D0150C2',
				checkedResponse: { choice: '12-14 days (nearly every day)' },
			},
		];
		const result = getMoodInterviewAnswers(sampleAssessmentAnswers as AssessmentAnswer[], configuration).answers;
		expect(result).toHaveLength(1);
		expect(result[0]?.questionText).toEqual('Total Severity Score:');
		expect(result[0]?.checkedResponse).toEqual({ choice: 99 });
	});

	it('should return total score 15 (less than 3 unanswered questions)', () => {
		const sampleAssessmentAnswers: Array<Partial<AssessmentAnswer>> = [
			{
				assessmentNumber: 'D0150A2',
				checkedResponse: { choice: '2-6 days (several days)' },
			},
			{
				assessmentNumber: 'D0150B2',
				checkedResponse: { choice: '7-11 days (half or more of the days)' },
			},
			{
				assessmentNumber: 'D0150C2',
				checkedResponse: { choice: '12-14 days (nearly every day)' },
			},
			{
				assessmentNumber: 'D0150G2',
				checkedResponse: { choice: 'Never or 1 day' },
			},
			{
				assessmentNumber: 'D0150D2',
				checkedResponse: { choice: '12-14 days (nearly every day)' },
			},
			{
				assessmentNumber: 'D0150E2',
				checkedResponse: { choice: '12-14 days (nearly every day)' },
			},
			{
				assessmentNumber: 'D0150F2',
				checkedResponse: { choice: '12-14 days (nearly every day)' },
			},
		];
		const result = getMoodInterviewAnswers(sampleAssessmentAnswers as AssessmentAnswer[], configuration).answers;
		expect(result).toHaveLength(1);
		expect(result[0]?.questionText).toEqual('Total Severity Score:');
		expect(result[0]?.checkedResponse).toEqual({ choice: 15 });
	});
});
