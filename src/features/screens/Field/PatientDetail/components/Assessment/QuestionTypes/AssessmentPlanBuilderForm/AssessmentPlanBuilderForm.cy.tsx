import { AssessmentAnswerSuggestionStatus } from '@prisma/client';
import { kebabCase } from 'lodash';
import { defaultConfig } from 'prisma/defaultOrgProfileSettings';
import SuperJSON from 'superjson';
import { CustomAssessmentNumber } from '~/assessments/apricot/custom';
import { getLocalConfiguration } from '~/assessments/configurations';
import { AssessmentQuestion } from '~/assessments/types';
import { SchemaAssessmentAnswer } from '~/common/types/AssessmentSuggestionAndChoice';
import { AssessmentPlanBuilderForm } from '.';
import { AssessmentStatusProvider } from '../../hooks/useAssessmentStatus';

const mockedQuestion = { id: CustomAssessmentNumber.PLAN_BUILDER } as AssessmentQuestion;
const configuration = getLocalConfiguration('Accentra');

describe('<AssessmentPlanBuilderForm />', () => {
	beforeEach(() => {
		const mockAnswer: Partial<SchemaAssessmentAnswer> = {
			patientId: 1,
			assessmentNumber: CustomAssessmentNumber.PLAN_BUILDER,
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

		// textarea throwing an error https://github.com/mui/base-ui/issues/167
		cy.on('uncaught:exception', (err) => {
			if (err.message.includes('ResizeObserver loop completed with undelivered notifications')) {
				return false;
			}
		});

		cy.nextMount(
			<AssessmentStatusProvider>
				<AssessmentPlanBuilderForm
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
	});

	it('should be able to add categories and problems', () => {
		const pathway = configuration.pathways[1];
		const category = pathway?.problemCategory;
		const problem = pathway?.problemItems[0];
		const label = `(${problem?.treatmentCode}) ${problem?.problemItemClean}`;
		const value = problem?.problemItem;

		cy.chooseSelectElement('[data-cy=plan-builder-problem-categories]', category!, { multiSelect: true });
		cy.chooseSelectElement('[data-cy=plan-builder-problems-0]', label, { multiSelect: true });

		getInterventionDetailsInput(value).should('contain.value', problem?.interventionTemplate);
		getGoalDetailsInput(value).should('contain.value', problem?.goalTemplate);

		getInterventionDetailsInput(value).scrollIntoView().clear().type('intervention details');
		getGoalDetailsInput(value).scrollIntoView().clear().type('goal details');

		cy.contains('Confirm').click();

		cy.wait('@assessmentCheck').then(({ request }) => {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			expect(request.body[0].json.checkedResponse.choice.areas[0]).to.deep.include({
				category,
				problems: [
					{
						name: value,
						goalDetails: 'goal details',
						interventionDetails: 'intervention details',
					},
				],
			});
		});
	});
});

function getInterventionDetailsInput(problem = '') {
	return cy
		.get(`[data-cy=plan-builder-intervention-details-${kebabCase(problem)}]`)
		.find('textarea')
		.first();
}

function getGoalDetailsInput(problem = '') {
	return cy
		.get(`[data-cy=plan-builder-goal-details-${kebabCase(problem)}]`)
		.find('textarea')
		.first();
}
