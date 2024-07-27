import { PatientStatus } from '@prisma/client';
import '../support/commands';

describe('Persist back office table', () => {
	it('Can persist search in back office table', () => {
		cy.seedDatabaseAndGetPatient(PatientStatus.NewPatient).then((patient) => {
			const email = 'test@apricothealth.ai';

			cy.visitHome();
			cy.login(email);

			cy.get('[data-cy="search-patient"]').type(patient.firstName);
			cy.wait(1000);
			cy.url().should('include', `?search=${patient.firstName}&status=all`);

			cy.get('[data-cy="status-patient"]').click();
			cy.get('[data-value="NewPatient"]').click();
			cy.wait(1000);
			cy.url().should('include', `?search=${patient.firstName}&status=NewPatient`);

			const patientCell = `div[title="${patient.firstName} ${patient.lastName}"]`;
			cy.get(patientCell).click({ force: true });

			cy.wait(1000);

			cy.get('[data-cy="back-button"]').click();
			cy.url().should('include', `?search=${patient.firstName}&status=NewPatient`);
			cy.get(patientCell).should('exist');
		});
	});
});
