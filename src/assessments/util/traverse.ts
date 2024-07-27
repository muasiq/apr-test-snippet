import { Group, QuestionSource, SubGroup } from '~/assessments/types';

export const NODE_TYPE = {
	GROUP: 'GROUP',
	SUB_GROUP: 'SUB_GROUP',
	SUB_HEADING: 'SUB_HEADING',
	QUESTION: 'QUESTION',
} as const;
export type NodeType = (typeof NODE_TYPE)[keyof typeof NODE_TYPE];

type TypeMap = {
	GROUP: Group;
	SUB_GROUP: SubGroup;
	SUB_HEADING: Group;
	QUESTION: QuestionSource;
};

type NodeArgs = { [K in keyof TypeMap]: [K, TypeMap[K]] }[keyof TypeMap];
type Callback = <T extends NodeArgs>(...args: T) => T[1] | void;

// preorder traversal
function preOrderTraverse(config: Group[], callback: Callback) {
	return config.map((origin) => {
		const group = callback(NODE_TYPE.GROUP, { ...origin }) ?? origin;

		if (group.subHeadings) {
			group.subHeadings = group.subHeadings?.map((originSubHeading) => {
				const subHeading = callback(NODE_TYPE.SUB_HEADING, { ...originSubHeading }) ?? originSubHeading;
				subHeading.subGroups = preOrderTraverseSubGroups(subHeading.subGroups, callback);
				return subHeading;
			});
		} else {
			group.subGroups = preOrderTraverseSubGroups(group.subGroups, callback);
		}

		return group;
	});
}

function preOrderTraverseSubGroups(subGroups: SubGroup[], callback: Callback) {
	return subGroups.map((origin) => {
		const subGroup = callback(NODE_TYPE.SUB_GROUP, { ...origin }) ?? origin;
		subGroup.questions = subGroup.questions.map((question) => {
			return callback(NODE_TYPE.QUESTION, question) ?? question;
		});
		return subGroup;
	});
}

// postorder traversal
function postOrderTraverse(config: Group[], callback: Callback) {
	return config.map((origin) => {
		const group = { ...origin };
		if (group.subHeadings) {
			group.subHeadings = group.subHeadings?.map((subHeadingOrigin) => {
				const subHeading = { ...subHeadingOrigin };
				subHeading.subGroups = postOrderTraverseSubGroups(subHeading.subGroups, callback);
				return callback(NODE_TYPE.SUB_HEADING, subHeading) ?? subHeading;
			});
		} else {
			group.subGroups = postOrderTraverseSubGroups(group.subGroups, callback);
		}

		return callback(NODE_TYPE.GROUP, group) ?? group;
	});
}

function postOrderTraverseSubGroups(subGroups: SubGroup[], callback: Callback) {
	return subGroups.map((origin) => {
		const subGroup = { ...origin };
		subGroup.questions = subGroup.questions.map((question) => {
			return callback(NODE_TYPE.QUESTION, question) ?? question;
		});
		return callback(NODE_TYPE.SUB_GROUP, subGroup) ?? subGroup;
	});
}

export function traverse(
	config: Group[],
	callback: Callback,
	{ order = 'preorder' }: { order?: 'preorder' | 'postorder' } = {},
) {
	if (order === 'preorder') {
		return preOrderTraverse(config, callback);
	}
	return postOrderTraverse(config, callback);
}
