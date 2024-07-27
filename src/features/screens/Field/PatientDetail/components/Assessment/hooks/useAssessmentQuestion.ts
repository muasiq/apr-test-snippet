import { zodResolver } from '@hookform/resolvers/zod';
import { AssessmentAnswerSuggestionStatus } from '@prisma/client';
import { isDate, isEmpty, isNumber } from 'lodash';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { hasAcceptedAnswer } from '~/assessments/util/assessmentStateUtils';
import { AssessmentQuestion } from '../../../../../../../assessments/types';
import { useAlert } from '../../../../../../../common/hooks/useAlert';
import { useEffectOnce } from '../../../../../../../common/hooks/useEffectOnce';
import {
	GeneratedResponse,
	SchemaAssessmentAnswer,
} from '../../../../../../../common/types/AssessmentSuggestionAndChoice';
import { addMultipleIndex } from '../../../../../../../common/utils/addMultipleIndex';
import { RouterOutputs, api } from '../../../../../../../common/utils/api';
import { trpc } from '../../../../../../../common/utils/trpc';
import {
	AssessmentCheckInput,
	CheckedResponseUnion,
	assessmentCheckSchema,
} from '../../../../../../../server/api/routers/assessment/assessment.inputs';
import { PatientDetailTabs } from '../../../../../Office/PatientDetail/components/PatientDetailTabView';
import { useAssessmentStatus } from './useAssessmentStatus';

export const useAssessmentQuestion = (
	question: AssessmentQuestion,
	patientId: number,
	checkedResponse: CheckedResponseUnion,
	answer?: SchemaAssessmentAnswer,
	isSpawn = false,
	multipleIndex?: number,
	{ onSuccess }: { onSuccess?: (data: RouterOutputs['assessment']['assessmentCheck']) => void } = {},
) => {
	const router = useRouter();
	const canCopy = router.query.currentTab === PatientDetailTabs.COMPLETED_DOCUMENTATION;
	const fieldName = 'checkedResponse.choice';
	const alert = useAlert();
	const { setQuestionState } = useAssessmentStatus();
	const trpcUtils = trpc.useUtils();
	const resolvedAssessmentNumber = addMultipleIndex(question.id, multipleIndex);
	const form = useForm<AssessmentCheckInput>({
		resolver: zodResolver(assessmentCheckSchema),
		defaultValues: {
			patientId,
			assessmentNumber: resolvedAssessmentNumber,
			checkedResponse,
		},
	});
	const { handleSubmit, control, watch, setValue, formState, reset, getValues } = form;

	const { mutate, isLoading } = api.assessment.assessmentCheck.useMutation({
		onSuccess: (res) => {
			reset(getValues());
			void trpcUtils.assessment.getAllAssessmentQuestionsForPatient.invalidate({ patientId });
			void trpcUtils.assessment.getAssessmentQuestionForPatient.invalidate({ patientId });
			alert.addSuccessAlert({
				message: 'Documentation Item Saved',
			});
			onSuccess?.(res);
		},
		onError: (error) => {
			console.error('Error updating Assessment question', error);
			alert.addErrorAlert({
				message: 'Error updating Assessment question - ' + error.message,
			});
		},
	});

	const onError = (errors: object) => {
		console.log('errors with the form', errors);
	};

	const onSubmit = (data: AssessmentCheckInput) => {
		mutate(data);
	};

	const {
		mutate: runGuess,
		isLoading: isLoadingSpawnedGuess,
		data: guessResponse,
	} = api.assessment.generateAssessmentAnswer.useMutation({
		onSuccess: (res) => {
			const choice = (res?.generatedResponse as { choice: never })?.choice;
			const alreadyHasAcceptedValue = !isEmpty(res.checkedResponse);
			if (choice) {
				if (!alreadyHasAcceptedValue) {
					setValue('checkedResponse.choice', choice);
				}
			}
			void trpcUtils.assessment.getAllAssessmentQuestionsForPatient.invalidate({ patientId });
		},
		onError: (error) => {
			alert.addErrorAlert({
				title: 'Error generating guess',
				message: error.message,
			});
		},
	});

	const guess = (retry = false) => {
		runGuess({ patientId, assessmentNumber: resolvedAssessmentNumber, retry });
		void trpcUtils.assessment.getAllAssessmentQuestionsForPatient.invalidate({ patientId });
	};

	useEffectOnce(() => {
		if (!answer && !isLoadingSpawnedGuess && isSpawn) {
			console.info('running suggestion for ', resolvedAssessmentNumber);
			void guess();
		}
	});

	const generatedResponse = (guessResponse as GeneratedResponse | undefined)?.generatedResponse;
	const runTimeExplanation = generatedResponse?.explanation;
	const formValue = watch(fieldName) as number | string | string[];
	const hasValue = choiceHasValue(formValue);
	const hasAcceptedValue = hasAcceptedAnswer(answer);
	const hasError = !isLoadingSpawnedGuess && answer?.status === AssessmentAnswerSuggestionStatus.Failed;
	const valueHasBeenEdited = !isEmpty(formState.touchedFields) || formState.isDirty;

	useEffect(() => {
		setQuestionState(question.id, {
			valueHasBeenEdited,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [valueHasBeenEdited, question.id]);

	return {
		handleSubmit,
		control,
		isLoading,
		isLoadingGuess: isLoadingGuess(isLoadingSpawnedGuess, answer),
		runTimeExplanation,
		onSubmit,
		onError,
		onRetrySuggestion: () => guess(true),
		hasValue,
		hasError,
		hasAcceptedValue,
		valueHasBeenEdited,
		formValue,
		fieldName: fieldName as 'checkedResponse.choice',
		getValues,
		watch,
		reset,
		setValue,
		form,
		canCopy,
	};
};

const choiceHasValue = (formValue: CheckedResponseUnion['choice']): boolean => {
	return formValue != 'null' && (isDate(formValue) || isNumber(formValue) || !isEmpty(formValue));
};

export const isLoadingGuess = (isLoadingSpawnedGuess: boolean, answer?: SchemaAssessmentAnswer): boolean => {
	if (isLoadingSpawnedGuess) {
		return true;
	}
	if (!answer) {
		return true;
	}
	if (answer.status === AssessmentAnswerSuggestionStatus.Failed) {
		return false;
	}
	return (
		answer.status === AssessmentAnswerSuggestionStatus.Queued ||
		answer.status === AssessmentAnswerSuggestionStatus.InProgress
	);
};
