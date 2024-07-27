import { Document, Page, Text, View } from '@react-pdf/renderer';
import { compact } from 'lodash';
import { jsx } from 'react/jsx-runtime';
import { formatDateTime } from '~/common/utils/dateFormat';
import { PatientWithJoins } from '~/server/api/routers/patient/patient.types';
import {
	isSerializedComponent,
	SerializedComponent,
	SerializedGroup,
	SerializedNode,
	SerializedQuestion,
} from '../../serializeConfig';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Signature } from './components/Signature';
import { styles } from './styles';

export function PdfRender({ config, patientData }: { config: SerializedGroup[]; patientData: PatientWithJoins }) {
	return jsx(Document, {
		children: config.map((group, index) => {
			const isLastGroup = index === config.length - 1;

			return jsx(Page, {
				size: 'A4',
				style: styles.page,
				children: [
					jsx(Header, { key: 'header', patientData: patientData }),
					jsx(View, {
						key: 'body',
						style: styles.body,
						children: [
							jsx(Group, { key: group.label, ...group }),
							...(isLastGroup ? [jsx(Attestation, { key: 'attestation', patientData })] : []),
						],
					}),
					jsx(Footer, { key: 'footer' }),
				],
			});
		}),
	});
}

function Attestation({ patientData }: { patientData: PatientWithJoins }) {
	if (patientData.nurseSignOffName && patientData.nurseSignOffDate) {
		return jsx(Signature, {
			key: 'signature',
			label: `My full name below serves as an attestation that the information contained herein was approved by the signing agent on ${formatDateTime(patientData.nurseSignOffDate)} and services were ordered by the physician(s) identified.`,
			name: patientData.nurseSignOffName,
		});
	}
	return null;
}

function Question(answer: SerializedQuestion) {
	// if (answer.value === undefined) return null;

	return jsx(View, {
		style: compact([styles.field, answer.style === 'singleLine' && styles.singleLineField]),
		wrap: false,
		children: [
			jsx(Text, {
				key: 'label',
				style: styles.fieldLabel,
				children: answer.label,
			}),
			jsx(Text, {
				key: 'value',
				style: styles.fieldValue,
				children: answer.value,
			}),
			...(answer.note
				? [
						jsx(Text, {
							key: 'note',
							style: styles.fieldNote,
							children: answer.note,
						}),
					]
				: []),
		],
	});
}

function Component(node: SerializedComponent) {
	if (node.type === 'signature') {
		return jsx(Signature, { label: node.label, name: node.name });
	}

	if (node.type === 'note') {
		return jsx(Text, { style: styles.note, children: node.label });
	}

	console.error('unknown component type:', node);
	return null;
}

function Node(node: Exclude<SerializedNode, SerializedGroup>) {
	if (!node) return null;

	if (isSerializedComponent(node)) {
		return jsx(Component, node);
	}

	return jsx(Question, node);
}

function Group({ label, children, depth = 0 }: SerializedGroup & { depth?: number }) {
	const headerStyle = styles[`groupHeader_${depth}` as keyof typeof styles] ?? styles.groupHeader_2;

	return jsx(View, {
		style: styles.group,
		wrap: depth < 5,
		children: [
			jsx(Text, {
				key: 'group-header',
				style: headerStyle,
				children: label,
			}),
			jsx(View, {
				key: 'group-content',
				style: styles.groupContent,
				children: children.map((child) => {
					if (!child) return null;
					if ('children' in child) {
						return jsx(Group, { key: child.label, ...child, depth: depth + 1 });
					}
					return jsx(Node, { key: child.label, ...child });
				}),
			}),
		],
	});
}
