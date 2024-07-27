import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { serialize } from '~/assessments/apricot/visit-note/serializeConfig';
import { useConfiguration } from '~/common/hooks/useConfiguration';
import { SchemaAssessmentAnswer } from '~/common/types/AssessmentSuggestionAndChoice';
import { api } from '~/common/utils/api';
import { LoadingSpinner } from '~/features/ui/loading/LoadingSpinner';
import { PatientWithJoinsInclude } from '~/server/api/routers/patient/patient.types';
import { SerializedConfigAccordion } from './SerializedConfigAccordion';

export const DataEntryTab = () => {
	const { configuration } = useConfiguration();
	const router = useRouter();
	const { patientId } = router.query as { patientId: string };

	const { data: patientData, isLoading: isLoadingPatientData } = api.patient.getById.useQuery({
		id: Number(patientId),
		includes: PatientWithJoinsInclude,
	});

	const { data: assessmentQuestionsForPatient, isLoading: isLoadingQuestions } =
		api.assessment.getAllAssessmentQuestionsForPatient.useQuery({
			patientId: Number(patientId),
		});

	const loading =
		isLoadingQuestions || isLoadingPatientData || !assessmentQuestionsForPatient || !patientData || !configuration;

	const serializedDataEntryConfig = useMemo(() => {
		if (!patientData || !configuration || !assessmentQuestionsForPatient) {
			return [];
		}

		const dataEntryConfig = configuration.backOfficeCompletedConfig.filter((d) => d.heading !== 'Visit Note');

		return serialize(
			dataEntryConfig,
			{
				patientData,
				configuration,
				answers: assessmentQuestionsForPatient as SchemaAssessmentAnswer[],
			},
			{ includeExplanations: false },
		);
	}, [assessmentQuestionsForPatient, configuration, patientData]);

	if (loading) return <LoadingSpinner />;

	return <SerializedConfigAccordion config={serializedDataEntryConfig} />;
};
