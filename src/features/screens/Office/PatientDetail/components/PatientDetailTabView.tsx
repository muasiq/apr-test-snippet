import { Box, Stack, Typography } from '@mui/material';
import { PatientArtifactTag } from '@prisma/client';
import { compact } from 'lodash';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { RouterOutputs } from '~/common/utils/api';
import { hasSomeNurseInterviewData, isPostSignOffStatus } from '~/common/utils/patientStatusUtils';
import { hasActionPermission, UserActionPermissions } from '~/common/utils/permissions';
import { Pages } from '~/common/utils/showNavBars';
import { Review } from '~/features/screens/Field/InterviewQuestion/components/Review';
import { AssessmentStatusProvider } from '~/features/screens/Field/PatientDetail/components/Assessment/hooks/useAssessmentStatus';
import { BackButton } from '~/features/ui/buttons/BackButton';
import { PatientStatusChip } from '~/features/ui/chips/PatientStatusChip';
import { RouterBasedTabs, TabOptions } from '~/features/ui/layouts/RouterBasedTabs';
import { FULL_HEIGHT_MINUS_NAVBAR } from '~/features/ui/layouts/TopNav';
import theme from '~/styles/theme';
import { PatientWithJoins } from '../../../../../server/api/routers/patient/patient.types';
import { DeletePatientButton } from '../../../../ui/buttons/DeletePatientButton';
import { InformationTab } from '../InformationTab';
import { OpenCloseQAButton } from '../OpenCloseQAButton';
import { CompletedAssessmentTab } from './CompletedAssessmentTab';
import { DataEntryTab } from './DataEntryTab';
import { PatientDetailArtifactTab } from './PatientDetailArtifactTab';

export enum PatientDetailTabs {
	INFORMATION = 'Information',
	DOCUMENTS = 'Documents',
	MEDICATION = 'Medication',
	WOUNDS = 'Wounds',
	ASSESSMENT = 'Assessment',
	COMPLETED_DOCUMENTATION = 'Completed-Documentation',
	DATA_ENTRY = 'Data-Entry',
}

type Props = {
	patientData: PatientWithJoins;
	assessmentQuestionsForPatient: RouterOutputs['assessment']['getAllAssessmentQuestionsForPatient'] | undefined;
};

export const PatientDetailTabView = ({ patientData, assessmentQuestionsForPatient }: Props) => {
	const router = useRouter();
	const { data: session } = useSession();

	const { qaOpen, selectedArtifact } = router.query as {
		qaOpen: string;
		selectedArtifact: string;
	};

	const hasDataEntryPermission = hasActionPermission(UserActionPermissions.VIEW_DATA_ENTRY, session?.user.roles);

	const tabOptions: TabOptions = compact([
		{
			value: PatientDetailTabs.INFORMATION,
			label: 'Information',
			renderer: () => <InformationTab patientData={patientData} />,
		},
		{
			value: PatientDetailTabs.DOCUMENTS,
			label: 'Documents',
			renderer: () => (
				<PatientDetailArtifactTab
					tagName={PatientArtifactTag.ReferralDocument}
					patientId={patientData.id}
					patientArtifacts={patientData.PatientArtifacts}
					patientStatus={patientData.status}
					isFieldAppView={false}
				/>
			),
		},
		{
			value: PatientDetailTabs.MEDICATION,
			label: 'Medication',
			renderer: () => (
				<AssessmentStatusProvider>
					<PatientDetailArtifactTab
						tagName={PatientArtifactTag.Medication}
						patientId={patientData.id}
						patientArtifacts={patientData.PatientArtifacts}
						patientStatus={patientData.status}
						isFieldAppView={false}
					/>
				</AssessmentStatusProvider>
			),
		},
		{
			value: PatientDetailTabs.WOUNDS,
			label: 'Wounds',
			renderer: () => (
				<PatientDetailArtifactTab
					tagName={PatientArtifactTag.Wounds}
					patientId={patientData.id}
					patientArtifacts={patientData.PatientArtifacts}
					patientStatus={patientData.status}
					isFieldAppView={false}
				/>
			),
		},

		hasSomeNurseInterviewData(patientData?.status)
			? {
					value: PatientDetailTabs.ASSESSMENT,
					label: 'Assessment',
					renderer: () => <Review />,
				}
			: null,
		isPostSignOffStatus(patientData.status)
			? {
					value: PatientDetailTabs.COMPLETED_DOCUMENTATION,
					label: 'Completed Documentation',
					renderer: () => <CompletedAssessmentTab />,
				}
			: null,
		hasDataEntryPermission && isPostSignOffStatus(patientData.status)
			? {
					value: PatientDetailTabs.DATA_ENTRY,
					label: 'Data Entry',
					renderer: () => <DataEntryTab />,
				}
			: null,
	]);

	return (
		<>
			<Box
				display={'flex'}
				flexDirection={'column'}
				height={selectedArtifact ? 'auto' : FULL_HEIGHT_MINUS_NAVBAR}
			>
				<Stack direction="row" justifyContent={'space-between'} px={2} pt={2}>
					<Stack spacing={1}>
						<Box>
							<BackButton iconColor={theme.palette.primary.main} text={'Back'} />
						</Box>
						{selectedArtifact ? null : (
							<>
								<Box>
									<Stack direction={'row'} alignItems={'center'} spacing={1}>
										<Typography variant={'h4'}>
											{patientData.firstName} {patientData.lastName}
										</Typography>
										<DeletePatientButton
											patientId={patientData.id}
											onDeleteSuccess={() => router.push(Pages.OFFICE_PATIENT_LIST)}
										/>
									</Stack>
								</Box>
								<Box>
									<PatientStatusChip status={patientData.status} patientId={patientData.id} />
								</Box>
							</>
						)}
					</Stack>

					{qaOpen !== 'true' && (
						<Box>
							<OpenCloseQAButton
								patientStatus={patientData.status}
								assessmentQuestionsForPatient={assessmentQuestionsForPatient}
							/>
						</Box>
					)}
				</Stack>

				<RouterBasedTabs hideTabsList={!!selectedArtifact} tabOptions={tabOptions} />
			</Box>
		</>
	);
};
