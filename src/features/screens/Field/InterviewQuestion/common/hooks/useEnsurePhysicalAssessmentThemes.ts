import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useShallowRouterQuery } from '~/common/hooks/useShallowRouterQuery';
import { PatientWithJoins } from '../../../../../../server/api/routers/patient/patient.types';

export const useEnsurePhysicalAssessmentThemes = (patientData: PatientWithJoins) => {
	const router = useRouter();
	const { push } = useShallowRouterQuery();

	useEffect(() => {
		if (!patientData?.NurseInterview) return;

		const selectedThemes = patientData.NurseInterview.selectedThemesToReportOn || [];
		const urlThemes = router.query.physicalAssessmentThemes as string[];

		const currentThemes = Array.isArray(urlThemes) ? urlThemes : urlThemes ? [urlThemes] : [];
		const themesNotInUrl = selectedThemes
			.filter((theme) => !currentThemes.includes(theme))
			.filter((t) => {
				return !patientData.InterviewQuestion.some((question) => question.interviewQuestionTheme === t);
			});

		if (themesNotInUrl.length) {
			const updatedThemes = currentThemes.concat(themesNotInUrl);
			const newQuery = {
				...router.query,
				physicalAssessmentThemes: updatedThemes,
			};
			push({ ...newQuery });
		}
	}, [patientData, push, router.query]);
};
