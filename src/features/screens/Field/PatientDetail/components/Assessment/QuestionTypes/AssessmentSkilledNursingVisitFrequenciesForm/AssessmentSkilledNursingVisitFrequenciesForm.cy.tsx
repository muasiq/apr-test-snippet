import { faker } from '@faker-js/faker';
import { AssessmentAnswerSuggestionStatus } from '@prisma/client';
import { defaultConfig } from 'prisma/defaultOrgProfileSettings';
import superjson from 'superjson';
import { CustomAssessmentNumber } from '~/assessments/apricot/custom';
import { getLocalConfiguration } from '~/assessments/configurations';
import { AssessmentQuestion } from '~/assessments/types';
import { SchemaAssessmentAnswer } from '~/common/types/AssessmentSuggestionAndChoice';
import { AssessmentSkilledNursingVisitFrequenciesForm } from '.';
import { AssessmentStatusProvider } from '../../hooks/useAssessmentStatus';

const configuration = getLocalConfiguration('Accentra');
const mockedQuestion = { id: CustomAssessmentNumber.SKILLED_NURSING_VISIT_FREQUENCIES } as AssessmentQuestion;

const fakeCode = faker.company.buzzVerb();
const fakeDescription = faker.company.buzzVerb();

const samplePatient = superjson.serialize({
	SOCVisitDate: new Date(),
	Organization: { SkilledNursingServiceCodes: [{ code: fakeCode, description: fakeDescription }] },
});

describe('<AssessmentSkilledNursingVisitFrequenciesForm />', () => {
	it('Allows adding a nursing visit frequency', () => {
		const mockAnswer: Partial<SchemaAssessmentAnswer> = {
			patientId: 1,
			assessmentNumber: CustomAssessmentNumber.SKILLED_NURSING_VISIT_FREQUENCIES,
			status: AssessmentAnswerSuggestionStatus.Completed,
		};
		cy.intercept('/api/trpc/patient.getById**', {
			statusCode: 200,
			body: [{ result: { data: samplePatient } }],
		}).as('getPatient');

		cy.intercept('/api/trpc/assessment.assessmentCheck**', {
			statusCode: 200,
			body: [{ result: { data: { json: {} } } }],
		}).as('assessmentCheck');

		cy.nextMount(
			<AssessmentStatusProvider>
				<AssessmentSkilledNursingVisitFrequenciesForm
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

		cy.wait('@getPatient');
		cy.contains('Remove').click();
		cy.contains('Confirm').click();
		cy.contains('Please add at least one').should('be.visible');
		cy.get('[data-cy=add-button]').click();
		cy.chooseFirstSelectElement('[data-cy=service-code-0]', { multiSelect: true });
		cy.get('[data-cy=number-of-weeks-0]').type(faker.number.int({ min: 1, max: 9 }).toString());
		cy.get('[data-cy=frequency-0]').click();
		cy.contains('2x Weekly').click();

		cy.get('[data-cy=days-of-week-0]').click();
		cy.contains('Monday').click();
		cy.contains('Tuesday').click();
		cy.clickOutside();

		const [year] = new Date().toISOString().split('-');
		cy.get('[data-cy=end-date-0]').find('input').should('contain.value', year!);
		cy.contains('Confirm').click();
		cy.wait('@assessmentCheck');
	});
});
