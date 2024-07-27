import { PatientStatus } from '@prisma/client';
import '../support/commands';
import { retryableBefore } from '../support/retryableBefore';

describe('View Mobile Attachments', () => {
	let patient = { firstName: '', lastName: '' };
	retryableBefore(() => {
		void cy.clearIndexDB();
		cy.seedDatabaseAndGetPatient(PatientStatus.WithQA).then((p) => {
			patient = p;
		});
	});
	it('Can view pdfs and images from nurse view', () => {
		cy.viewport('iphone-8');
		cy.visitHome();
		cy.login('test@apricothealth.ai');

		cy.switchView();
		cy.contains('Patient List').click();
		cy.contains(`${patient.firstName} ${patient.lastName}`).click();
		cy.get('[data-cy="patient-detail-card-open-button"]').click();
		cy.contains('Docs').click();
		cy.contains('test').should('be.visible');
		cy.get('[data-cy="artifact-preview-image"]').click();
		cy.contains('Download').should('be.visible');
		cy.triggerEscape();
		cy.contains('Wounds').click();
		cy.contains('test').should('be.visible');
		cy.get('[data-cy="artifact-preview-image"]').click();
		cy.contains('Download').should('be.visible');
		cy.triggerEscape();
	});
});
