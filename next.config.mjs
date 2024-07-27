import { withSentryConfig } from '@sentry/nextjs';
import nextPWA from 'next-pwa';
import { runtimeCache } from './cache.mjs';
import packageJson from './package.json' assert { type: 'json' };

const FIVE_MB = 1024 * 1024 * 5;

const withPWA = nextPWA({
	dest: 'public',
	register: true,
	skipWaiting: true,
	disable: process.env.NODE_ENV === 'development',
	cacheOnFrontEndNav: true,
	maximumFileSizeToCacheInBytes: FIVE_MB,
	runtimeCaching: runtimeCache,
});

// Ensure this is inside an async function if it's not already
await import('./src/env.mjs');

/** @type {import("next").NextConfig} */
const config = {
	webpack: (config) => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		config.resolve.alias.canvas = false;
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return config;
	},
	reactStrictMode: true,
	swcMinify: true,
	output: 'standalone',
	i18n: {
		locales: ['en'],
		defaultLocale: 'en',
	},
	transpilePackages: ['@mui/x-charts'],
	images: {
		domains: ['storage.googleapis.com', 'localhost'],
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
	// eslint-disable-next-line @typescript-eslint/require-await
	async headers() {
		return [
			{
				source: '/(.*)',
				headers: [
					{
						key: 'App-Version',
						value: packageJson.version,
					},
				],
			},
		];
	},
	experimental: {
		instrumentationHook: true,
	},
};

export default withSentryConfig(withPWA(config), {
	// For all available options, see:
	// https://github.com/getsentry/sentry-webpack-plugin#options

	// Suppresses source map uploading logs during build
	silent: false,
	org: 'apricot-health-ai',
	project: 'apricot',
	authToken: process.env.SENTRY_AUTH_TOKEN,

	// For all available options, see:
	// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

	// Upload a larger set of source maps for prettier stack traces (increases build time)
	widenClientFileUpload: true,

	// Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
	tunnelRoute: '/monitoring',

	// Hides source maps from generated client bundles
	hideSourceMaps: true,

	// Automatically tree-shake Sentry logger statements to reduce bundle size
	disableLogger: true,
});
