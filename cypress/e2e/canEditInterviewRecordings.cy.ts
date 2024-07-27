import { NurseInterviewPhysicalAssessmentThemes } from '../../src/assessments/nurse-interview/questions';
import '../support/commands';
import { retryableBefore } from '../support/retryableBefore';

describe('Nurse App - Can Edit Interview Recordings', () => {
	let patient = { firstName: '', lastName: '' };
	retryableBefore(() => {
		void cy.clearIndexDB();
		cy.seedDatabaseAndGetPatient('NewPatient').then((p) => {
			patient = p;
		});
	});
	it('Can add, edit & delete recordings during nurse interview', () => {
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
		cy.wait(3);
		cy.get(`[data-cy="${NurseInterviewPhysicalAssessmentThemes.Skin}"]`).click();
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
		cy.recordAudio1();
		cy.waitForButtonToEnable('[data-cy="mic-button"]');

		cy.contains("Describe the patient's living situation.").should('be.visible');
		cy.recordAudio();

		// it can delete the recording
		cy.get('[data-cy="dictation-action-alert-button"]').click();
		cy.contains('Recording Deleted').should('be.visible');

		// can record another recording
		cy.contains("Describe the patient's living situation.").should('be.visible');
		cy.recordAudio();
		cy.contains('Recording Captured').should('be.visible');

		// can add more to the recording
		cy.contains('Add More').should('be.visible');
		cy.recordAudio();
		cy.contains('Recording Captured').should('be.visible');

		// can add another recording
		cy.contains('Add More').should('be.visible');
		cy.recordAudio();
		cy.contains('Recording Captured').should('be.visible');

		// can save & continue to the next question
		cy.audioNext();

		cy.contains('Does the patient receive any care, services or assistance outside of home health care?').should(
			'be.visible',
		);
		cy.recordAudio();
		cy.contains('Recording Captured').should('be.visible');

		// can add another recording
		cy.contains('Add More').should('be.visible');
		cy.recordAudio();
		cy.contains('Recording Captured').should('be.visible');

		// can add another recording
		cy.contains('Add More').should('be.visible');
		cy.recordAudio();
		cy.contains('Recording Captured').should('be.visible');

		// it can delete the previous recording
		cy.get('[data-cy="dictation-action-alert-button"]').click();
		cy.contains('Recording Deleted').should('be.visible');

		// can record another recording
		cy.recordAudio();
		cy.contains('Recording Captured').should('be.visible');

		// can save & continue to the next question
		cy.audioNext();
		cy.contains("Describe the patient's health history.").should('be.visible');
	});
});
