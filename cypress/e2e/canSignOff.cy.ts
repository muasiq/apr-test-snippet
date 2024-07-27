import { faker } from '@faker-js/faker';
import { headings } from 'cypress/support/command.utils';
import '../support/commands';
import { retryableBefore } from '../support/retryableBefore';

describe('Nurse Sign Off', () => {
	let patient = { firstName: '', lastName: '' };
	retryableBefore(() => {
		cy.seedDatabaseAndGetPatient('SignoffNeeded').then((p) => {
			patient = p;
		});
	});

	it('Can sign off on each page', () => {
		cy.viewport('iphone-8');
		cy.visitHome();
		cy.login('test+nurse@apricothealth.ai');
		cy.contains(`${patient.firstName} ${patient.lastName}`).click({ force: true });
		cy.get('[data-cy="soc-sign-off-button"]').click();

		for (const heading of headings) {
			cy.wait(500);
			const sideBar = cy.get('[data-cy="sign-off-box"]');
			sideBar.scrollTo('top', { ensureScrollable: false });
			if (heading === 'Skin') {
				cy.get('body').click('bottom');
			}
			cy.contains(heading).should('be.visible');
			sideBar.scrollTo('bottom', { easing: 'linear', ensureScrollable: false });
			cy.wait(500);
			sideBar.scrollTo(0, 100, { ensureScrollable: false });
			cy.wait(500);
			sideBar.scrollTo('bottom', { easing: 'linear', ensureScrollable: false });
			cy.wait(500);
			if (heading === 'Physician Orders') {
				cy.get('[data-cy="soc-interview-next-button"]').click();
				cy.get('[data-cy="signature-text-field"]').type(faker.person.fullName());
				cy.get('[data-cy="sign-off-submit-button"]').click();
			} else {
				cy.get('[data-cy="soc-interview-next-button"]').click({ force: true });
			}
		}

		cy.contains('Completed').should('be.visible');
	});
});
