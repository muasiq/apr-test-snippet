import { headings } from 'cypress/support/command.utils';
import '../support/commands';

describe('Back Office App - Complete QA Questions', () => {
	it('Can can complete the qa questions and submit for approval', () => {
		cy.seedDatabaseAndGetPatient('WithQA').then((patient) => {
			cy.viewport(1920, 1080);
			cy.visitHome();
			cy.login('test+qa@apricothealth.ai');
			cy.contains(`${patient.firstName} ${patient.lastName}`).click();
			cy.intercept('POST', '/api/trpc/assessment.generateAllAssessmentSuggestionsForPatient?batch=1').as(
				'generateAllSuggestions',
			);
			cy.get('[data-cy="open-close-qa-button"]').click();
			cy.wait('@generateAllSuggestions', { timeout: 60000 });
			cy.get('[data-cy="rainbow-unicorn-button"]').click();
			cy.contains('Unicorn Magic').should('be.visible');

			for (const heading of headings) {
				cy.contains(heading).should('be.visible');
				if (heading === 'Physician Orders') {
					cy.get('[data-cy="submit-for-approval-button"]').click();
				} else {
					cy.get('[data-cy="qa-next-button"]').click();
				}
			}

			cy.contains('Documentation sent for review.').should('be.visible');
		});
	});
});
