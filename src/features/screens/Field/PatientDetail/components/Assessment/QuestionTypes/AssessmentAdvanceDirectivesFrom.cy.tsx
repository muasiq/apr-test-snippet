import { faker } from '@faker-js/faker';
import { AssessmentAnswerSuggestionStatus } from '@prisma/client';
import { defaultConfig } from 'prisma/defaultOrgProfileSettings';
import SuperJSON from 'superjson';
import { CustomAssessmentNumber } from '~/assessments/apricot/custom';
import { informationLeftWithCaregiverOptions } from '~/server/api/routers/assessment/assessment.inputs';
import { getLocalConfiguration } from '../../../../../../../assessments/configurations';
import { AssessmentQuestion } from '../../../../../../../assessments/types';
import { SchemaAssessmentAnswer } from '../../../../../../../common/types/AssessmentSuggestionAndChoice';
import { AssessmentStatusProvider } from '../hooks/useAssessmentStatus';
import { AssessmentAdvanceDirectivesFrom } from './AssessmentAdvanceDirectivesFrom';

const configuration = getLocalConfiguration('Accentra');
const mockedQuestion = { id: CustomAssessmentNumber.ADVANCE_DIRECTIVES } as AssessmentQuestion;

describe('<AssessmentAdvanceDirectivesFrom />', () => {
	it('Allows adding an advance directive', () => {
		const mockAnswer: Partial<SchemaAssessmentAnswer> = {
			patientId: 1,
			assessmentNumber: CustomAssessmentNumber.ADVANCE_DIRECTIVES,
			status: AssessmentAnswerSuggestionStatus.Completed,
		};
		cy.intercept('/api/trpc/patient.getById**', {
			statusCode: 200,
			body: [{ result: { data: SuperJSON.serialize({ SOCVisitDate: new Date() }) } }],
		});

		cy.intercept('/api/trpc/assessment.assessmentCheck**', {
			statusCode: 200,
			body: [{ result: { data: { json: {} } } }],
		}).as('assessmentCheck');

		cy.nextMount(
			<AssessmentStatusProvider>
				<AssessmentAdvanceDirectivesFrom
					question={mockedQuestion}
					patientId={1}
					readOnly={false}
					configuration={configuration}
					additionalDropdownConfigurationInput={defaultConfig}
					answer={mockAnswer as SchemaAssessmentAnswer}
				/>
			</AssessmentStatusProvider>,
		);
		cy.get('[data-cy=add-button]').click();

		cy.chooseFirstSelectElement('[data-cy=advance-directive-type-0]');
		cy.get('[data-cy=advance-directive-type-0]').contains(defaultConfig.advanceDirectiveType[0]!);

		cy.chooseFirstSelectElement('[data-cy=advance-directive-contents-0]');
		cy.clickOutside();
		cy.get('[data-cy=advance-directive-contents-0]').contains(defaultConfig.advanceDirectiveContents[0]!);

		cy.get('[data-cy=advance-directive-location-0]').type(faker.lorem.word());

		cy.chooseFirstSelectElement('[data-cy=advance-directive-information-left-with-caregiver-0]');
		cy.get('[data-cy=advance-directive-information-left-with-caregiver-0]').contains(
			informationLeftWithCaregiverOptions[0],
		);

		cy.get('[data-cy=advance-directive-contact-name-0]').type(faker.person.fullName());

		cy.get('[data-cy=advance-directive-contact-phone-0]').type(faker.string.numeric(10));

		cy.get('[data-cy=advance-directive-contact-phone-0]').type(faker.string.numeric(10));

		cy.contains('Confirm').click();
		cy.wait('@assessmentCheck');
	});
});
