import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import { Button } from '@mui/material';
import { PatientStatus } from '@prisma/client';
import { useRouter } from 'next/router';
import { trpc } from '~/common/utils/trpc';
import { useConfiguration } from '../../../../common/hooks/useConfiguration';
import { useShallowRouterQuery } from '../../../../common/hooks/useShallowRouterQuery';
import { RouterOutputs, api } from '../../../../common/utils/api';
import { UserActionPermissions } from '../../../../common/utils/permissions';
import { PermissionGuard } from '../../../ui/auth/PermissionGuard';
import { getStepNumberOfFirstUnfinishedSection } from '../../Field/PatientDetail/common/util/assessmentUtil';

type Props = {
	assessmentQuestionsForPatient: RouterOutputs['assessment']['getAllAssessmentQuestionsForPatient'] | undefined;
	patientStatus: PatientStatus;
};
export const OpenCloseQAButton = ({ assessmentQuestionsForPatient, patientStatus }: Props) => {
	const { configuration } = useConfiguration();
	const router = useRouter();
	const { push } = useShallowRouterQuery();
	const utils = trpc.useUtils();
	const { qaOpen, patientId, step } = router.query as { qaOpen: string; patientId: string; step?: string };
	const qaIsOpen = qaOpen === 'true';

	const patientQuery = api.patient.getById.useQuery({
		id: Number(patientId),
		includes: { NurseInterview: true },
	});

	const qaButtonDisabled = !configuration || !patientQuery.data;

	const { mutateAsync: generateAllSuggestionsMutate } =
		api.assessment.generateAllAssessmentSuggestionsForPatient.useMutation({
			onSuccess: () => {
				void utils.assessment.getAllAssessmentQuestionsForPatient.invalidate({ patientId: Number(patientId) });
			},
		});

	const generateAllSuggestions = () => {
		void generateAllSuggestionsMutate({ patientId: Number(patientId) });
	};

	const handleQAOnClick = () => {
		if (!configuration || !patientQuery.data) return;
		if (!qaIsOpen) generateAllSuggestions();

		const numberOfQuestionGeneratedSoFar = assessmentQuestionsForPatient?.length ?? 0;
		const batchLikelyStillRunningCount = 100;
		if (numberOfQuestionGeneratedSoFar < batchLikelyStillRunningCount) {
			push({ split: !qaIsOpen, qaOpen: !qaIsOpen, step: 1 });
			return;
		}
		const currentStep = step
			? step
			: getStepNumberOfFirstUnfinishedSection(assessmentQuestionsForPatient, configuration, patientQuery.data);

		push({ split: !qaIsOpen, qaOpen: !qaIsOpen, step: currentStep });
	};

	if (patientStatus === PatientStatus.WithQA || patientStatus === PatientStatus.SignoffNeeded) {
		return (
			<PermissionGuard neededPermission={UserActionPermissions.QA_TAB_VISIBLE}>
				<Button
					disabled={qaButtonDisabled}
					data-cy="open-close-qa-button"
					startIcon={qaIsOpen ? null : <KeyboardArrowLeft />}
					endIcon={qaIsOpen ? <KeyboardArrowRight /> : null}
					variant="text"
					onClick={handleQAOnClick}
				>
					{qaIsOpen ? 'Close QA' : 'Open QA'}
				</Button>
			</PermissionGuard>
		);
	}
};
