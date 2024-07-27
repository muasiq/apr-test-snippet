import { faker } from '@faker-js/faker';
import { AssessmentAnswerSuggestionStatus } from '@prisma/client';
import { defaultConfig } from 'prisma/defaultOrgProfileSettings';
import { CustomAssessmentNumber } from '~/assessments/apricot/custom';
import { getLocalConfiguration } from '~/assessments/configurations';
import { AssessmentQuestion } from '~/assessments/types';
import { SchemaAssessmentAnswer } from '~/common/types/AssessmentSuggestionAndChoice';
import { AssessmentProcedureForm } from '.';
import { AssessmentStatusProvider } from '../../hooks/useAssessmentStatus';

const mockedQuestion = { id: 'medicationsCustomId' } as AssessmentQuestion;
const configuration = getLocalConfiguration('Accentra');

describe('<AssessmentProcedureForm />', () => {
	it('renders with edit button only, when row is not being edited', () => {
		const mockAnswer: Partial<SchemaAssessmentAnswer> = {
			patientId: 1,
			assessmentNumber: CustomAssessmentNumber.PROCEDURES,
			status: AssessmentAnswerSuggestionStatus.Completed,
		};
		cy.intercept('/api/trpc/patient.getById**', {
			statusCode: 200,
			body: [{ result: { data: { json: { SOCVisitDate: new Date() } } } }],
		});

		cy.intercept('/api/trpc/assessment.assessmentCheck**', {
			statusCode: 200,
			body: [{ result: { data: { json: {} } } }],
		}).as('assessmentCheck');
		cy.nextMount(
			<AssessmentStatusProvider>
				<AssessmentProcedureForm
					question={mockedQuestion}
					patientId={1}
					readOnly={false}
					configuration={configuration}
					additionalDropdownConfigurationInput={defaultConfig}
					answer={mockAnswer as SchemaAssessmentAnswer}
				/>
				,
			</AssessmentStatusProvider>,
		);
		cy.get('[data-cy=add-button]').click();
		cy.get('[data-cy=procedure-code-0]').type('ABC123');
		cy.get('[data-cy=procedure-description-0]').type(faker.lorem.sentence());
		cy.chooseFirstSelectElement('[data-cy=procedure-onsetexacerbation-0]');
		cy.get('[data-cy=procedure-date-0]').type('05/21/2024');
		cy.contains('Confirm').click();
		cy.wait('@assessmentCheck');
	});
});
