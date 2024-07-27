// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

const environment = process.env.APRICOT_ENV ?? 'development';
const isProduction = ['production', 'staging'].includes(environment);

Sentry.init({
	dsn: 'https://57abdf9281492242c4b613125572f08a@o4506955244699648.ingest.us.sentry.io/4506408099971072',
	enabled: isProduction,
	environment,

	// Adjust this value in production, or use tracesSampler for greater control
	tracesSampleRate: 1,

	// Setting this option to true will print useful information to the console while you're setting up Sentry.
	debug: false,

	integrations: [
		Sentry.requestDataIntegration({
			include: {
				headers: true,
			},
		}),
	],

	normalizeDepth: 10,

	// Uncomment the line below to enable Spotlight (https://spotlightjs.com)
	// spotlight: process.env.NODE_ENV === 'development',
});
