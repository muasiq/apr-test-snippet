import { CheckCircle, Error, Lock } from '@mui/icons-material';
import { Box, Card, CardActions, CardContent, Stack, Typography } from '@mui/material';
import { uniq } from 'lodash';
import { useRouter } from 'next/router';
import { CopyButton } from '~/features/ui/buttons/CopyButton';
import { AdditionalDropdownConfigurationInput } from '~/server/api/routers/organization/organization.inputs';
import { Configuration } from '../../../../../../../../assessments/configurations';
import {
	AssessmentQuestion,
	AssessmentQuestionSources,
	AssessmentQuestionType,
} from '../../../../../../../../assessments/types';
import { lookupQuestion } from '../../../../../../../../assessments/util/lookupQuestionUtil';
import { SchemaAssessmentAnswer } from '../../../../../../../../common/types/AssessmentSuggestionAndChoice';
import { responseMatches } from '../../../../../../../../common/utils/responseMatches';
import theme from '../../../../../../../../styles/theme';
import { LoadingButton } from '../../../../../../../ui/loading/LoadingButton';
import { If } from '../../../../../../../ui/util/If';
import { PatientDetailTabs } from '../../../../../../Office/PatientDetail/components/PatientDetailTabView';
import { OpenPromptIterate } from '../../../../../../Office/PromptIterate/OpenPromptIterate';
import { AssessmentQuestionTypeSwitch } from '../../AssessmentQuestionTypeSwitch';
import { SuggestedHeader } from './SuggestedHeader';

type Props = {
	question: AssessmentQuestion;
	formValue: string | number | string[];
	patientId: number;
	allAnswers: SchemaAssessmentAnswer[];
	explanation?: string;
	id: string;
	questionText: string;
	onAccept: () => void;
	onRetrySuggestion: () => void;
	loading: boolean;
	configuration: Configuration;
	additionalDropdownConfigurationInput: AdditionalDropdownConfigurationInput;
	loadingGuess: boolean;
	hasValue: boolean;
	hasError: boolean;
	hasAcceptedValue: boolean;
	valueHasBeenEdited: boolean;
	readOnly: boolean;
	multipleIndex?: number;
	print?: boolean;
	loadingText?: string;
	children?: React.ReactNode;
};
export const QuestionWrapper = ({
	question,
	formValue,
	patientId,
	allAnswers,
	explanation,
	id,
	configuration,
	additionalDropdownConfigurationInput,
	questionText,
	onAccept,
	onRetrySuggestion,
	children,
	loading,
	loadingGuess,
	hasValue,
	hasAcceptedValue,
	hasError,
	loadingText,
	multipleIndex,
	readOnly,
	print = false,
	valueHasBeenEdited,
}: Props) => {
	const router = useRouter();
	const isFieldAppView = router.pathname.startsWith('/field');
	const isQaView = router.asPath.includes('qaOpen=true');
	const isCompletedDocumentationTab = router.query.currentTab === PatientDetailTabs.COMPLETED_DOCUMENTATION;

	const response = question.responses?.filter((r) => responseMatches(formValue, r.text)) ?? [];
	const followUp = uniq(response?.flatMap((r) => (r.followup ? r.followup : [])));
	const showCopyButton =
		[AssessmentQuestionType.FreeForm, AssessmentQuestionType.LongText].includes(question.mappedType) &&
		isCompletedDocumentationTab;

	const displayIcon = readOnly ? (
		<Lock />
	) : hasAcceptedValue && !valueHasBeenEdited ? (
		<CheckCircle color="success" />
	) : (
		<Error color="primary" />
	);

	if (print) {
		return (
			<Stack>
				<Stack direction={'row'} justifyContent={'space-between'}>
					<Typography mb={2} variant="body1">
						{question.source === AssessmentQuestionSources.Oasis ? `(${id}) ` : ''}
						{question.source === AssessmentQuestionSources.Pathways && question.treatmentCode
							? `(${question.treatmentCode}) `
							: ''}
						{questionText}
					</Typography>
					{children}
				</Stack>

				{followUp.map((q) => {
					const lookedUpFollowup = lookupQuestion(q, configuration);
					return (
						<Box key={lookedUpFollowup.id} pl={2}>
							<AssessmentQuestionTypeSwitch
								configuration={configuration}
								additionalDropdownConfigurationInput={additionalDropdownConfigurationInput}
								key={lookedUpFollowup.id}
								question={lookedUpFollowup}
								patientId={patientId}
								allAnswers={allAnswers}
								isSpawn={true}
								readOnly={readOnly}
								multipleIndex={multipleIndex}
								print={print}
							/>
						</Box>
					);
				})}
			</Stack>
		);
	}

	return (
		<Stack>
			<Stack>
				<Stack direction={{ xs: 'column', md: 'row' }} justifyContent={'space-between'}>
					<Typography mb={2} variant="body1b">
						{question.source === AssessmentQuestionSources.Oasis ? `(${id}) ` : ''}
						{question.source === AssessmentQuestionSources.Pathways && question.treatmentCode
							? `(${question.treatmentCode}) `
							: ''}
						{questionText}
					</Typography>
					<Stack direction={'row'} justifyContent={{ xs: 'end', md: 'center' }} alignItems={'center'}>
						<If condition={showCopyButton}>
							<CopyButton getTextToCopy={() => formValue.toString()} />
						</If>
						<OpenPromptIterate assessmentNumber={question.id} source={question.source} />
						{!isFieldAppView && displayIcon}
					</Stack>
				</Stack>
				<Card elevation={0} sx={{ bgcolor: 'transparent' }}>
					<SuggestedHeader
						loadingText={loadingText}
						loadingGuess={loadingGuess}
						hasAcceptedValue={hasAcceptedValue}
					/>
					<CardContent sx={{ px: 0, py: 1 }}>
						{children}
						{isQaView && explanation && (
							<Typography color={'text.secondary'} variant="helper">
								{explanation}
							</Typography>
						)}
						{hasError && !hasAcceptedValue && (
							<Box mt={2}>
								<Typography color={theme.palette.error.main} variant="body1">
									We could not generate a suggestion. you my retry by clicking &quot;Retry
									Suggestion&quot;
								</Typography>
							</Box>
						)}
					</CardContent>
					<CardActions sx={{ px: 0 }}>
						{hasValue && !readOnly && (!hasAcceptedValue || valueHasBeenEdited) && (
							<LoadingButton
								variant="outlined"
								disabled={!hasValue}
								label={'Confirm'}
								isLoading={loading}
								onClick={() => onAccept()}
								sx={{ color: theme.palette.secondary.main }}
							></LoadingButton>
						)}
						{hasError && !hasAcceptedValue && (
							<LoadingButton
								label={'Retry Suggestion'}
								isLoading={loading || loadingGuess}
								onClick={onRetrySuggestion}
								sx={{ color: theme.palette.secondary.main }}
							></LoadingButton>
						)}
						{!hasAcceptedValue &&
							!loading &&
							(question.mappedType === AssessmentQuestionType.FreeForm ||
								question.mappedType === AssessmentQuestionType.LongText) && (
								<LoadingButton
									label={'Regenerate Suggestion'}
									isLoading={loading || loadingGuess}
									onClick={onRetrySuggestion}
								></LoadingButton>
							)}
					</CardActions>
				</Card>
			</Stack>
			{followUp.map((q) => {
				const lookedUpFollowup = lookupQuestion(q, configuration);
				return (
					<Box key={lookedUpFollowup.id} borderLeft={`1px solid ${theme.palette.secondary.light}`} pl={2}>
						<AssessmentQuestionTypeSwitch
							configuration={configuration}
							additionalDropdownConfigurationInput={additionalDropdownConfigurationInput}
							key={lookedUpFollowup.id}
							question={lookedUpFollowup}
							patientId={patientId}
							allAnswers={allAnswers}
							isSpawn={true}
							readOnly={readOnly}
							multipleIndex={multipleIndex}
							print={print}
						/>
					</Box>
				);
			})}
		</Stack>
	);
};
