import Document, { Head, Html, Main, NextScript } from 'next/document';
import theme, { poppins } from 'src/styles/theme';

export default class MyDocument extends Document {
	render() {
		return (
			<Html lang="en">
				<Head>
					<link rel="manifest" href="/manifest.json" />
					<meta name="theme-color" content={theme.palette.primary.main} />
					<link rel="shortcut icon" href="/favicon.ico" />
				</Head>
				<body className={poppins.className}>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}
