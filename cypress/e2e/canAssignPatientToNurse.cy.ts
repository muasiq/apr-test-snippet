import { generateFakePatient } from '../../src/common/testUtils/generateFakePatient';
import '../support/commands';

describe('Patient Management - Assign Patient to Nurse', () => {
	it('Can create a new patient then assign that newly created patient to a nurse', () => {
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

		// Assign the patient to a nurse
		cy.chooseFirstSelectElement('[data-cy="case-manager-input"]');

		cy.get('[data-cy="update-patient-button"]').click();
		cy.contains('Successfully updated patient').should('be.visible');
	});
});
