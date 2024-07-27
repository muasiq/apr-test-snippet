import { NurseInterviewPhysicalAssessmentThemes } from '~/assessments/nurse-interview/questions';
import '../support/commands';
import { retryableBefore } from '../support/retryableBefore';

// https://github.com/cypress-io/cypress-example-recipes/blob/master/examples/server-communication__offline/cypress/e2e/offline-spec.cy.js
const assertOnline = () => {
	return cy.wrap(window).its('navigator.onLine').should('be.true');
};

const assertOffline = () => {
	return cy.wrap(window).its('navigator.onLine').should('be.false');
};

const goOffline = () => {
	cy.log('**go offline**')
		.then(() => {
			return Cypress.automation('remote:debugger:protocol', {
				command: 'Network.enable',
			});
		})
		.then(() => {
			return Cypress.automation('remote:debugger:protocol', {
				command: 'Network.emulateNetworkConditions',
				params: {
					offline: true,
					latency: -1,
					downloadThroughput: -1,
					uploadThroughput: -1,
				},
			});
		});
};

const goOnline = () => {
	// disable offline mode, otherwise we will break our tests :)
	cy.log('**go online**').then(() => {
		// https://chromedevtools.github.io/devtools-protocol/1-3/Network/#method-emulateNetworkConditions
		return Cypress.automation('remote:debugger:protocol', {
			command: 'Network.emulateNetworkConditions',
			params: {
				offline: false,
				latency: -1,
				downloadThroughput: -1,
				uploadThroughput: -1,
			},
		});
	});
};

describe('Nurse App - Nurse Interview offline mode', { browser: '!firefox' }, () => {
	let patient = { firstName: '', lastName: '' };

	retryableBefore(() => {
		void cy.clearIndexDB();
		cy.seedDatabaseAndGetPatient('NewPatient').then((p) => {
			patient = p;
		});
		cy.viewport('iphone-8');
	});

	beforeEach(goOnline);
	afterEach(goOnline);

	it('can complete nurse interview in offline mode', () => {
		cy.visitHome();
		cy.login('test@apricothealth.ai');
		cy.switchView();
		cy.contains(`${patient.firstName} ${patient.lastName}`).click({ force: true });
		cy.get('[data-cy="soc-interview-start-button"]').click();

		goOffline();
		assertOffline();

		// ---- SLIDER QUESTIONS ----
		const visitTimePageHeaderText = 'Update date and time of visit, if needed.';
		cy.contains(visitTimePageHeaderText).should('be.visible');
		cy.interviewNext();

		// ---- SLIDER QUESTIONS ----
		cy.contains('About how many minutes did you spend with the patient?').should('be.visible');
		cy.get('[data-cy="slider-value"]').should('contain', '60');
		cy.interviewNext();

		cy.contains("About how many minutes did you spend driving to and from the patient's home?").should(
			'be.visible',
		);
		cy.get('[data-cy="slider-value"]').should('contain', '60');
		cy.interviewNext();

		cy.contains('About how many miles (roundtrip) did you travel to see the patient?').should('be.visible');
		cy.get('[data-cy="slider-value"]').should('contain', '50');
		cy.interviewNext();

		// ---- END SLIDER QUESTIONS ----

		// ---- PHOTO UPLOAD QUESTIONS ----
		cy.contains('Provide a medication list').should('be.visible');
		cy.get('[data-cy="medication-upload-speed-dial"]').click({ force: true });
		cy.get('[data-cy="speed-dial-new-file"]').click();
		const fileName = 'cat.jpg';
		cy.get('input[type="file"]').attachFile(fileName);

		cy.contains('Upload wound photos from your visit').should('be.visible');
		cy.get('input[type="file"]').attachFile(fileName);
		cy.get('[data-cy="soc-interview-next-button"]').click();

		// for some reason when offline the animation files all download here and the test fails
		cy.contains('Upload photos of all documents created or collected during the visit.', { timeout: 20000 }).should(
			'be.visible',
		);
		cy.get('[data-cy="soc-interview-next-button"]').click();

		// ---- END PHOTO UPLOAD QUESTIONS ----

		// ---- AREAS TO REPORT ON QUESTIONS ----
		cy.contains('What would you like to report on?', { timeout: 20000 }).should('be.visible');
		cy.wait(300);
		cy.get(`[data-cy="${NurseInterviewPhysicalAssessmentThemes.Nutrition}"]`).click();
		cy.get('[data-cy="soc-interview-next-button"]').click();
		// ---- END AREAS TO REPORT ON QUESTIONS ----

		// ---- MAIN INTERVIEW ----
		cy.intercept('POST', '/api/trpc/interviewQuestion.saveInterviewQuestion?batch=1').as('saveInterviewQuestion');
		cy.contains('baseline information').should('be.visible');
		cy.interviewNext();

		cy.contains('Share details about your recent patient visit.').should('be.visible');
		cy.recordAudio1();

		cy.contains("Describe the patient's vital signs.").should('be.visible');
		cy.recordAudio1();

		cy.contains("Describe the patient's living situation.").should('be.visible');
		cy.recordAudio1();

		cy.contains('Does the patient receive any care, services or assistance outside of home health care?').should(
			'be.visible',
		);
		cy.recordAudio1();

		cy.contains("Describe the patient's health history.").should('be.visible');
		cy.recordAudio1();

		cy.contains("Describe the patient's functional history.").should('be.visible');
		cy.recordAudio1();

		cy.contains("Describe the patient's mobility and ability to safely move around or leave their home.").should(
			'be.visible',
		);
		cy.recordAudio1();

		cy.contains("Describe the patient's risk for pressure ulcers.").should('be.visible');
		cy.recordAudio1();

		cy.contains("Describe the patient's ability to safely handle activities of daily living.").should('be.visible');
		cy.recordAudio1();

		cy.contains("Describe the patient's ability to prepare and take their medications reliably and safely.").should(
			'be.visible',
		);
		cy.recordAudio1();

		cy.contains("Describe the patient's active diagnoses").should('be.visible');
		cy.recordAudio1();

		cy.contains('Describe your plan of care for this patient.').should('be.visible');
		cy.recordAudio1();

		cy.contains('Describe the interventions needed by the patient.').should('be.visible');
		cy.recordAudio1();

		cy.contains('Describe the goals and discharge plan for this patient.').should('be.visible');

		// TODO: interview workflow does not proceed to next part w/o internet
		goOnline();
		assertOnline();

		cy.wait(1000);

		cy.recordAudio1();

		// ---- END AREAS TO REPORT ON QUESTIONS ----

		// ---- WITHIN NORMAL LIMITS ----
		cy.closeRecentAudioRecordingWarning();
		cy.contains('The following reports will be marked as "within normal limits".').should('be.visible');
		cy.get('[data-cy="soc-interview-i-understand-button"]').click();
		// ---- END WITHIN NORMAL LIMITS ----

		// ---- REVIEW PROMPT ----
		cy.contains('Almost done! We have a few more things to sync before you can review.').should('be.visible');
		cy.contains('Finish Later').should('be.visible');

		cy.waitForButtonToEnable('[data-cy="soc-interview-review-now-button"]', 180000).click();
		// ---- END REVIEW PROMPT ----

		// ---- REVIEW QUESTIONS ----
		cy.contains('Almost done!').should('be.visible');

		// submit review
		cy.get('[data-cy="soc-interview-send-to-qa-button"]').click();
		cy.contains('On it').should('be.visible');
		// ---- END REVIEW QUESTIONS ----
	});
});
