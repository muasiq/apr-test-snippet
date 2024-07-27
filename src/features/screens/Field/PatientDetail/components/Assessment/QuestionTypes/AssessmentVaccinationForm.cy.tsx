import { faker } from '@faker-js/faker';
import { AssessmentAnswerSuggestionStatus } from '@prisma/client';
import { defaultConfig } from 'prisma/defaultOrgProfileSettings';
import { CustomAssessmentNumber } from '~/assessments/apricot/custom';
import { getLocalConfiguration } from '../../../../../../../assessments/configurations';
import { AssessmentQuestion } from '../../../../../../../assessments/types';
import { SchemaAssessmentAnswer } from '../../../../../../../common/types/AssessmentSuggestionAndChoice';
import { AssessmentStatusProvider } from '../hooks/useAssessmentStatus';
import { AssessmentVaccinationForm } from './AssessmentVaccinationForm';

const configuration = getLocalConfiguration('Accentra');
const mockedQuestion = { id: CustomAssessmentNumber.VACCINATIONS } as AssessmentQuestion;

describe('<AssessmentVaccinationForm />', () => {
	it('Allows adding a vaccine', () => {
		const mockAnswer: Partial<SchemaAssessmentAnswer> = {
			patientId: 1,
			assessmentNumber: CustomAssessmentNumber.VACCINATIONS,
			status: AssessmentAnswerSuggestionStatus.Completed,
		};

		cy.intercept('/api/trpc/assessment.assessmentCheck**', {
			statusCode: 200,
			body: [{ result: { data: { json: {} } } }],
		}).as('assessmentCheck');

		cy.nextMount(
			<AssessmentStatusProvider>
				<AssessmentVaccinationForm
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
		cy.chooseFirstSelectElement('[data-cy=vaccine-type-0]');
		cy.chooseFirstSelectElement('[data-cy=vaccine-administered-by-0]');
		cy.get('[data-cy=vaccine-administer-date-0]').type('02022021');
		cy.get('[data-cy=vaccine-notes-0]').type(faker.lorem.sentence());

		cy.contains('Confirm').click();
		cy.wait('@assessmentCheck');
	});
});
