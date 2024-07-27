import { AssessmentAnswerSuggestionStatus } from '@prisma/client';
import { defaultConfig } from 'prisma/defaultOrgProfileSettings';
import { CustomAssessmentNumber } from '~/assessments/apricot/custom';
import { getLocalConfiguration } from '~/assessments/configurations';
import { AssessmentQuestion } from '~/assessments/types';
import { SchemaAssessmentAnswer } from '~/common/types/AssessmentSuggestionAndChoice';
import { AssessmentVitalSignParametersForm } from '.';
import { AssessmentStatusProvider } from '../../hooks/useAssessmentStatus';

const mockedQuestion = { id: 'medicationsCustomId' } as AssessmentQuestion;
const configuration = getLocalConfiguration('Accentra');

describe('<AssessmentVitalSignParametersForm />', () => {
	it('renders with edit button only, when row is not being edited', () => {
		const mockAnswer: Partial<SchemaAssessmentAnswer> = {
			patientId: 1,
			assessmentNumber: CustomAssessmentNumber.VITAL_SIGN_PARAMETERS,
			status: AssessmentAnswerSuggestionStatus.Completed,
		};
		const defaultParamConfig = {
			id: 1,
			name: 'Default Configuration',
			organizationId: 1,
			temperatureMax: 100,
			temperatureMin: 90,
		};
		cy.intercept('/api/trpc/organization.getVitalSignConfigs**', {
			statusCode: 200,
			body: [
				{
					result: {
						data: {
							json: [defaultParamConfig],
						},
					},
				},
			],
		});

		cy.intercept('/api/trpc/assessment.assessmentCheck**', {
			statusCode: 200,
			body: [{ result: { data: { json: {} } } }],
		}).as('assessmentCheck');
		cy.nextMount(
			<AssessmentStatusProvider>
				<AssessmentVitalSignParametersForm
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
		cy.get('[data-cy=vital-sign-profile-select]').click();
		cy.contains(defaultParamConfig.name).click();
		cy.contains('view parameters').click();
		cy.get('[data-cy=vital-sign-temperatureMax]')
			.find('input')
			.invoke('val')
			.should('equal', defaultParamConfig.temperatureMax.toString());
		cy.get('[data-cy=vital-sign-temperatureMin]')
			.find('input')
			.invoke('val')
			.should('equal', defaultParamConfig.temperatureMin.toString());
		cy.get('[data-cy=vital-sign-pulseMax]').type('101');
		cy.get('[data-cy=vital-sign-profile-select]').contains('Custom');
		cy.contains('Save').click();
		cy.contains('Confirm').click();
		cy.wait('@assessmentCheck');
	});
});
