import { faker } from '@faker-js/faker';
import { AssessmentAnswerSuggestionStatus, State } from '@prisma/client';
import { defaultConfig } from 'prisma/defaultOrgProfileSettings';
import { CustomAssessmentNumber } from '~/assessments/apricot/custom';
import { getLocalConfiguration } from '~/assessments/configurations';
import { AssessmentQuestion } from '~/assessments/types';
import { SchemaAssessmentAnswer } from '~/common/types/AssessmentSuggestionAndChoice';
import { AssessmentFacilityForm } from '.';
import { AssessmentStatusProvider } from '../../hooks/useAssessmentStatus';

const mockedQuestion = { id: CustomAssessmentNumber.FACILITIES } as AssessmentQuestion;
const configuration = getLocalConfiguration('Accentra');

describe('<AssessmentFacilityForm />', () => {
	it('renders with edit button only, when row is not being edited', () => {
		const mockAnswer: Partial<SchemaAssessmentAnswer> = {
			patientId: 1,
			assessmentNumber: CustomAssessmentNumber.FACILITIES,
			status: AssessmentAnswerSuggestionStatus.Completed,
		};

		cy.intercept('/api/trpc/assessment.assessmentCheck**', {
			statusCode: 200,
			body: [{ result: { data: { json: {} } } }],
		}).as('assessmentCheck');

		const existingFacility = {
			id: 1,
			name: faker.company.name(),
			street: faker.location.street(),
			city: faker.location.city(),
			state: State.OK,
			phone: faker.string.numeric(10),
			fax: faker.string.numeric(10),
			facilityType: faker.company.buzzNoun(),
		};

		cy.intercept('/api/trpc/organization.getAssociatedFacilities**', {
			statusCode: 200,
			body: [
				{
					result: {
						data: {
							json: { list: [existingFacility], count: 1 },
						},
					},
				},
			],
		}).as('getAssociatedFacilities');

		cy.nextMount(
			<AssessmentStatusProvider>
				<AssessmentFacilityForm
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
		cy.wait('@getAssociatedFacilities');
		cy.get('[data-cy=custom-facility-name-0]').type(existingFacility.name.substring(0, 2));
		cy.chooseFirstSelectElement('[data-cy=custom-facility-name-0]');
		cy.get('[data-cy=custom-facility-contact-name-0]').type(faker.person.firstName());
		cy.contains('Confirm').click();
		cy.wait('@assessmentCheck');
	});
});
