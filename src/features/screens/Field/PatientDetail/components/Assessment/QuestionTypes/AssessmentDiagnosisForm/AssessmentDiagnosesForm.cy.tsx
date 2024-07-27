import { AssessmentAnswerSuggestionStatus } from '@prisma/client';
import { format } from 'date-fns';
import { defaultConfig } from 'prisma/defaultOrgProfileSettings';
import SuperJSON from 'superjson';
import { AssessmentDiagnosisForm } from '.';
import { getLocalConfiguration } from '../../../../../../../../assessments/configurations';
import { AssessmentQuestion } from '../../../../../../../../assessments/types';
import { SchemaAssessmentAnswer } from '../../../../../../../../common/types/AssessmentSuggestionAndChoice';
import { AssessmentStatusProvider } from '../../hooks/useAssessmentStatus';

const mockedQuestion = { id: 'diagnoses_custom' } as AssessmentQuestion;
const configuration = getLocalConfiguration('Accentra');

describe('<AssessmentDiagnosisForm />', () => {
	it('Allows adding a diagnosis', () => {
		const mockAnswer: Partial<SchemaAssessmentAnswer> = {
			patientId: 1,
			assessmentNumber: 'diagnoses_custom',
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
				<AssessmentDiagnosisForm
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
		cy.get('[data-cy=diagnosis-code-0]').type('A');
		cy.contains('A00.0').click();
		cy.get('[data-cy=diagnosis-description-0]').contains('Cholera due to Vibrio cholerae 01, biovar cholerae');
		cy.chooseFirstSelectElement('[data-cy=symptom-control-rating-0');
		cy.chooseFirstSelectElement('[data-cy=onset-or-exacerbation-0');
		cy.get('[data-cy=date-of-onset-or-exacerbation-0]').type(format(new Date('2024-05-24'), '05/24/2024'));
		cy.contains('Confirm').click();
		cy.wait('@assessmentCheck');
	});
});
