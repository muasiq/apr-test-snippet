import '../support/commands';
import { retryableBefore } from '../support/retryableBefore';

describe('Nurse App - Medication List Selection when previously selected', () => {
	let patient = { firstName: '', lastName: '' };
	retryableBefore(() => {
		void cy.clearIndexDB();
		cy.seedDatabaseAndGetPatient('NewPatient').then((p) => {
			patient = p;
		});
	});

	it('does not show medication selection list when previously added in patient details', () => {
		cy.visitHome();
		cy.intercept('/api/trpc/patientArtifact.createArtifactAndGenerateSignedUrl?batch=1').as('uploadArtifact');
		cy.login('test@apricothealth.ai');
		cy.contains(`${patient.firstName} ${patient.lastName}`).click({ force: true });
		cy.contains('Medication').click();
		cy.contains('a digital medication list will appear below').should('be.visible');
		cy.get('[data-cy="medication-upload-speed-dial"]').click({ force: true });
		cy.get('[data-cy="speed-dial-new-file"]').click();
		const fileName = 'cat.jpg';
		cy.get('input[type="file"]').attachFile(fileName);

		cy.wait('@uploadArtifact', { timeout: 10000 });

		cy.switchView();
		cy.viewport('iphone-8');
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

		cy.contains('Upload wound photos from your visit').should('be.visible');
	});
});
