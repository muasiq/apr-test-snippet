import '../support/commands';

const vitalSignParamsFields = [
	{ label: 'Temperature (°F)', field: 'temperature' },
	{ label: 'Pulse(bpm)', field: 'pulse' },
	{ label: 'Respirations(bpm)', field: 'respirations' },
	{ label: 'Systolic BP(mmHg)', field: 'bloodPressureSystolic' },
	{ label: 'Diastolic BP(mmHg)', field: 'bloodPressureDiastolic' },
	{ label: 'O2 Saturation(%)', field: 'oxygenSaturation' },
	{ label: 'Pain Level', field: 'painLevel' },
	{ label: 'Fasting Blood Sugar(mg/dL)', field: 'fastingBloodSugar' },
	{ label: 'Random Blood Sugar(mg/dL)', field: 'randomBloodSugar' },
	{ label: 'Weight(lbs)', field: 'weight' },
	{ label: 'INR Level', field: 'inrLevel' },
	{ label: 'Prothrombin Time', field: 'prothrombinTime' },
	{ label: 'Ankle Circumference (cm)', field: 'ankleCircumference' },
	{ label: 'Calf Circumference (cm)', field: 'calfCircumference' },
	{ label: 'Girth (cm)', field: 'girth' },
	{ label: 'Head Circumference (cm)', field: 'headCircumference' },
	{ label: 'Instep Circumference (cm)', field: 'instepCircumference' },
	{ label: 'Thigh Circumference (cm)', field: 'thighCircumference' },
] as const;

describe('Admin) - Can Manage Org Configurations', () => {
	it('can manage org configurations', () => {
		cy.visit('/');
		cy.login('test+org-admin@apricothealth.ai');
		cy.wait(2000);
		cy.visit('/office/admin/manage-org?currentTab=LoginSettings');
		cy.wait(2000);
		cy.contains('Organization Settings').should('be.visible');
		cy.wait(2000);

		// domain allow list TODO
		// cy.contains('Allowed Domains').find('button').contains('Show').click()
		// cy.contains('apricothealth.ai').should('be.visible');
		// cy.contains('Add Record').click()
		// cy.type('apricothealth.org')

		// branches TODO
		// cy.get('[data-cy="branch-config"]').click();
		// cy.contains('Add Branch').click();
		// cy.get('[data-cy="branch-name"]').eq(1).type('Branch 1');
		// cy.get('[data-cy="branch-cms-id"]').eq(1).type('123');
		// cy.chooseSelectElement('[data-cy="branch-config-item-branches.1.state"]', 'CA');
		// cy.get('[data-cy="branch-timezone"]').eq(1).type('{enter}');
		// cy.get('[data-cy="select-item-PST"]').click();
		// cy.get('[data-cy="row-confirm-button"]').click();
		// cy.contains('Branch Saved').should('be.visible');

		// check if the changes are saved TODO
		// cy.reload();
		// cy.contains('Configuration Type').should('be.visible');
		// cy.contains('Choice').should('be.visible');
		// cy.contains('apricothealth.org').should('be.visible');

		// delete branch TODO
		// cy.get('[data-cy="branch-config"]').click();
		// cy.get('[data-cy="row-edit-button"]').eq(1).click();
		// cy.get('[data-cy="row-delete-button"]').click();
		// cy.contains('Branch Deleted').should('be.visible');

		// Login Profiles
		// cy.get(':nth-child(2) > .MuiStack-root > [data-cy="add-button"]').click();
		// cy.get('[data-cy="login-profile-config"]').click();
		// cy.get('[data-cy="login-profile-username"]').type('user 1');
		// cy.get('[data-cy="login-profile-password"]').type('aPassword');
		// cy.get('[data-cy="row-confirm-button"]').click();
		// cy.contains('Login Profile Saved').should('be.visible');

		// // edit login profile
		// cy.get('[data-cy="row-edit-button"]').eq(1).click();
		// cy.get('[data-cy="login-profile-in-use"]').click();
		// cy.get('[data-cy="row-confirm-button"]').click();
		// cy.contains('Login Profile Saved').should('be.visible');

		// // delete login profile
		// cy.get('[data-cy="row-edit-button"]').eq(1).click();
		// cy.get('[data-cy="row-delete-button"]').click({ force: true });
		// cy.contains('Login Profile Deleted').should('be.visible');

		// vital sign config TODO
		cy.contains('EMR Configuration').click();
		// cy.contains('Vital Sign').find('button').contains('Show').click();
		// cy.get(':nth-child(3) > .MuiStack-root > [data-cy="add-button"]').click();
		// cy.get('[data-cy="vital-sign-config"]').click();
		// cy.get('[data-cy="vital-sign-name-0"]').type('Vital Sign 1');

		// vitalSignParamsFields.forEach((item) => {
		// 	cy.get(`[data-cy="vital-sign-${item.field}-min-0"]`).type(faker.number.int({ min: 0, max: 99 }).toString());
		// 	cy.get(`[data-cy="vital-sign-${item.field}-max-0"]`).type(faker.number.int({ min: 0, max: 99 }).toString());
		// });

		// cy.get('[data-cy="row-confirm-button-0"]').click();
		// cy.contains('Vital Sign Configuration Updated').should('be.visible');
	});
});
