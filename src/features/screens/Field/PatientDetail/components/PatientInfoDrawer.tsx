import { PatientArtifactTag } from '@prisma/client';
import { PatientDetailArtifactTab } from '~/features/screens/Office/PatientDetail/components/PatientDetailArtifactTab';
import { BottomDrawer } from '~/features/ui/layouts/BottomDrawer';
import { RouterBasedTabs, TabOptions } from '~/features/ui/layouts/RouterBasedTabs';
import { PatientWithJoins } from '../../../../../server/api/routers/patient/patient.types';
import { InformationTab } from '../../../Office/PatientDetail/InformationTab';
import { PatientDetailTabs } from '../../../Office/PatientDetail/components/PatientDetailTabView';

type Props = {
	open: boolean;
	close: () => void;
	patient: PatientWithJoins;
};

export const PatientInfoDrawer = ({ open, close, patient }: Props) => {
	const tabOptions: TabOptions = [
		{
			value: PatientDetailTabs.INFORMATION,
			label: 'Info',
			renderer: () => <InformationTab patientData={patient} />,
		},
		{
			value: PatientDetailTabs.DOCUMENTS,
			label: 'Docs',
			renderer: () => (
				<PatientDetailArtifactTab
					tagName={PatientArtifactTag.ReferralDocument}
					patientId={patient.id}
					patientArtifacts={patient.PatientArtifacts}
					patientStatus={patient.status}
					isFieldAppView={true}
				/>
			),
		},
		{
			value: PatientDetailTabs.MEDICATION,
			label: 'Meds',
			renderer: () => (
				<PatientDetailArtifactTab
					tagName={PatientArtifactTag.Medication}
					patientId={patient.id}
					patientArtifacts={patient.PatientArtifacts}
					patientStatus={patient.status}
					isFieldAppView={true}
				/>
			),
		},
		{
			value: PatientDetailTabs.WOUNDS,
			label: 'Wounds',
			renderer: () => (
				<PatientDetailArtifactTab
					tagName={PatientArtifactTag.Wounds}
					patientId={patient.id}
					patientArtifacts={patient.PatientArtifacts}
					patientStatus={patient.status}
					isFieldAppView={true}
				/>
			),
		},
	];

	return (
		<BottomDrawer noPadding isOpen={open} setIsOpen={() => close()} label="Patient Information">
			<RouterBasedTabs tabOptions={tabOptions} disableRipple={true} />
		</BottomDrawer>
	);
};
