import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { getVisitNoteConfig } from '~/assessments/apricot/visit-note';
import { serialize } from '~/assessments/apricot/visit-note/serializeConfig';
import { useConfiguration } from '~/common/hooks/useConfiguration';
import { SchemaAssessmentAnswer } from '~/common/types/AssessmentSuggestionAndChoice';
import { api } from '~/common/utils/api';
import { LoadingSpinner } from '~/features/ui/loading/LoadingSpinner';
import { PatientWithJoinsInclude } from '~/server/api/routers/patient/patient.types';
import { DownloadVisitNote } from './DownloadVisitNote';
import { SerializedConfigAccordion } from './SerializedConfigAccordion';

export const CompletedAssessmentTab = () => {
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

	const additionalConfigQuery = api.organization.getAdditionalDropdownConfiguration.useQuery();

	const loading =
		isLoadingQuestions || isLoadingPatientData || !assessmentQuestionsForPatient || !patientData || !configuration;

	const serializedVisitNoteConfig = useMemo(() => {
		if (!patientData || !configuration || !assessmentQuestionsForPatient) {
			return [];
		}

		return serialize(
			getVisitNoteConfig(configuration),
			{
				patientData,
				configuration,
				answers: assessmentQuestionsForPatient as SchemaAssessmentAnswer[],
			},
			{ includeExplanations: true },
		);
	}, [assessmentQuestionsForPatient, configuration, patientData]);

	if (loading || additionalConfigQuery.isLoading) return <LoadingSpinner />;

	return (
		<>
			{/* Useful for debugging the pdf */}
			{/* {patientData && configuration && assessmentQuestionsForPatient && (
				<PDFViewer style={{ width: '100%', height: 600 }}>
					<VisitNote
						configuration={configuration}
						patientData={patientData}
						answers={assessmentQuestionsForPatient as SchemaAssessmentAnswer[]}
					/>
				</PDFViewer>
			)} */}
			<DownloadVisitNote patientData={patientData} />
			<SerializedConfigAccordion config={serializedVisitNoteConfig} />
		</>
	);
};
