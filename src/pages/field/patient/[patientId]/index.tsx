import { PatientDetailScreen } from '~/features/screens/Field/PatientDetail';
import { AssessmentStatusProvider } from '../../../../features/screens/Field/PatientDetail/components/Assessment/hooks/useAssessmentStatus';

const PatientDetailPage = () => {
	return (
		<AssessmentStatusProvider>
			<PatientDetailScreen />
		</AssessmentStatusProvider>
	);
};

export default PatientDetailPage;
