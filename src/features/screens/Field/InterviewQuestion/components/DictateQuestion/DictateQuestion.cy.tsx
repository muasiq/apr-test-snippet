/* eslint-disable @typescript-eslint/no-empty-function */
import SuperJSON from 'superjson';
import { ShortLabels, interview } from '~/assessments/nurse-interview/questions';
import { DictateQuestion } from '.';

function renderComponent(props: Partial<Parameters<typeof DictateQuestion>[0]> = {}) {
	cy.intercept('/api/trpc/patient.getById**', {
		statusCode: 200,
		body: [{ result: { data: SuperJSON.serialize({ SOCVisitDate: new Date() }) } }],
	});

	const shortLabel = ShortLabels.VisitDetails;
	const currentQuestion = interview.find((d) => d.shortLabel === shortLabel);

	const defaultProps = {
		hasTextResponse: false,
		handleNextButtonClick: (_blob?: Blob) => {},
		handlePreviousButtonClick: (_blob?: Blob) => {},
		hasSavedAudioResponse: false,
		isLoading: false,
		filteredInterview: interview,
		questionShortLabel: shortLabel,
		currentWoundNumber: '',
		currentQuestion: currentQuestion,
		saveResponse: async (_blob: Blob) => {},
	};

	cy.nextMount(<DictateQuestion {...defaultProps} {...props} />);
}

function getNextButton() {
	return cy.get('[data-cy=soc-interview-next-audio-question-button]');
}

function getBackButton() {
	return cy.get('[data-cy=soc-interview-back-audio-question-button]');
}

function getRecordButton() {
	return cy.get('[data-cy=mic-button]');
}

describe('<DictateQuestion />', () => {
	it('should show time', () => {
		const handleNextButtonClick = cy.spy().as('onNextSpy');
		const saveResponse = cy.spy().as('onSave');

		renderComponent({ handleNextButtonClick, saveResponse });

		cy.clock();
		getRecordButton().click();
		getNextButton().should('not.be.visible');

		cy.contains('0:00');
		cy.tick(5000);
		cy.contains('0:05');

		getRecordButton().click();
		getNextButton().click();
	});

	it('should show success and call save when navigating forward', () => {
		const handleNextButtonClick = cy.spy().as('onNextSpy');
		const saveResponse = cy.spy().as('onSave');

		renderComponent({ handleNextButtonClick, saveResponse });

		cy.clock();
		getRecordButton().click();
		getRecordButton().click();
		getNextButton().click();

		cy.tick(1500);

		cy.get('@onSave').should('have.been.called');
		cy.get('@onNextSpy').should('have.been.called');
	});

	it('should show success and call save when navigating back', () => {
		const handlePreviousButtonClick = cy.spy().as('onBackSpy');
		const saveResponse = cy.spy().as('onSave');

		renderComponent({ handlePreviousButtonClick, saveResponse });

		cy.clock();
		getRecordButton().click();
		getBackButton().should('not.be.visible');
		getRecordButton().click();
		getBackButton().click();

		cy.tick(1500);

		cy.get('@onSave').should('have.been.called');
		cy.get('@onBackSpy').should('have.been.called');
	});

	it('should be able to pause and resume audio', () => {
		renderComponent();

		cy.clock();
		getRecordButton().click();
		cy.tick(2000);
		getRecordButton().click();
		cy.contains('0:02');
		getRecordButton().click();
		cy.tick(2000);
		getRecordButton().click();
		cy.contains('0:04');

		getNextButton().click();
	});

	it('should be able to restart audio', () => {
		renderComponent();

		cy.clock();
		getRecordButton().click();
		cy.tick(2000);
		getRecordButton().click();
		cy.contains('0:02');
		cy.get('[data-cy="dictation-action-alert-button"]').click();
		cy.get('[data-cy="dictation-action-alert-button"]').click();

		getRecordButton().click();
		cy.tick(2000);
		getRecordButton().click();
		cy.contains('0:02');

		getNextButton().click();
	});

	it('should show bad audio', () => {
		renderComponent();

		cy.clock();
		getRecordButton().click();
		cy.tick(10000);
		cy.wait(100);
		cy.tick(100);

		cy.contains('Weak audio signal');
		cy.get('button:contains("TRY AGAIN")');
		cy.get('button:contains("TYPE MY ANSWERS")');
	});
});
