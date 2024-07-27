import { Text, View } from '@react-pdf/renderer';
import { jsx } from 'react/jsx-runtime';
import { styles } from '../styles';

export function Signature({ label, name }: { label: string; name: string }) {
	return jsx(View, {
		style: styles.signatureContainer,
		wrap: false,
		children: [
			jsx(Text, {
				style: styles.signatureLabel,
				key: 'label',
				children: label,
			}),
			jsx(Text, {
				style: styles.signature,
				key: 'signature',
				children: name,
			}),
		],
	});
}
