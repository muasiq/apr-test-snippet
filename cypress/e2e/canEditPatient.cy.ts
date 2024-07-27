import { faker } from '@faker-js/faker';
import { generateFakePatient } from '../../src/common/testUtils/generateFakePatient';
import '../support/commands';

describe('Patient Management - Create and edit', () => {
	it('Can create a new patient then edit some information', () => {
		cy.visitHome();
		cy.login('test@apricothealth.ai');

		const fakePatient = generateFakePatient(0);
		cy.createNewPatient(fakePatient);
		cy.contains('New Patient Created').should('be.visible');

		cy.url().should('not.include', 'office/patient/list');

		cy.contains('Apricot ID').should('be.visible');

		// Verify the names are visible on the screen
		cy.contains(fakePatient.firstName).should('be.visible');
		cy.contains(fakePatient.lastName).should('be.visible');

		// Edit the patient information
		cy.chooseFirstSelectElement('[data-cy="case-manager-input"]', { multiSelect: true });
		cy.chooseFirstSelectElement('[data-cy="service-location-type"]');

		cy.contains('Add Contact').click();
		cy.get('[data-cy="emergency-contact-first-name"]').type(faker.person.firstName());
		cy.get('[data-cy="emergency-contact-last-name"]').type(faker.person.lastName());
		cy.chooseFirstSelectElement('[data-cy="emergency-contact-type"]', { multiSelect: true });
		cy.get('[data-cy="emergency-contact-number"]').type(faker.phone.number());

		cy.get('[data-cy="update-patient-button"]').click();
		cy.contains('Successfully updated patient').should('be.visible');
	});
});
