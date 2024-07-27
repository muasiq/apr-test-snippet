import { NurseInterviewPhysicalAssessmentThemes } from '~/assessments/nurse-interview/questions';
import '../support/commands';
import { retryableBefore } from '../support/retryableBefore';

describe('Nurse App) - Nurse Interview fwd / back Navigation', () => {
	let patient = { firstName: '', lastName: '' };
	retryableBefore(() => {
		void cy.clearIndexDB();
		cy.seedDatabaseAndGetPatient('NewPatient').then((p) => {
			patient = p;
		});
	});

	it('can go back & forth nurse interview in voice mode', () => {
		cy.viewport('iphone-8');
		cy.visitHome();
		cy.login('test@apricothealth.ai');
		cy.switchView();
		cy.contains(`${patient.firstName} ${patient.lastName}`).click({ force: true });
		cy.get('[data-cy="soc-interview-start-button"]').click();

		// ---- SLIDER QUESTIONS ----
		const visitTimePageHeaderText = 'Update date and time of visit, if needed.';
		cy.contains(visitTimePageHeaderText).should('be.visible');
		cy.interviewNext();

		// ---- SLIDER QUESTIONS ----
		cy.contains('About how many minutes did you spend with the patient?').should('be.visible');
		cy.get('[data-cy="slider-value"]').should('contain', '60');
		cy.interviewBack();

		cy.contains(visitTimePageHeaderText).should('be.visible');
		cy.interviewNext();
		cy.contains('About how many minutes did you spend with the patient?').should('be.visible');
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
		cy.interviewNext();

		cy.contains('Upload photos of all documents created or collected during the visit.').should('be.visible');
		cy.interviewNext();
		// ---- END PHOTO UPLOAD QUESTIONS ----

		// ---- AREAS TO REPORT ON QUESTIONS ----
		cy.contains('What would you like to report on?').should('be.visible');
		cy.wait(300);
		cy.get(`[data-cy="${NurseInterviewPhysicalAssessmentThemes.IVAccess}"]`).click();
		cy.get('[data-cy="soc-interview-next-button"]').click();

		// ---- END AREAS TO REPORT ON QUESTIONS ----

		// ---- MAIN INTERVIEW ----
		cy.intercept('POST', '/api/trpc/interviewQuestion.saveInterviewQuestion?batch=1').as('saveInterviewQuestion');
		cy.contains('baseline information').should('be.visible');
		cy.get('[data-cy="soc-interview-next-button"]').click();

		cy.contains('Share details about your recent patient visit.').should('be.visible');
		cy.recordAudio1();
		cy.waitForButtonToEnable('[data-cy="mic-button"]');

		cy.closeRecentAudioRecordingWarning();
		cy.contains("Describe the patient's vital signs.").should('be.visible');
		cy.get('[data-cy="soc-interview-back-audio-question-button"]').click();
		cy.get('[data-cy="soc-interview-back-audio-question-button"]').click();

		cy.get(`[data-cy="${NurseInterviewPhysicalAssessmentThemes.IVAccess}"]`).then(($el) => {
			expect($el).to.have.attr('aria-pressed', 'true');
		});
		cy.interviewNext();

		cy.contains('baseline information').should('be.visible');
		cy.interviewNext();

		cy.contains('Share details about your recent patient visit.').should('be.visible');
		cy.audioNext();
		cy.contains("Describe the patient's vital signs.").should('be.visible');
		cy.recordAudio1();
		cy.waitForButtonToEnable('[data-cy="mic-button"]');

		cy.contains("Describe the patient's living situation.").should('be.visible');
		cy.recordAudio1();
		cy.waitForButtonToEnable('[data-cy="mic-button"]');

		cy.contains('Does the patient receive any care, services or assistance outside of home health care?').should(
			'be.visible',
		);
		cy.recordAudio1();
		cy.waitForButtonToEnable('[data-cy="mic-button"]');

		cy.contains("Describe the patient's health history.").should('be.visible');

		cy.get('[data-cy="patient-drawer-close-btn"]').click();
		cy.get('[data-cy="back-button"]').click();

		cy.logout();

		// resumes & goes back and forward in text mode
		cy.loginWithoutVerification('test@apricothealth.ai');
		cy.switchView();
		cy.contains(`${patient.firstName} ${patient.lastName}`).click({ force: true });
		cy.startInterview();
		cy.contains("Let's pick up where you left off.").should('be.visible');
		cy.get('[data-cy="soc-interview-answer-mode"]').click({ force: true });
		cy.get('[data-cy="soc-interview-answer-mode-text"]').click();
		cy.contains('Text Mode').should('be.visible');
		cy.interviewNext();

		cy.contains("Describe the patient's health history.").should('be.visible');
		cy.get('[data-cy="text-question-textfield"]').type('Test health history description');
		cy.interviewNext();

		cy.contains("Describe the patient's functional history.").should('be.visible');
		cy.interviewBack();

		cy.contains("Describe the patient's health history.").should('be.visible');
		cy.contains('Test health history description').scrollIntoView().should('be.visible');
		cy.interviewNext();

		cy.contains("Describe the patient's functional history.").should('be.visible');
		cy.get('[data-cy="text-question-textfield"]').type('Test functional history description');
		cy.interviewNext();

		cy.contains("Describe the patient's mobility and ability to safely move around or leave their home.").should(
			'be.visible',
		);
	});
});
