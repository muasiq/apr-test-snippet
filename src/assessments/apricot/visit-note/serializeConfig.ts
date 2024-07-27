import { get } from 'lodash';
import { Configuration } from '~/assessments/configurations';
import { Group, QuestionSource, SubGroup } from '~/assessments/types';
import { SchemaAssessmentAnswer } from '~/common/types/AssessmentSuggestionAndChoice';
import { PatientWithJoins } from '~/server/api/routers/patient/patient.types';
import { NODE_TYPE, traverse } from '../../util/traverse';
import { serializeQuestion } from './serializeQuestion';

export type SerializedQuestion = {
	label?: string;
	note?: string;
	value?: string | number | null;
	style?: 'singleLine';
};

export type SerializedSignature = {
	type: 'signature';
	label: string;
	name: string;
};

export type SerializedNote = {
	type: 'note';
	label: string;
};

export type SerializedGroup = {
	label?: string;
	note?: string;
	children: SerializedNode[];
};

export type SerializedComponent = SerializedNote | SerializedSignature;

export type SerializedNode = SerializedGroup | SerializedQuestion | SerializedComponent | undefined;

type Context = { patientData: PatientWithJoins; configuration: Configuration; answers: SchemaAssessmentAnswer[] };
type Options = { includeExplanations?: boolean };

export function serialize(config: Group[], ctx: Context, { includeExplanations }: Options = {}): SerializedGroup[] {
	const { patientData } = ctx;
	return traverse(
		config,
		(type, data) => {
			if (type === NODE_TYPE.GROUP) {
				return { label: data.heading, children: data.subHeadings ?? data.subGroups } as unknown as Group;
			}

			if (type === NODE_TYPE.SUB_HEADING) {
				return { label: data.heading, children: data.subGroups } as unknown as Group;
			}

			if (type === NODE_TYPE.SUB_GROUP) {
				if (data.multiple) {
					const repeatTimes = get(patientData, data.multiple.repeatTimesFieldResolver, 0) as number;
					return {
						label: data.heading,
						children: Array.from({ length: repeatTimes }, (_, index) => {
							const label = `${data.heading} ${index + 1}`;
							const multipleIndex = index + 1;
							const children = data.multiple?.questions.map((item) =>
								serializeQuestion({ question: item, multipleIndex, includeExplanations, ...ctx }),
							);
							return { label, children };
						}),
					} as unknown as SubGroup;
				} else {
					return { label: data.heading, children: data.questions } as unknown as SubGroup;
				}
			}

			if (type === NODE_TYPE.QUESTION) {
				return serializeQuestion({ question: data, ...ctx, includeExplanations }) as QuestionSource;
			}

			throw new Error('unknown type', type);
		},
		{ order: 'postorder' },
	) as unknown as SerializedGroup[];
}

export function isSerializedComponent(node: SerializedNode): node is SerializedComponent {
	return !!(node && 'type' in node);
}
