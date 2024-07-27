import { ConfigurationType, PatientStatus } from '@prisma/client';
import 'cypress-file-upload';
import { startCase } from 'lodash';
import { CreatePatientInput } from '~/server/api/routers/patient/patient.inputs';
import { seedPassword } from '../../prisma/util';
import { formatDate } from './command.utils';

export type SeededPatient = {
	id: string;
	firstName: string;
	lastName: string;
	status: PatientStatus;
	configurationType: ConfigurationType;
};
type SelectOpts = { force?: boolean; multiSelect?: boolean };

type EnumObject = Record<string, string | number>;
Cypress.Commands.add('visitHome', () => {
	cy.visit('/');
	cy.contains('Get Started');
});

Cypress.Commands.add('login', (email) => {
	cy.intercept('GET', '/api/auth/session').as('signIn');
	cy.intercept('POST', '/api/trpc/user.verifyNewDevice?batch=1').as('verifyNewDevice');
	cy.get('[data-cy="email-input"]').type(email);
	cy.get('[data-cy="sign-in-button"]').click();
	cy.get('[data-cy="password-input"]').type(seedPassword);
	cy.get('[data-cy="sign-in-button"]').click();
	cy.contains('Check your email').should('be.visible');
	cy.get('[data-cy="verification-code-input"]').type('123456');
	cy.get('[data-cy="verify-device-button"]').click();
	cy.wait('@verifyNewDevice', { timeout: 10000 });
	cy.wait('@signIn', { timeout: 10000 });
	cy.url().should('not.include', 'auth/signin');
});

Cypress.Commands.add('loginWithoutVerification', (email) => {
	cy.intercept('GET', '/api/auth/session').as('signIn');
	cy.intercept('POST', '/api/trpc/user.verifyNewDevice?batch=1').as('verifyNewDevice');
	cy.get('[data-cy="email-input"]').type(email);
	cy.get('[data-cy="sign-in-button"]').click();
	cy.get('[data-cy="password-input"]').type(seedPassword);
	cy.get('[data-cy="sign-in-button"]').click();
	cy.wait('@signIn', { timeout: 10000 });
	cy.url().should('not.include', 'auth/signin');
});

Cypress.Commands.add('logout', () => {
	cy.visit('/');
	cy.get('[data-cy="initials-button"]').click();
	cy.get('[data-cy="profile-button"]').click();
	cy.get('[data-cy="sign-out-button"]').click();
	cy.contains('Get Started', { timeout: 10000 }).should('be.visible');
});

// clicks the data-cy="initials-button" to switch to office view
Cypress.Commands.add('switchView', () => {
	cy.get('[data-cy="initials-button"]').click();
	cy.get('[data-cy="switch-view-button"]').click();
	cy.contains('Get Started', { timeout: 10000 }).should('be.visible');
});

Cypress.Commands.add('chooseRandomSelectOption', (name: string, enumObject: EnumObject) => {
	const options = Object.values(enumObject);
	cy.contains('div', name)
		.click()
		.get('ul')
		.children()
		.eq(Math.floor(Math.random() * options.length))
		.click();
});
Cypress.Commands.add('clickOutside', () => {
	cy.get('body').click(0, 0);
});
Cypress.Commands.add('chooseFirstSelectElement', (selectName: string, { multiSelect = false }: SelectOpts = {}) => {
	cy.get(selectName).click().get('ul[role="listbox"]').children().first().click();

	if (multiSelect) {
		cy.clickOutside();
	}
});

Cypress.Commands.add(
	'chooseSelectElement',
	(selectName: string, item: string, { multiSelect = false, force = false }: SelectOpts = {}) => {
		cy.get(selectName).click().get('ul[role="listbox"]').children().contains(item).click({ force });

		if (multiSelect) {
			cy.clickOutside();
		}
	},
);

Cypress.Commands.add('recordAudio1', () => {
	cy.wait(1000);
	cy.get('[data-cy="mic-button"]').click(); // Start recording
	cy.wait(1000);
	cy.waitForButtonToEnable('[data-cy="mic-button"]');
	cy.get('[data-cy="mic-button"]').click(); // Pause recording
	cy.get('[data-cy="soc-interview-next-audio-question-button"]').click(); // Next question
});

Cypress.Commands.add('recordAudioLong', () => {
	cy.wait(1000);
	cy.get('[data-cy="mic-button"]').click(); // Start recording
	cy.wait(11000);
	cy.waitForButtonToEnable('[data-cy="mic-button"]');
	cy.get('[data-cy="mic-button"]').click(); // Pause recording
	cy.get('[data-cy="soc-interview-next-audio-question-button"]').click(); // Next question
});

Cypress.Commands.add('waitForButtonToEnable', (selector, timeout = 80000) => {
	const startTime = new Date().getTime();
	const attempt = () => {
		cy.get(selector).then(($button) => {
			if ($button.is(':enabled') || new Date().getTime() - startTime > timeout) {
				void expect($button).to.be.enabled;
			} else {
				cy.wait(1000); // wait for 500 ms
				attempt();
			}
		});
	};
	attempt();
});

Cypress.Commands.add('createNewPatient', (patient) => {
	cy.get('[data-cy="new-patient-button"]').click({ force: true });
	cy.get('[data-cy="emr-id-input"]').type(patient.EMRIdentifier);
	cy.get('[data-cy="patient-first-name-input"]').type(patient.firstName);

	if (patient.middleName) cy.get('[data-cy="patient-middle-name-input"]').type(patient.middleName);
	if (patient.suffix) cy.get('[data-cy="patient-suffix-input"]').type(patient.suffix);

	cy.get('[data-cy="patient-last-name-input"]').type(patient.lastName);
	cy.get('[data-cy="patient-dob-input"]').find('input').type(formatDate(patient.dateOfBirth), { force: true });
	cy.get('[data-cy="soc-visit-date"]').find('input').type(formatDate(patient.SOCVisitDate), { force: true });
	cy.chooseSelectElement('[data-cy="patient-gender-input"]', patient.gender, { force: true });
	cy.get('[data-cy="patient-social-security-input"]')
		.find('input')
		.type(patient.socialSecurityNumber ?? '123456789', { force: true });
	cy.chooseFirstSelectElement('[data-cy="branch-input"]');
	cy.chooseSelectElement('[data-cy="service-location-type"]', startCase(patient.serviceLocationType), {
		force: true,
	});

	cy.get('[data-cy="patient-phone-input"]')
		.find('input')
		.type(patient.phoneNumber ?? '', { force: true });
	cy.get('[data-cy="patient-address"]').find('input').type('1600 Pennsylavania Ave', { force: true });
	cy.chooseFirstSelectElement('[data-cy="patient-address-input"]');
	cy.get('[data-cy="soc-date-unknown-checkbox"]').find('input').check({ force: true });
	cy.chooseFirstSelectElement('[data-cy="m0150-answer"]', { multiSelect: true });

	const [provider] = patient.PatientAssociatedPhysicians ?? [];

	if (provider) {
		cy.chooseFirstSelectElement('[data-cy="provider-fullname-input"]');
		cy.get('[data-cy="provider-phone-input"]')
			.find('input')
			.type(provider.phone ?? '', { force: true });
		cy.chooseFirstSelectElement('[data-cy="provider-type-input"]');
		cy.chooseFirstSelectElement('[data-cy="provider-referring-physician-input"]');
	}

	[0, 1].forEach((index) => {
		if (index === 1) {
			cy.contains('Add Diagnosis').click();
		}
		cy.get(`[data-cy="diagnosis-code-${index}"]`).type('A');
		cy.chooseFirstSelectElement(`[data-cy="diagnosis-code-${index}"]`);
		cy.chooseFirstSelectElement(`[data-cy=symptom-control-rating-${index}]`);
		cy.chooseFirstSelectElement(`[data-cy="onset-or-exacerbation-${index}"]`);
		cy.get(`[data-cy="date-of-onset-or-exacerbation-${index}"]`).type('2024-05-24');
	});

	cy.get('[data-cy="add-new-patient-button"]').click({ force: true });
});

Cypress.Commands.add('clickManyOfEnum', <T extends Record<string, string>>(enumObject: T) => {
	const options: string[] = Object.values(enumObject);

	const numberOfOptionsToSelect: number = Math.floor(Math.random() * options.length) + 1;

	const shuffledOptions: string[] = options.sort(() => 0.5 - Math.random());
	const selectedOptions: string[] = shuffledOptions.slice(0, numberOfOptionsToSelect);

	selectedOptions.forEach((option: string) => {
		cy.get(`[data-cy="${option}"]`).click(); // Enclose the value in quotes
	});
});

Cypress.Commands.add('seedDatabaseAndGetPatient', (status: PatientStatus, configurationType?: ConfigurationType) => {
	return cy.exec('npm run db:seed').then((res) => {
		const lookup = 'seeded-patients';
		const startIndex = res.stdout.indexOf(lookup);
		const endLookup = '"}]';
		const endIndex = res.stdout.indexOf(endLookup);
		const parsed = JSON.parse(
			res.stdout.substring(startIndex + lookup.length, endIndex + endLookup.length),
		) as SeededPatient[];
		const patient = parsed.find((p) => {
			if (configurationType) {
				return p.status === status && p.configurationType === configurationType;
			}
			return p.status === status;
		});
		if (patient) {
			return cy.wrap(patient);
		} else {
			throw new Error(`No patient found with status ${status} in seed output.`);
		}
	});
});

Cypress.Commands.add('clearIndexDB', async () => {
	console.log('clearing indexdb');
	const databases = await window.indexedDB.databases();

	await Promise.all(
		databases.map(({ name }) => {
			console.log('deleting indexdb', name);
			return new Promise((resolve, reject) => {
				if (!name) {
					resolve(null);
					return;
				}
				const request = window.indexedDB.deleteDatabase(name);

				request.addEventListener('success', resolve);
				// Note: we need to also listen to the "blocked" event
				// (and resolve the promise) due to https://stackoverflow.com/a/35141818
				request.addEventListener('blocked', resolve);
				request.addEventListener('error', reject);
			});
		}),
	);
});

Cypress.Commands.addAll({
	triggerEscape: () => {
		cy.get('body').trigger('keydown', { keyCode: 27 });
		cy.wait(500);
		cy.get('body').trigger('keyup', { keyCode: 27 });
	},
	startInterview: () => {
		cy.get('[data-cy="soc-interview-start-button"]').click();
	},
	interviewNext: ({ force }: { force: boolean } = { force: false }) => {
		cy.get('[data-cy="soc-interview-next-button"]').click({ force });
	},
	audioNext: () => {
		cy.get('[data-cy="soc-interview-next-audio-question-button"]').click();
		cy.wait('@saveInterviewQuestion', { timeout: 10000 });
	},
	interviewBack: () => {
		cy.get('[data-cy="soc-interview-back-button"]').click();
	},
	complete: () => {
		cy.get('[data-cy="soc-interview-complete-button"]').click();
	},
	recordAudio: () => {
		cy.wait(1000);
		cy.get('[data-cy="mic-button"]').click(); // Start recording
		cy.wait(1000);
		cy.waitForButtonToEnable('[data-cy="mic-button"]');
		cy.get('[data-cy="mic-button"]').click(); // Pause recording
	},
	selectCheckbox: () => {
		cy.get('[data-cy="checkbox"]').click();
	},
	uploadPhoto: () => {
		cy.get('[data-cy="medication-upload-speed-dial"]').click({ force: true });
		cy.get('[data-cy="speed-dial-new-file"]').click();
		const fileName = 'cat.jpg';
		cy.get('input[type="file"]').attachFile(fileName);
	},
	uploadDocument: () => {
		cy.get('[data-cy="medication-upload-speed-dial"]').click({ force: true });
		cy.get('[data-cy="speed-dial-new-file"]').click();
		const fileName = 'cat.jpg';
		cy.get('input[type="file"]').attachFile(fileName);
	},
	uploadWoundPhoto: () => {
		cy.get('[data-cy="medication-upload-speed-dial"]').click({ force: true });
		cy.get('[data-cy="speed-dial-new-file"]').click();
		const fileName = 'cat.jpg';
		cy.get('input[type="file"]').attachFile(fileName);
	},
	uploadAudio: () => {
		cy.recordAudio1();
	},
	uploadVideo: () => {
		cy.get('[data-cy="medication-upload-speed-dial"]').click({ force: true });
		cy.get('[data-cy="speed-dial-new-file"]').click();
		const fileName = 'cat.jpg';
		cy.get('input[type="file"]').attachFile(fileName);
	},
	uploadSignature: () => {
		cy.get('[data-cy="medication-upload-speed-dial"]').click({ force: true });
		cy.get('[data-cy="speed-dial-new-file"]').click();
		const fileName = 'cat.jpg';
		cy.get('input[type="file"]').attachFile(fileName);
	},
	selectOption: (option: string) => {
		cy.get(`[data-cy="${option}"]`).click();
	},
	closeRecentAudioRecordingWarning: () => {
		cy.contains('Recent Audio Recording Warning').should('be.visible');
		return cy.get('button[title="Close"]').click();
	},
});

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
	namespace Cypress {
		interface Chainable {
			visitHome(): Chainable<Element>;
			login(email: string): Chainable<Element>;
			loginWithoutVerification(email: string): Chainable<Element>;
			logout(): Chainable<Element>;
			switchView(): Chainable<Element>;
			chooseRandomSelectOption(name: string, enumObject: EnumObject): Chainable<Element>;
			chooseFirstSelectElement(selectName: string, opts?: SelectOpts): Chainable<Element>;
			chooseSelectElement(selectName: string, item: string, opts?: SelectOpts): Chainable<Element>;
			clickManyOfEnum<T extends Record<string, string>>(enumObject: T): Chainable<Element>;
			recordAudio1(): Chainable<Element>;
			recordAudioLong(): Chainable<Element>;
			createNewPatient(patient: CreatePatientInput): Chainable<Element>;
			waitForButtonToEnable(selector: string, timeout?: number): Chainable<Element>;
			seedDatabaseAndGetPatient(
				status: PatientStatus,
				configurationType?: ConfigurationType,
			): Chainable<SeededPatient>;
			clearIndexDB(): Promise<void>;
			clickOutside(): Chainable<Element>;
			startInterview(): Chainable<Element>;
			interviewNext({ force }?: { force?: boolean }): Chainable<Element>;
			interviewBack(): Chainable<Element>;
			audioNext(): Chainable<Element>;
			recordAudio(): Chainable<Element>;
			complete(): Chainable<Element>;
			uploadPhoto(): Chainable<Element>;
			uploadDocument(): Chainable<Element>;
			uploadWoundPhoto(): Chainable<Element>;
			uploadAudio(): Chainable<Element>;
			uploadVideo(): Chainable<Element>;
			uploadSignature(): Chainable<Element>;
			selectOption(option: string): Chainable<Element>;
			selectSliderValue(value: number): Chainable<Element>;
			selectDate(date: Date): Chainable<Element>;
			selectTime(time: string): Chainable<Element>;
			selectDateTime(dateTime: Date): Chainable<Element>;
			selectCheckbox(): Chainable<Element>;
			selectRadio(): Chainable<Element>;
			selectMultiSelectOption(option: string): Chainable<Element>;
			selectMultiSelectOptions(options: string[]): Chainable<Element>;
			selectMultiSelectAll(): Chainable<Element>;
			triggerEscape(): Chainable<Element>;
			goOffline: () => void;
			goOnline: () => void;
			closeRecentAudioRecordingWarning(): Chainable<Element>;
		}
	}
}
