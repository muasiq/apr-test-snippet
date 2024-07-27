import { faker } from '@faker-js/faker';
import { AssessmentAnswerSuggestionStatus, ConfigurationType, UserRole } from '@prisma/client';
import Sinon from 'cypress/types/sinon';
import { get } from 'lodash';
import { Session } from 'next-auth';
import * as nextAuth from 'next-auth/react';
import { defaultConfig } from 'prisma/defaultOrgProfileSettings';
import SuperJSON from 'superjson';
import { CustomAssessmentNumber } from '~/assessments/apricot/custom';
import { getLocalConfiguration } from '~/assessments/configurations';
import { AssessmentQuestion } from '~/assessments/types';
import { hchb } from '~/common/constants/medication';
import { createInteraction, createMedication } from '~/common/testUtils/entityBuilders/medication';
import { SchemaAssessmentAnswer } from '~/common/types/AssessmentSuggestionAndChoice';
import {
	AssessmentCheckInput,
	AssessmentMedicationSchema,
	MedicationSchema,
} from '~/server/api/routers/assessment/assessment.inputs';
import { AssessmentMedicationForm } from '.';
import { AssessmentStatusProvider } from '../../hooks/useAssessmentStatus';

const mockedQuestion = { id: CustomAssessmentNumber.MEDICATIONS } as AssessmentQuestion;
const configuration = getLocalConfiguration('Accentra');
const mockedMedication = {
	DispensableDrugID: faker.lorem.word(),
	DispensableDrugDesc: faker.lorem.word(),
	RouteDesc: faker.helpers.arrayElement(['oral', 'topical']),
};
const availableDoseUnits = ['tablet', 'mg', 'Per instructions'];

describe('<AssessmentMedicationForm />', () => {
	let sessionStub: Cypress.Agent<Sinon.SinonStub>;

	function mockSession(data: Partial<Session['user']> = {}) {
		const user = { id: '1', email: '', organizationId: 1, name: '', roles: [UserRole.Nurse], ...data };
		sessionStub.returns({
			data: { user, expires: '' },
			update: cy.stub(),
			status: 'authenticated',
		});
	}

	beforeEach(() => {
		cy.intercept('/api/trpc/patient.getById**', {
			statusCode: 200,
			body: [{ result: { data: SuperJSON.serialize({ SOCVisitDate: new Date(), SOCVisitCaseManagerId: '1' }) } }],
		});

		cy.intercept('/api/trpc/medication.search**', {
			statusCode: 200,
			body: [{ result: { data: { json: { results: [mockedMedication] } } } }],
		});

		cy.intercept('/api/trpc/medication.getDispensableDrug**', {
			statusCode: 200,
			body: [{ result: { data: { json: { ...mockedMedication, availableDoseUnits } } } }],
		});

		sessionStub = cy.stub(nextAuth, 'useSession');
		mockSession();
		mockAssessmentCheck();
	});

	it('should be able to add a listed medication', () => {
		renderComponent();
		cy.get('[data-cy=add-button]').click();

		cy.get('[data-cy=medication-name-0]').type('medication name');
		cy.contains(mockedMedication.DispensableDrugDesc).click();
		cy.get('[data-cy=medication-route-0]').find('input').should('contain.value', mockedMedication.RouteDesc);

		cy.contains('Confirm').click();

		const [year] = new Date().toISOString().split('-');
		cy.get('[data-cy=medication-start-date-0]').find('input').should('contain.value', year!);

		const data = {
			endDate: '02/02/2021',
			doseAmount: faker.number.int(),
			doseUnit: 'tablet',
			frequency: faker.helpers.arrayElement(hchb.frequency),
			reason: faker.lorem.word(),
			instructions: faker.lorem.sentence(),
			status: 'Longstanding',
			understanding: 'Purpose',
			additionalDescriptors: 'Agency Administered',
		};

		fillFields(data, true);
		cy.contains('Confirm').click();

		cy.wait('@assessmentCheck').then(({ request }) => {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			expect(request.body[0].json.checkedResponse.choice.medications[0]).to.deep.include({
				...data,
				name: mockedMedication.DispensableDrugDesc,
				route: mockedMedication.RouteDesc,
				endDate: new Date(data.endDate).toISOString(),
				fdb: {
					type: 'dispensableDrug',
					id: mockedMedication.DispensableDrugID,
					name: mockedMedication.DispensableDrugDesc,
					availableDoseUnits,
				},
				configurationType: ConfigurationType.HomeCareHomeBase,
				understanding: ['Purpose'],
				additionalDescriptors: ['Agency Administered'],
			});
		});
	});

	it('should be able to add an unlisted medication', () => {
		renderComponent();
		cy.get('[data-cy=add-button]').click();

		const data = {
			name: 'Unlisted',
			endDate: '02/02/2021',
			doseAmount: faker.number.int(),
			doseUnit: faker.lorem.word(),
			route: faker.helpers.arrayElement(hchb.routes),
			frequency: faker.helpers.arrayElement(hchb.frequency),
			reason: faker.lorem.word(),
			instructions: faker.lorem.sentence(),
			status: 'Longstanding',
			strength: '500mg',
			understanding: 'Purpose',
			additionalDescriptors: 'Agency Administered',
		};

		fillFields(data);
		cy.contains('Confirm').click();

		cy.wait('@assessmentCheck').then(({ request }) => {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			expect(request.body[0].json.checkedResponse.choice.medications[0]).to.deep.include({
				...data,
				name: 'Unlisted',
				strength: '500mg',
				endDate: new Date(data.endDate).toISOString(),
				fdb: null,
				configurationType: ConfigurationType.HomeCareHomeBase,
				understanding: ['Purpose'],
				additionalDescriptors: ['Agency Administered'],
			});
		});
	});

	it('should show error on autocomplete if name is not set', () => {
		renderComponent();
		cy.get('[data-cy=add-button]').click();

		fillFields({
			endDate: '02/02/2021',
			doseAmount: faker.number.int(),
			doseUnit: faker.lorem.word(),
			route: faker.helpers.arrayElement(hchb.routes),
			frequency: faker.helpers.arrayElement(hchb.frequency),
			reason: faker.lorem.word(),
			instructions: faker.lorem.sentence(),
			status: 'Longstanding',
			understanding: 'Purpose',
			additionalDescriptors: 'Agency Administered',
		});
		cy.contains('Confirm').click();

		cy.get('[data-cy=medication-name-0]').contains('Required');
	});

	describe('Interactions', () => {
		it('should display interactions on save', () => {
			const medications: MedicationSchema[] = [createMedication()];
			const answer = getAnswer({ checkedResponse: { choice: { medications } } });
			const interaction = createInteraction();
			const answerWithInteractions = getAnswer({
				checkedResponse: {
					choice: { medications },
					interactions: { data: [interaction, createInteraction({ Severity: '1' })], verified: false },
				},
			});

			cy.intercept('/api/trpc/assessment.verifyMedicationInteractionsAssessment**', {
				statusCode: 200,
				body: [{ result: { data: { json: { results: {} } } } }],
			}).as('verifyInteractions');

			mockAssessmentCheck(answerWithInteractions);

			cy.nextMount(<FormWithProviders answer={answer} />).then(({ rerender }) => {
				fieldMap.strength('20mg');
				cy.contains('Confirm').click();
				cy.wait('@assessmentCheck');
				cy.get('button[title="Close"]').click(); // close alert

				rerender(<FormWithProviders answer={answerWithInteractions} />);

				cy.contains('Medication Interactions');
				cy.contains(interaction.ClinicalEffectsNarrative);
				cy.get('[data-cy="close-bottom-drawer"]').click();
				cy.contains('Medication Review Attestation');
				cy.get("button:contains('I Agree')").click();

				cy.wait('@verifyInteractions');
			});
		});

		it("should display confirm when interactions haven't been verified", () => {
			const medications: MedicationSchema[] = [createMedication()];
			const interaction = createInteraction();
			const answer = getAnswer({
				checkedResponse: {
					choice: { medications },
					interactions: { data: [interaction, createInteraction({ Severity: '1' })], verified: false },
				},
			});

			mockSession();
			mockAssessmentCheck(answer);

			cy.nextMount(<FormWithProviders answer={answer} />);
			cy.contains('Confirm').click();
			cy.wait('@assessmentCheck');
			cy.contains('Medication Interactions');
		});

		it('should not display attestation if not case manager', () => {
			const medications: MedicationSchema[] = [createMedication()];
			const interaction = createInteraction();
			const answer = getAnswer({
				checkedResponse: {
					choice: { medications },
					interactions: { data: [interaction, createInteraction({ Severity: '1' })], verified: false },
				},
			});

			mockSession({ id: '2' });
			mockAssessmentCheck(answer);

			cy.nextMount(<FormWithProviders answer={answer} />);

			cy.contains('Confirm').should('not.exist');

			fieldMap.strength('20mg');
			cy.contains('Confirm').click();
			cy.wait('@assessmentCheck');
			cy.get('button[title="Close"]').click();

			cy.contains('Medication Interactions').should('not.exist');
			cy.contains('View').scrollIntoView().click();
			cy.contains(interaction.ClinicalEffectsNarrative);
			cy.get('[data-cy="close-bottom-drawer"]').click();
			cy.contains('Medication Review Attestation').should('not.exist');
		});
	});
});

function FormWithProviders(props: Partial<Parameters<typeof AssessmentMedicationForm>[0]>) {
	return (
		<AssessmentStatusProvider>
			<AssessmentMedicationForm
				question={mockedQuestion}
				patientId={1}
				readOnly={false}
				configuration={configuration}
				additionalDropdownConfigurationInput={defaultConfig}
				{...props}
			/>
		</AssessmentStatusProvider>
	);
}

function getAnswer(data: Partial<AssessmentCheckInput> = {}) {
	return {
		patientId: 1,
		assessmentNumber: CustomAssessmentNumber.MEDICATIONS,
		status: AssessmentAnswerSuggestionStatus.Completed,
		...data,
	} as SchemaAssessmentAnswer;
}

function renderComponent(checkedResponse?: AssessmentMedicationSchema) {
	const answer = getAnswer({ checkedResponse });
	return cy.nextMount(<FormWithProviders answer={answer} />);
}

function mockAssessmentCheck(data = {}) {
	cy.intercept('/api/trpc/assessment.assessmentCheck**', {
		statusCode: 200,
		body: [{ result: { data: { json: data } } }],
	}).as('assessmentCheck');
}

const fieldMap = {
	name: (val: string) => {
		cy.get('[data-cy=medication-name-0]').type(val);
		return cy.contains(`Add "${val}" as an unlisted medication`).click();
	},
	endDate: (val: string) => cy.get('[data-cy=medication-end-date-0]').find('input').type(val),
	doseAmount: (val: number) => cy.get('[data-cy=medication-dose-amount-0]').type(val.toString()),
	doseUnit: (val: string) => cy.get('[data-cy=medication-dose-unit-0]').type(val),
	route: (val: string) => cy.chooseSelectElement('[data-cy=medication-route-0]', val, { force: true }),
	frequency: (val: string) => cy.chooseSelectElement('[data-cy=medication-frequency-0]', val, { force: true }),
	reason: (val: string) => cy.get('[data-cy=medication-reason-0]').type(val),
	status: (val: string) => cy.chooseSelectElement('[data-cy=medication-status-0]', val),
	understanding: (val: string) =>
		cy.chooseSelectElement('[data-cy=medication-understanding-0]', val, { multiSelect: true }),
	additionalDescriptors: (val: string) =>
		cy.chooseSelectElement('[data-cy=medication-additional-descriptors-0]', val, { multiSelect: true }),
	strength: (val: string) => cy.get('[data-cy=medication-strength-0]').type(val),
	instructions: (val: string) => cy.get('[data-cy=medication-instructions-0]').type(val),
} as const;

const listedFieldMap = {
	name: (val: string) => {
		cy.get('[data-cy=medication-name-0]').type(val);
		return cy.contains(val).click();
	},
	doseUnit: (val: string) => cy.chooseSelectElement('[data-cy=medication-dose-unit-0]', val, { force: true }),
} as const;

type FieldMap = typeof fieldMap;

function fillFields(
	data: {
		[K in keyof FieldMap]?: Parameters<FieldMap[K]>[0];
	},
	isListed = false,
) {
	Object.keys(data).forEach((key) => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const func = isListed && key in listedFieldMap ? get(listedFieldMap, key) : get(fieldMap, key);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call
		func(get(data, key));
	});
}
