import { generateFakePatient } from '../../src/common/testUtils/generateFakePatient';
import '../support/commands';

describe('Create new patient', () => {
	it('Can create a new patient', () => {
		const fakePatient = generateFakePatient(0);

		cy.visitHome();
		cy.login('test@apricothealth.ai');

		cy.createNewPatient(fakePatient);

		// Check for success message
		cy.contains('New Patient Created').should('be.visible');
		cy.contains('Apricot ID').should('be.visible');

		// Verify the names are visible on the screen
		cy.contains(fakePatient.firstName).should('be.visible');
		cy.contains(fakePatient.lastName).should('be.visible');
	});

	it('Show pop up before modal close', () => {
		cy.visitHome();
		cy.login('test@apricothealth.ai');

		cy.get('[data-cy="new-patient-button"]').click();
		cy.get('[data-cy="cancel-new-patient-button"]').click();
		cy.get('[data-cy="new-patient-button"]').click();
		cy.wait(500);
		cy.contains('New Patient').should('be.visible');
		cy.triggerEscape();
		cy.contains('Unsaved Changes Detected').should('be.visible');
		cy.contains('Exit').click();
	});
});
