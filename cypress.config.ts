import { defineConfig } from 'cypress';
import plugin from 'cypress-fail-fast/plugin';
import 'dotenv/config';

export default defineConfig({
	projectId: 'aerraz',
	video: true,
	retries: { runMode: 2, openMode: 0 },
	defaultCommandTimeout: 15000,
	blockHosts: ['*mixpanel.com', 'api-js.mixpanel.com'],

	e2e: {
		baseUrl: 'http://localhost:3000',
		env: process.env,
		setupNodeEvents(on, config) {
			// eslint-disable-next-line
			require('cypress-terminal-report/src/installLogsPrinter')(on);

			on('before:browser:launch', (browser, launchOptions) => {
				launchOptions.args.push('--no-sandbox');
				launchOptions.args.push('--allow-file-access-from-files');
				launchOptions.args.push('--use-fake-ui-for-media-stream');
				launchOptions.args.push('--use-fake-device-for-media-stream');
				launchOptions.args.push('--use-file-for-fake-audio-capture=cypress/fixtures/audio.wav');
				return launchOptions;
			});
			plugin(on, config);
			config.env = {
				...config.env,
				...process.env,
			};
			return config;
		},
	},

	component: {
		devServer: {
			framework: 'next',
			bundler: 'webpack',
		},
		supportFile: 'cypress/support/component.tsx',
	},
});
