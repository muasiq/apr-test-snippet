import { Skeleton, Stack, ToggleButton, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { NurseInterviewPhysicalAssessmentThemes } from '../../../../../assessments/nurse-interview/questions';
import { useShallowRouterQuery } from '../../../../../common/hooks/useShallowRouterQuery';
import { PatientWithJoins } from '../../../../../server/api/routers/patient/patient.types';
import { useStartOrResumeInterview } from '../../PatientDetail/common/hooks/useStartOrResumeInterview';
import { InterviewState } from '../common/interviewState';
import { BackForward } from './AnswerQuestion/BackForward';
import { saveInterviewSetupQuestion } from './SyncInterviewSetupQuestions';

type Props = {
	patientData: PatientWithJoins;
};
export const AreasToReportOn = ({ patientData }: Props): JSX.Element => {
	const router = useRouter();
	const { patientId, didUploadWounds } = router.query as { patientId: string; didUploadWounds: string };
	const { selectedThemesToReportOn } = useStartOrResumeInterview();
	const [selections, setSelections] = useState<NurseInterviewPhysicalAssessmentThemes[]>([]);
	const [loadingSelections, setLoadingSelections] = useState(true);
	const { push } = useShallowRouterQuery();

	useEffect(() => {
		const resolve = async () => {
			const existing = await selectedThemesToReportOn(patientData.NurseInterview, Number(patientId));
			const backup = didUploadWounds === 'true' ? [NurseInterviewPhysicalAssessmentThemes.Wounds] : [];
			const resolvedSelections = existing?.length
				? (existing as NurseInterviewPhysicalAssessmentThemes[])
				: backup;
			setSelections(resolvedSelections);
			setLoadingSelections(false);
		};
		void resolve();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [patientId, didUploadWounds]);

	const pushSelections = async () => {
		await saveInterviewSetupQuestion({
			patientId: Number(patientId),
			selectedThemesToReportOn: selections,
		});

		push({ interviewState: InterviewState.INITIAL_DICTATION_CHOICE });
	};

	return (
		<>
			<Typography sx={{ textAlign: 'center' }} px={3} pt={4} variant="h4">
				What would you like to report on?
			</Typography>
			<Typography variant="body2" textAlign={'center'} mt={1} mb={2}>
				Select all categories with unique, irregular, or abnormal findings. All others will be marked
				&quot;within normal limits&quot; or “not applicable” by default.
			</Typography>
			<Stack
				pb={10}
				sx={{ overflowY: 'scroll', height: '65vh' }}
				alignItems={'center'}
				direction="column"
				spacing={2}
			>
				{Object.values(NurseInterviewPhysicalAssessmentThemes).map((theme, i) => {
					if (loadingSelections) return <Skeleton key={i} width={'90%'} />;
					return (
						<ToggleButton
							data-cy={theme}
							color="primary"
							sx={{ borderRadius: '16px', width: '90%' }}
							key={theme}
							selected={selections.includes(theme)}
							onChange={() => {
								if (selections.includes(theme)) {
									setSelections(selections.filter((selection) => selection !== theme));
								} else {
									setSelections([...selections, theme]);
								}
							}}
							value={theme}
						>
							{theme}
						</ToggleButton>
					);
				})}
			</Stack>
			<BackForward
				onBack={() => push({ interviewState: InterviewState.PHOTO_UPLOAD_DOCUMENTATION })}
				onForward={pushSelections}
				forwardDisabled={!selections.length}
			/>
		</>
	);
};
