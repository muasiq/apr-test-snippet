import { faker } from '@faker-js/faker';
import { AssessmentAnswerSuggestionStatus } from '@prisma/client';
import { defaultConfig } from 'prisma/defaultOrgProfileSettings';
import SuperJSON from 'superjson';
import { CustomAssessmentNumber } from '~/assessments/apricot/custom';
import { AssessmentAdditionalEvaluationsForm } from '.';
import { getLocalConfiguration } from '../../../../../../../../assessments/configurations';
import { AssessmentQuestion } from '../../../../../../../../assessments/types';
import { SchemaAssessmentAnswer } from '../../../../../../../../common/types/AssessmentSuggestionAndChoice';
import { AssessmentStatusProvider } from '../../hooks/useAssessmentStatus';

const configuration = getLocalConfiguration('Accentra');
const mockedQuestion = { id: CustomAssessmentNumber.ADDITIONAL_EVALUATION } as AssessmentQuestion;

describe('<AssessmentAdditionalEvaluationsForm />', () => {
	it('Allows adding an addon evaluation', () => {
		const mockAnswer: Partial<SchemaAssessmentAnswer> = {
			patientId: 1,
			assessmentNumber: CustomAssessmentNumber.ADDITIONAL_EVALUATION,
			status: AssessmentAnswerSuggestionStatus.Completed,
		};

		const fakeCode = faker.company.buzzVerb();
		const fakeDescription = faker.company.buzzVerb();
		cy.intercept('/api/trpc/patient.getById**', {
			statusCode: 200,
			body: [
				{
					result: {
						data: SuperJSON.serialize({
							Organization: {
								AdditionalEvaluationServiceCodes: [{ code: fakeCode, description: fakeDescription }],
							},
							SOCVisitDate: new Date(2024, 4, 24),
						}),
					},
				},
			],
		}).as('getPatient');

		cy.intercept('/api/trpc/assessment.assessmentCheck**', {
			statusCode: 200,
			body: [{ result: { data: { json: {} } } }],
		}).as('assessmentCheck');

		cy.nextMount(
			<AssessmentStatusProvider>
				<AssessmentAdditionalEvaluationsForm
					question={mockedQuestion}
					patientId={1}
					readOnly={false}
					configuration={configuration}
					additionalDropdownConfigurationInput={defaultConfig}
					answer={mockAnswer as SchemaAssessmentAnswer}
				/>
			</AssessmentStatusProvider>,
		);

		cy.wait('@getPatient');
		cy.wait(500);
		cy.contains('Add Evaluation').click();

		cy.chooseFirstSelectElement('[data-cy=addon-evaluation-service-0]');
		cy.get('[data-cy=addon-evaluation-service-0]');

		cy.get('[data-cy=addon-evaluation-date-0]').within(() => {
			cy.get('input').should('have.value', '05/27/2024');
		});
		cy.get('[data-cy=add-button]').click();
		cy.contains('Confirm').click();
		cy.wait('@assessmentCheck');
	});
});
