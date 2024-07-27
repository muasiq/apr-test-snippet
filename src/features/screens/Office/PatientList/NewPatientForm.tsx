import { zodResolver } from '@hookform/resolvers/zod';
import { Close } from '@mui/icons-material';
import { Box, Divider, IconButton, Stack, Typography } from '@mui/material';
import { Patient } from '@prisma/client';
import { useRouter } from 'next/router';
import { Control, useForm, UseFormSetValue } from 'react-hook-form';

import { useSession } from 'next-auth/react';
import { hasActionPermission, UserActionPermissions } from '~/common/utils/permissions';
import { UnicornButton } from '~/features/ui/buttons/UnicornButton';
import { LoadingSpinner } from '~/features/ui/loading/LoadingSpinner';
import { If } from '~/features/ui/util/If';
import { AssessmentCheckInput } from '~/server/api/routers/assessment/assessment.inputs';
import { AdditionalDropdownConfigurationInput } from '~/server/api/routers/organization/organization.inputs';
import { useAlert } from '../../../../common/hooks/useAlert';
import { api } from '../../../../common/utils/api';
import { trpc } from '../../../../common/utils/trpc';
import { CreatePatientInput, createPatientSchema } from '../../../../server/api/routers/patient/patient.inputs';
import { LoadingButton } from '../../../ui/loading/LoadingButton';
import { PatientDetailTabs } from '../PatientDetail/components/PatientDetailTabView';
import { AssociatedPhysician } from './PatientInformation/AssociatedPhysician';
import { BasicInformation } from './PatientInformation/BasicInformation';
import { ContactInformation } from './PatientInformation/ContactInformation';
import { EmergencyContact } from './PatientInformation/EmergencyContact';
import { PatientDiagnosisForm } from './PatientInformation/PatientDiagnosisForm';
import { PayorSource } from './PatientInformation/PayorSource';
import { ReferralSource } from './PatientInformation/ReferralSource';
import { ServiceLocation } from './PatientInformation/ServiceLocation';
import { SocVisit } from './PatientInformation/SocVisit';

type Props = {
	closeForm: () => void;
};
export const NewPatientForm = ({ closeForm }: Props): JSX.Element => {
	const router = useRouter();
	const trpcUtils = trpc.useUtils();
	const alert = useAlert();
	const { data: currentSession } = useSession();
	const orgQuery = api.organization.getUserOrganization.useQuery();
	const additionalDropdownsConfig = orgQuery.data
		?.additionalDropdownConfiguration as AdditionalDropdownConfigurationInput;
	const { handleSubmit, control, setValue, getValues } = useForm<CreatePatientInput>({
		resolver: zodResolver(createPatientSchema),
		defaultValues: {
			checkedResponse: {
				choice: {
					diagnoses: [
						{
							diagnosisCode: '',
							diagnosisDescription: '',
							symptomControlRating: '',
							onsetOrExacerbation: '',
							dateOfOnsetOrExacerbation: new Date(),
						},
					],
				},
			},
			PatientAssociatedPhysicians: [
				{
					name: '',
					referringPhysician: 'NO',
					phone: '',
				},
			],
		},
	});

	const createPatient = api.patient.create.useMutation({
		onSuccess: (data: Patient) => {
			alert.addSuccessAlert({
				message: 'New Patient Created',
			});
			void trpcUtils.patient.getInfinite.invalidate({});
			closeForm();
			void router.push(`/office/patient/${data.id}?currentTab=${PatientDetailTabs.INFORMATION}`);
		},
		onError: (error) => {
			alert.addErrorAlert({
				message: 'Error Saving Patient - ' + error.message,
			});
		},
	});

	const onError = (errors: object) => {
		console.log('errors with the form', errors);
	};

	const onSubmit = (data: CreatePatientInput) => {
		createPatient.mutate(data);
	};

	if (orgQuery.isLoading) {
		return <LoadingSpinner />;
	}

	const canGenerateSamplePatients = hasActionPermission(
		UserActionPermissions.GENERATE_TEST_DATA,
		currentSession?.user.roles,
	);

	function navigateToDemoPatientWizard() {
		void router.push('/office/wizard');
	}

	return (
		<>
			<Box
				position="relative"
				minHeight="100vh"
				height={'100%'}
				width={'50vw'}
				minWidth={{ xs: '100vw', sm: '60vw', md: '50vw' }}
			>
				<Stack
					p={3}
					sx={{ backgroundColor: 'white', zIndex: 9999 }}
					width="100%"
					direction={'row'}
					justifyContent={'space-between'}
					top={0}
					position={'sticky'}
				>
					<Typography variant={'h4'}>New Patient</Typography>
					<IconButton onClick={closeForm} data-cy="cancel-new-patient-button">
						<Close />
					</IconButton>
				</Stack>
				<Divider />
				<Stack component="form" p={3} direction="column" spacing={3}>
					<If condition={canGenerateSamplePatients}>
						<UnicornButton disabled={false} onClick={navigateToDemoPatientWizard} />
					</If>
					<BasicInformation control={control} configurationType={orgQuery.data?.configurationType} />
					<SocVisit control={control} />
					<ServiceLocation
						control={control}
						serviceLocationTypeOptions={additionalDropdownsConfig.serviceLocations}
						setValue={setValue}
						getValues={getValues}
					/>
					<ContactInformation control={control} />
					<EmergencyContact
						control={control}
						emergencyContactTypeOptions={additionalDropdownsConfig.emergencyContactType}
						relationshipTypeOptions={additionalDropdownsConfig.patientContactRelationship}
						availabilityTypeOptions={additionalDropdownsConfig.patientContactAvailability}
					/>

					<PatientDiagnosisForm
						control={control as unknown as Control<AssessmentCheckInput>}
						setValue={setValue as unknown as UseFormSetValue<AssessmentCheckInput>}
					/>
					<ReferralSource control={control} facilityTypeOptions={additionalDropdownsConfig.facilityType} />
					<AssociatedPhysician control={control} />
					<PayorSource control={control} payorSourceTypeOptions={additionalDropdownsConfig.payorType} />
				</Stack>
				<Box p={3} width="100%">
					<LoadingButton
						data-cy="add-new-patient-button"
						label="Add New Patient"
						isLoading={createPatient.isLoading}
						onClick={handleSubmit(onSubmit, onError)}
						fullWidth
						variant={'contained'}
					/>
				</Box>
			</Box>
		</>
	);
};
