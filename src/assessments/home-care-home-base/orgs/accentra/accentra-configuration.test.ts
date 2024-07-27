import { expect, it } from '@jest/globals';
import { allIdsInConfig, allQuestionsInConfig } from '~/assessments/home-care-home-base/orgs/test-utils';
import { recursivelyGetAllQuestionsAndFollowUps } from '~/assessments/util/lookupQuestionUtil';
import { backOfficeCompletedConfig } from './backOfficeCompletedConfig';
import { AccentraConfig } from './index';
import { qaConfig } from './qaConfig';

const allQuestions = AccentraConfig.allQuestions.filter((q) => {
	if (q.type) {
		return q.type.toLowerCase() !== 'panel';
	}
	return true;
});

describe('Ensure Accentra Configuration is Valid', () => {
	it('Should not have questions without ids', () => {
		allQuestions.forEach((q) => {
			expect(q.id).toBeDefined();
			expect(q.id.length).toBeGreaterThan(0);
		});
	});

	it('Should not have ids in one config and not the other', () => {
		const allQaConfigIds = allIdsInConfig(qaConfig);
		const allCompletedConfigIds = allIdsInConfig(backOfficeCompletedConfig);
		const idsInQANotInCompleted = allQaConfigIds.filter((id) => !allCompletedConfigIds.includes(id));
		const idsInCompletedNotInQA = allCompletedConfigIds.filter((id) => !allQaConfigIds.includes(id));
		// console.log({ idsInQANotInCompleted, idsInCompletedNotInQA });
		expect(idsInQANotInCompleted).toEqual([]);
		expect(idsInCompletedNotInQA).toEqual([]);
	});

	it('All ids in config (and follow-ups) should be in datafile', () => {
		const allQaConfigQuestions = allQuestionsInConfig(qaConfig);
		const allQaConfigQuestionsAndFollowups = recursivelyGetAllQuestionsAndFollowUps(
			allQaConfigQuestions,
			AccentraConfig,
		);
		for (const id of allQaConfigQuestionsAndFollowups.map((q) => q.id)) {
			const match = AccentraConfig.allQuestions.find((q) => q.id === id);
			if (!match) {
				console.log(`missing id: ${id}`);
			}
			expect(match).toBeDefined();
		}
	});

	it('Should not have any top level questions in data file not in config', () => {
		const allFollowUps = allQuestions.flatMap((q) => q.responses?.flatMap((r) => r.followup) ?? []);
		const topLevel = allQuestions.filter((q) => !allFollowUps.includes(q.id));
		const allQaConfigIds = allIdsInConfig(qaConfig);
		const missingFromConfig = topLevel.filter((q) => !allQaConfigIds.includes(q.id));
		const missingFromConfigIds = missingFromConfig.map((q) => q.id);
		expect(missingFromConfigIds.length).toEqual(78);
		expect(missingFromConfigIds).toMatchSnapshot();
	});

	it('Should not have follow ups in the config', () => {
		const allQaConfigIds = allIdsInConfig(qaConfig);
		const allFollowUps = allQuestions
			.flatMap((q) => q.responses?.flatMap((r) => r.followup) ?? [])
			.filter((f) => f) as string[];
		const followUpsInConfig = allFollowUps.filter((id) => allQaConfigIds.includes(id));
		expect(followUpsInConfig).toEqual([]);
	});

	it('Should not have duplicate ids in the qaConfig', () => {
		const allQaConfigIds = allIdsInConfig(qaConfig);
		const duplicates = allQaConfigIds.filter((id, index) => allQaConfigIds.indexOf(id) !== index);
		expect(duplicates).toEqual([]);
	});

	it('Completed Config Duplicate Report', () => {
		const allQaConfigIds = allIdsInConfig(backOfficeCompletedConfig).filter((id) => id) as string[];
		const list: { id: string; numberOfTimesDuplicated: number }[] = [];
		allQaConfigIds.forEach((id) => {
			const numberOfTimesDuplicated = allQaConfigIds.filter((i) => i === id).length;
			if (!list.find((i) => i.id === id)) {
				list.push({ id, numberOfTimesDuplicated });
			}
		});
		// const ordered = list.sort((a, b) => b.numberOfTimesDuplicated - a.numberOfTimesDuplicated);
		// fs.writeFileSync('temp.json', JSON.stringify(ordered, null, 2));
	});

	it('Should merge in any oasis followups', () => {
		const questionWithMergedFollowup = allQuestions.find((q) => q.id === 'M1340');
		const responseWithFollowup = questionWithMergedFollowup?.responses?.find(
			(r) => r.text === 'Yes, patient has at least one observable surgical wound',
		);
		if (!responseWithFollowup?.followup) {
			throw new Error('failed test - responseWithFollowup not found');
		}
		expect(responseWithFollowup.followup.length).toBe(2);
		expect(responseWithFollowup.followup[1]).toBe('PA-96dadc');
	});
});
