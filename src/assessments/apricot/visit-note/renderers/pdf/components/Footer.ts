import { Text, View } from '@react-pdf/renderer';
import { jsx } from 'react/jsx-runtime';
import { styles } from '../styles';
import { ApricotLogo } from './ApricotLogo';

export function Footer() {
	return jsx(View, {
		style: styles.footer,
		fixed: true,
		children: [
			jsx(ApricotLogo, { key: 'logo', height: 16 }),
			jsx(Text, {
				key: 'page-number',
				render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
					`${pageNumber} of ${totalPages}`,
			}),
		],
	});
}
