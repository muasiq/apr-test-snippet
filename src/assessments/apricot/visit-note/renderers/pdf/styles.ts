import { Font, StyleSheet } from '@react-pdf/renderer';

// https://fonts.cdnfonts.com/css/inter
Font.register({
	family: 'Inter',
	fonts: [
		{ src: 'https://fonts.cdnfonts.com/s/19795/Inter-Regular.woff', fontWeight: 400 },
		{ src: 'https://fonts.cdnfonts.com/s/19795/Inter-SemiBold.woff', fontWeight: 500 },
		{ src: 'https://fonts.cdnfonts.com/s/19795/Inter-Bold.woff', fontWeight: 700 },
	],
});

Font.register({ family: 'Kalam', src: 'https://fonts.cdnfonts.com/s/13130/Kalam-Regular.woff' });

const colors = {
	text: '#6F3A51',
	textDark: '#3B1F2A',
	textLight: '#877681',
	blue: '#8D97E3',
	red: '#FE6477',
	grey: {
		100: '#FAFBFF',
		200: '#E9EBFA',
	},
};

// A4 dimensions
const width = 595.28;
// const height = 841.89;

// https://github.com/diegomura/react-pdf/issues/1439
const FOOTER_SIZE = 80;

// percent width with gap not working correctly, use fixed numbers
const bodyHorizontalPadding = 35;
const bodyWidth = width - bodyHorizontalPadding * 2;
const fieldGap = 10;
const fieldWidth = bodyWidth / 2 - fieldGap / 2;

export const styles = StyleSheet.create({
	page: {
		paddingBottom: FOOTER_SIZE,
	},
	main: {
		flex: '1 1',
	},
	header: {
		flexShrink: 0,
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		fontSize: 8,
		color: colors.text,
		backgroundColor: colors.grey['100'],
		width: '100%',
		padding: 20,
		marginBottom: 20,
		borderBottom: `1px solid ${colors.grey['200']}`,
	},
	headerText: {
		lineHeight: 1.2,
	},
	footer: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		width: '100%',
		backgroundColor: colors.grey['100'],
		borderTop: `1px solid ${colors.grey['200']}`,
		padding: 20,
		fontSize: 8,
		color: colors.text,
		marginBottom: -FOOTER_SIZE,
		flexShrink: 0,
	},
	body: {
		paddingHorizontal: bodyHorizontalPadding,
		fontSize: 10,
		color: colors.text,
		fontWeight: 400,
		fontFamily: 'Inter',
		flex: '1 1',
		display: 'flex',
		flexDirection: 'column',
		rowGap: 24,
	},
	group: {
		width: '100%',
	},
	groupContent: {
		display: 'flex',
		flexDirection: 'row',
		flexWrap: 'wrap',
		columnGap: fieldGap,
		rowGap: 8,
		marginBottom: 8,
	},
	groupHeader_0: {
		color: colors.blue,
		marginBottom: 14,
		fontSize: 12,
	},
	groupHeader_1: {
		color: colors.textDark,
		fontSize: 10,
		marginBottom: 8,
		fontWeight: 700,
		textTransform: 'uppercase',
	},
	groupHeader_2: {
		color: colors.textLight,
		fontSize: 10,
		marginBottom: 8,
		fontWeight: 700,
	},
	field: {
		flexGrow: 0,
		flexShrink: 0,
		flexBasis: fieldWidth,
	},
	singleLineField: {
		display: 'flex',
		flexDirection: 'row',
		flexWrap: 'wrap',
		columnGap: 4,
	},
	fieldLabel: {
		marginBottom: 4,
		color: colors.textDark,
		fontWeight: 500,
	},
	fieldValue: {},
	fieldNote: {
		marginBottom: 4,
		marginTop: 4,
		color: colors.textLight,
		fontSize: 8,
		fontWeight: 400,
	},
	pill: {
		backgroundColor: colors.red,
		color: 'white',
		borderRadius: 15,
		paddingVertical: 6,
		paddingHorizontal: 12,
	},
	signatureContainer: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'flex-start',
	},
	signatureLabel: {
		fontFamily: 'Inter',
		fontSize: 10,
		marginBottom: 4,
		color: colors.textDark,
	},
	signature: {
		fontFamily: 'Kalam',
		fontSize: 12,
		lineHeight: 0.8,
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 4,
		border: `1px solid ${colors.grey['200']}`,
	},
	note: {
		marginBottom: 4,
		color: colors.textDark,
		fontWeight: 500,
	},
});
