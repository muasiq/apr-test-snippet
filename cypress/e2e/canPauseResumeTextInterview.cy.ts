import { NurseInterviewPhysicalAssessmentThemes } from '../../src/assessments/nurse-interview/questions';
import '../support/commands';
import { retryableBefore } from '../support/retryableBefore';

describe('(Nurse App) - Start Pause Text Interview', () => {
	let patient = { firstName: '', lastName: '' };

	retryableBefore(() => {
		void cy.clearIndexDB();
		cy.seedDatabaseAndGetPatient('NewPatient').then((p) => {
			patient = p;
		});
	});

	it('can start & pause a text interview', () => {
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
		cy.get('[data-cy="soc-interview-answer-mode"]').click({ force: true });
		cy.get('[data-cy="soc-interview-answer-mode-text"]').click();
		cy.contains('Text Mode').should('be.visible');
		cy.interviewNext();

		cy.contains('Share details about your recent patient visit.').should('be.visible');
		cy.get('[data-cy="text-question-textfield"]').scrollIntoView().type('test');
		cy.interviewNext();
		cy.contains("Describe the patient's vital signs.").should('be.visible');
		cy.get('[data-cy="text-question-textfield"]').scrollIntoView().type('Test vital sign description');
		cy.get('[data-cy="patient-drawer-close-btn"]').click();
		cy.wait(3000);

		cy.logout();

		// can login & resume a text interview
		cy.visitHome();
		cy.loginWithoutVerification('test@apricothealth.ai');
		cy.switchView();
		cy.contains(`${patient.firstName} ${patient.lastName}`).click({ force: true });
		cy.get('[data-cy="soc-interview-start-button"]').click();
		cy.contains("Let's pick up where you left off.").should('be.visible');
		cy.get('[data-cy="soc-interview-answer-mode"]').click({ force: true });
		cy.get('[data-cy="soc-interview-answer-mode-text"]').click();
		cy.contains('Text Mode').should('be.visible');
		cy.interviewNext();
		cy.contains("Describe the patient's vital signs.").should('be.visible');
		cy.get('[data-cy="text-question-textfield"]').scrollIntoView().type('Test vital sign description');
		cy.interviewNext();
		cy.get('[data-cy="patient-drawer-close-btn"]').click();

		cy.reload();
		cy.visit('/');
		cy.switchView();

		// can login & resume a text interview with voice
		cy.contains(`${patient.firstName} ${patient.lastName}`).click({ force: true });
		cy.get('[data-cy="soc-interview-start-button"]').click();
		cy.contains("Let's pick up where you left off.").should('be.visible');
		cy.get('[data-cy="soc-interview-answer-mode"]').click({ force: true });
		cy.get('[data-cy="soc-interview-answer-mode-voice"]').click();
		cy.contains('Voice Mode').should('be.visible');
		cy.interviewNext();
		cy.contains("Describe the patient's living situation.").should('be.visible');
		cy.recordAudio();
		cy.get('[data-cy="soc-interview-next-audio-question-button"]').click();

		cy.closeRecentAudioRecordingWarning();
		cy.contains('Does the patient receive any care, services or assistance outside of home health care?').should(
			'be.visible',
		);
		cy.recordAudio();
		cy.get('[data-cy="soc-interview-next-audio-question-button"]').click();

		cy.contains("Describe the patient's health history.").should('be.visible');
		cy.recordAudio();
		cy.get('[data-cy="soc-interview-next-audio-question-button"]').click();

		cy.contains("Describe the patient's functional history.").should('be.visible');
		cy.recordAudio();
		cy.get('[data-cy="soc-interview-next-audio-question-button"]').click();

		cy.contains("Describe the patient's mobility and ability to safely move around or leave their home.").should(
			'be.visible',
		);
		cy.recordAudio();
		cy.get('[data-cy="soc-interview-next-audio-question-button"]').click();

		cy.contains("Describe the patient's risk for pressure ulcers.").should('be.visible');
		cy.recordAudio();
		cy.get('[data-cy="soc-interview-next-audio-question-button"]').click();

		cy.contains("Describe the patient's ability to safely handle activities of daily living.").should('be.visible');
		cy.recordAudio();
		cy.get('[data-cy="soc-interview-next-audio-question-button"]').click();

		cy.contains("Describe the patient's ability to prepare and take their medications reliably and safely.").should(
			'be.visible',
		);
		cy.recordAudio();
		cy.get('[data-cy="soc-interview-next-audio-question-button"]').click();

		cy.contains("Describe the patient's active diagnoses").should('be.visible');
		cy.recordAudio();
		cy.get('[data-cy="soc-interview-next-audio-question-button"]').click();

		cy.contains('Describe your plan of care for this patient.').should('be.visible');
		cy.recordAudio();
		cy.get('[data-cy="soc-interview-next-audio-question-button"]').click();

		cy.contains('Describe the interventions needed by the patient.').should('be.visible');
		cy.get('[data-cy="patient-drawer-close-btn"]').click();

		cy.visit('/');
		cy.switchView();

		// can resume a voice interview & complete with text
		cy.contains(`${patient.firstName} ${patient.lastName}`).click({ force: true });
		cy.get('[data-cy="soc-interview-start-button"]').click();
		cy.contains("Let's pick up where you left off.").should('be.visible');
		cy.get('[data-cy="soc-interview-answer-mode"]').click({ force: true });
		cy.get('[data-cy="soc-interview-answer-mode-text"]').click();
		cy.contains('Text Mode').should('be.visible');

		cy.interviewNext();

		cy.contains('Describe the interventions needed by the patient.').should('be.visible');
		cy.get('[data-cy="text-question-textfield"]').scrollIntoView().type('Test interventions description');
		cy.interviewNext();

		cy.contains('Describe the goals and discharge plan for this patient.').should('be.visible');
		cy.get('[data-cy="text-question-textfield"]')
			.scrollIntoView()
			.type('Test goals and discharge plan description');
		cy.interviewNext();

		cy.contains('How many wounds were found?').should('be.visible');
		cy.interviewNext();

		cy.contains('Describe wound #1').should('be.visible');
		cy.get('[data-cy="text-question-textfield"]').scrollIntoView().type('Test wound description');
		cy.interviewNext();

		cy.contains("Describe the patient's skin").should('be.visible');
		cy.get('[data-cy="text-question-textfield"]').scrollIntoView().type('Test skin description');
		cy.interviewNext();
		// ---- END AREAS TO REPORT ON QUESTIONS ----

		// ---- WITHIN NORMAL LIMITS ----
		cy.contains('The following reports will be marked as "within normal limits".').should('be.visible');
		cy.get('[data-cy="soc-interview-i-understand-button"]').click();
		// ---- END WITHIN NORMAL LIMITS ----

		// ---- REVIEW PROMPT ----
		cy.contains('Almost done! We have a few more things to sync before you can review.').should('be.visible');
		cy.waitForButtonToEnable('[data-cy="soc-interview-review-now-button"]').click();
		// ---- END REVIEW PROMPT ----

		// ---- REVIEW & Confirm ----
		cy.contains('Almost done!').should('be.visible');
		cy.get('[data-cy="soc-interview-send-to-qa-button"]').click();
		cy.contains('On it').should('be.visible');
	});
});
