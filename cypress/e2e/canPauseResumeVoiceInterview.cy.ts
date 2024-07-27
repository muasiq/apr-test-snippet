import { NurseInterviewPhysicalAssessmentThemes } from '~/assessments/nurse-interview/questions';
import '../support/commands';
import { retryableBefore } from '../support/retryableBefore';

describe('(Nurse APP) - Start / Pause Voice Interview', () => {
	let patient = { firstName: '', lastName: '' };

	retryableBefore(() => {
		void cy.clearIndexDB();
		cy.seedDatabaseAndGetPatient('NewPatient').then((p) => {
			patient = p;
		});
	});

	it('can start & pause voice interview', () => {
		cy.viewport('iphone-8');
		cy.visitHome();
		cy.login('test@apricothealth.ai');
		cy.switchView();
		cy.contains(`${patient.firstName} ${patient.lastName}`).click({ force: true });
		cy.get('[data-cy="soc-interview-start-button"]').click();

		// ---- SLIDER QUESTIONS ----
		cy.contains('Update date and time of visit, if needed.').should('be.visible');
		cy.get('[data-cy="soc-interview-next-button"]').click();

		// ---- SLIDER QUESTIONS ----
		cy.contains('About how many minutes did you spend with the patient?').should('be.visible');
		cy.get('[data-cy="slider-value"]').should('contain', '60');
		cy.get('[data-cy="soc-interview-next-button"]').click();

		cy.contains("About how many minutes did you spend driving to and from the patient's home?").should(
			'be.visible',
		);
		cy.get('[data-cy="slider-value"]').should('contain', '60');
		cy.get('[data-cy="soc-interview-next-button"]').click();

		cy.contains('About how many miles (roundtrip) did you travel to see the patient?').should('be.visible');
		cy.get('[data-cy="slider-value"]').should('contain', '50');
		cy.get('[data-cy="soc-interview-next-button"]').click();
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

		cy.contains('Upload photos of all documents created or collected during the visit.').should('be.visible');
		cy.get('[data-cy="soc-interview-next-button"]').click();

		// ---- END PHOTO UPLOAD QUESTIONS ----

		// ---- AREAS TO REPORT ON QUESTIONS ----
		cy.contains('What would you like to report on?').should('be.visible');
		cy.wait(300);
		cy.get(`[data-cy="${NurseInterviewPhysicalAssessmentThemes.Skin}"]`).click();
		cy.get('[data-cy="soc-interview-next-button"]').click();
		// ---- END AREAS TO REPORT ON QUESTIONS ----

		// ---- MAIN INTERVIEW ----
		cy.intercept('POST', '/api/trpc/interviewQuestion.saveInterviewQuestion?batch=1').as('saveInterviewQuestion');
		cy.contains('baseline information').should('be.visible');
		cy.get('[data-cy="soc-interview-next-button"]').click();

		// ---- CLOSE INTERVIEW ----
		cy.get('[data-cy="patient-drawer-close-btn"]').click();
		cy.wait(3000);

		cy.logout();

		// can login & resume
		cy.visitHome();
		cy.loginWithoutVerification('test@apricothealth.ai');
		cy.switchView();
		cy.contains(`${patient.firstName} ${patient.lastName}`).click({ force: true });
		cy.startInterview();

		cy.contains('baseline information').should('be.visible');
		cy.contains('Voice Mode').should('be.visible');
		cy.interviewNext();

		cy.contains('Share details about your recent patient visit.').should('be.visible');
		cy.recordAudio();
		cy.get('[data-cy="soc-interview-next-audio-question-button"]').click();

		cy.closeRecentAudioRecordingWarning();
		cy.contains("Describe the patient's vital signs.").should('be.visible');

		cy.get('[data-cy="patient-drawer-close-btn"]').click();

		// can resume voice interview
		cy.visit('/');
		cy.switchView();
		cy.contains(`${patient.firstName} ${patient.lastName}`).click({ force: true });
		cy.get('[data-cy="soc-interview-start-button"]').click();
		cy.contains("Let's pick up where you left off.").should('be.visible');
		cy.contains('How would you like to answer?').should('be.visible');

		cy.interviewNext();

		cy.contains("Describe the patient's vital signs.").should('be.visible');
		cy.recordAudio();
		cy.waitForButtonToEnable('[data-cy="mic-button"]');
		cy.get('[data-cy="soc-interview-next-audio-question-button"]').click();

		cy.contains("Describe the patient's living situation.").should('be.visible');
		cy.get('[data-cy="patient-drawer-close-btn"]').click();

		// can resume voice interview with text
		cy.visit('/');
		cy.switchView();
		cy.contains(`${patient.firstName} ${patient.lastName}`).click({ force: true });
		cy.get('[data-cy="soc-interview-start-button"]').click();
		cy.get('[data-cy="soc-interview-answer-mode"]').click({ force: true });
		cy.get('[data-cy="soc-interview-answer-mode-text"]').click();
		cy.contains('Text Mode').should('be.visible');
		cy.get('[data-cy="soc-interview-next-button"]').click();

		cy.contains("Describe the patient's living situation.").should('be.visible');
		cy.get('[data-cy="text-question-textfield"]').scrollIntoView().type('test');
		cy.interviewNext();

		cy.contains('Does the patient receive any care, services or assistance outside of home health care?').should(
			'be.visible',
		);
		cy.get('[data-cy="text-question-textfield"]').scrollIntoView().type('Care input test');
		cy.interviewNext();

		cy.contains("Describe the patient's health history.").scrollIntoView().should('be.visible');

		// ---- CLOSE INTERVIEW ----
		cy.get('[data-cy="patient-drawer-close-btn"]').click();

		cy.reload();

		// can login & resume the nurse interview
		cy.visit('/');
		cy.switchView();
		cy.contains(`${patient.firstName} ${patient.lastName}`).click({ force: true });
		cy.get('[data-cy="soc-interview-start-button"]').click();
		cy.get('[data-cy="soc-interview-answer-mode"]').click({ force: true });
		cy.get('[data-cy="soc-interview-answer-mode-voice"]').click();
		cy.contains('Voice Mode').should('be.visible');

		cy.interviewNext();

		cy.contains("Describe the patient's health history.").should('be.visible');
		cy.recordAudio();
		cy.get('[data-cy="soc-interview-next-audio-question-button"]').click();

		cy.contains("Describe the patient's functional history.").should('be.visible');
		cy.waitForButtonToEnable('[data-cy="mic-button"]');
	});
});
