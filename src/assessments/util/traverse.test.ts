import { expect } from '@jest/globals';
import { Group } from '../types';
import { traverse } from './traverse';

const MOCK_CONFIG: Group[] = [
	{
		heading: 'group1',
		subHeadings: [
			{
				heading: 'subheading1',
				subGroups: [
					{
						heading: 'subgroup1',
						questions: [{ id: 'question1' }],
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
				questions: [{ id: 'question2' }, { id: 'question3' }],
			},
		],
	},
];

describe('traverse', () => {
	it('postorder traversal', () => {
		const calledIds: (string | undefined)[] = [];

		const newConfig = traverse(MOCK_CONFIG, (_type, data) => {
			calledIds.push('heading' in data ? data.heading : data.id);
		});

		expect(newConfig).toEqual(MOCK_CONFIG);
		expect(calledIds).toEqual([
			'group1',
			'subheading1',
			'subgroup1',
			'question1',
			'group2',
			'subgroup2',
			'question2',
			'question3',
		]);
	});

	it('postorder traversal', () => {
		const calledIds: (string | undefined)[] = [];

		const newConfig = traverse(
			MOCK_CONFIG,
			(_type, data) => {
				calledIds.push('heading' in data ? data.heading : data.id);
			},
			{ order: 'postorder' },
		);

		expect(newConfig).toEqual(MOCK_CONFIG);
		expect(calledIds).toEqual([
			'question1',
			'subgroup1',
			'subheading1',
			'group1',
			'question2',
			'question3',
			'subgroup2',
			'group2',
		]);
	});

	it('mutation traversal', () => {
		const withUpdatedLabels = traverse(
			MOCK_CONFIG,
			(type, data) => {
				if ('heading' in data) {
					return { ...data, heading: `${type}: ${data.heading}` };
				} else {
					return { ...data, id: `${type}: ${data.id}` };
				}
			},
			{ order: 'postorder' },
		);

		const calledIds: (string | undefined)[] = [];
		traverse(withUpdatedLabels, (_type, data) => {
			calledIds.push('heading' in data ? data.heading : data.id);
		});

		expect(calledIds).toEqual([
			'GROUP: group1',
			'SUB_HEADING: subheading1',
			'SUB_GROUP: subgroup1',
			'QUESTION: question1',
			'GROUP: group2',
			'SUB_GROUP: subgroup2',
			'QUESTION: question2',
			'QUESTION: question3',
		]);
	});
});
