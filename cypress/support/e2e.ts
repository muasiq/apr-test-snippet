// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import 'cypress-fail-fast';
import 'dotenv/config';
import './commands';

// eslint-disable-next-line
require('cypress-terminal-report/src/installLogsCollector')();

// Alternatively you can use CommonJS syntax:
// require('./commands')

// beforeunload can cause cypress to hang as it never receives the load event
// https://github.com/cypress-io/cypress/issues/2938#issuecomment-549565158
Cypress.on('window:before:load', function (window) {
	// eslint-disable-next-line @typescript-eslint/unbound-method
	const original = window.EventTarget.prototype.addEventListener;

	window.EventTarget.prototype.addEventListener = function (...args: Parameters<typeof original>) {
		if (args && args[0] === 'beforeunload') {
			return;
		}
		return original.apply(this, args);
	};

	Object.defineProperty(window, 'onbeforeunload', {
		get: function () {}, // eslint-disable-line @typescript-eslint/no-empty-function
		set: function () {}, // eslint-disable-line @typescript-eslint/no-empty-function
	});
});
