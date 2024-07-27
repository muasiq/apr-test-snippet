import { generateFakePatient } from '../../src/common/testUtils/generateFakePatient';
import '../support/commands';

describe('Patient Management - Create and edit', () => {
	it('Can create a new patient, assign that patient to yourself, view that patient in your own nurse view', () => {
		const fakePatient = generateFakePatient(0);

		cy.visitHome();
		cy.login('test@apricothealth.ai');

		cy.createNewPatient(fakePatient);

		cy.wait(1000);

		// Check for success message
		cy.contains('New Patient Created').should('be.visible');
		cy.contains('Apricot ID').should('be.visible');

		// Verify the names are visible on the screen
		cy.contains(fakePatient.firstName).should('be.visible');
		cy.contains(fakePatient.lastName).should('be.visible');

		// Assign the patient to myself
		cy.chooseFirstSelectElement('[data-cy="case-manager-input"]');

		cy.get('[data-cy="update-patient-button"]').click();
		cy.contains('Successfully updated patient').should('be.visible');

		// Switch to nurse view
		cy.switchView();

		// Verify the patient is visible in the nurse patient list view

		cy.contains('Patient List').click();
		cy.get('[data-cy="sort-button"]').click();
		cy.contains('Newest').click();

		// now the newest patient should be at the top of the list
		cy.contains(`${fakePatient.firstName} ${fakePatient.lastName}`).should('be.visible');
	});
});
