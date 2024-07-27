import '../support/commands';
import { SeededPatient } from '../support/commands';
import { retryableBefore } from '../support/retryableBefore';

describe('Try to break nurse interview!', () => {
	let patient: Partial<SeededPatient> = { firstName: '', lastName: '' };
	retryableBefore(() => {
		void cy.clearIndexDB();
		cy.seedDatabaseAndGetPatient('NewPatient').then((p) => {
			patient = p;
		});
	});

	it('Handles rage clicks', () => {
		cy.viewport('iphone-8');
		cy.visitHome();
		cy.login('test@apricothealth.ai');
		cy.switchView();
		cy.contains(`${patient.firstName} ${patient.lastName}`).click({ force: true });
		cy.get('[data-cy="soc-interview-start-button"]').click();

		const firstQuestionUrl = `/field/patient/${patient.id}?interviewOpen=true&interviewState=MAIN_INTERVIEW&currentQuestion=&didUploadWounds=false&dictate=true&questionShortLabel=VisitDetails&physicalAssessmentThemes=Skin`;
		cy.visit(firstQuestionUrl);

		cy.contains('Share details about your recent patient visit.').should('be.visible');
		clickMicButtonTimes(11);
		cy.wait(11000);
		clickMicButton();
		cy.wait(1000);
		clickMicButtonTimes(8);

		cy.get('[data-cy="soc-interview-next-audio-question-button"]').click();
		clickMicButtonTimes(7);
		cy.wait(1000);
		clickMicButtonTimes(6);
		cy.wait(1000);
		clickMicButton();
		cy.wait(1000);
		clickMicButton();
		cy.wait(12000);
		clickMicButton();
		cy.get('[data-cy="soc-interview-next-audio-question-button"]').click();

		doQuestion();
		doQuestion();
		doQuestion();
		doQuestion();
	});
});

function doQuestion() {
	clickMicButton();
	cy.wait(1000);
	clickMicButtonTimes(4);
	cy.wait(12000);
	clickMicButton();
	cy.get('[data-cy="soc-interview-next-audio-question-button"]').click();
}

function clickMicButton() {
	cy.get('[data-cy="mic-button"]').click();
}

function clickMicButtonTimes(times = 5) {
	for (let i = 0; i < times; i++) {
		clickMicButton();
	}
}
